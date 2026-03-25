const Property = require("../models/Property");
const { stripHtml, escapeRegex, isValidCloudinaryUrl } = require("../utils/sanitize");
const { ALLOWED_AMENITIES, PROTECTED_FIELDS } = require("../utils/constants");
const { maskPhone, maskEmail } = require("../utils/maskContact");

// Get all properties with search, filter, sort, pagination
const getProperties = async (req, res) => {
  try {
    const {
      listingType,
      propertyType,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      furnishing,
      search,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { status: "active" };

    if (listingType) filter.listingType = listingType;
    if (propertyType) filter.propertyType = propertyType;
    if (city) filter["location.city"] = { $regex: escapeRegex(city), $options: "i" };
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (furnishing) filter.furnishing = furnishing;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { "location.city": { $regex: safeSearch, $options: "i" } },
        { "location.area": { $regex: safeSearch, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    // Cap limit to prevent excessive data retrieval
    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 12));
    const skip = (safePage - 1) * safeLimit;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Property.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch properties" });
  }
};

// Get single property by ID
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).lean();

    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    // Increment view count only if viewer is not the property owner
    const isOwner = req.user && property.vendorId.toString() === req.user._id.toString();
    if (!isOwner) {
      await Property.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    }

    // Replace full contact with masked versions for public access
    const data = {
      ...property,
      maskedPhone: maskPhone(property.contactPhone),
      maskedEmail: maskEmail(property.contactEmail),
    };
    delete data.contactPhone;
    delete data.contactEmail;

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch property" });
  }
};

// Create a new property
const createProperty = async (req, res) => {
  try {
    const {
      listingType, propertyType, title, description, price,
      location, bedrooms, bathrooms, areaSqft, furnishing,
      amenities, images, video, contactPhone, contactEmail,
    } = req.body;

    // Required field validation
    if (!listingType || !["sale", "rent"].includes(listingType)) {
      return res.status(400).json({ success: false, error: "Listing type must be sale or rent" });
    }
    if (!propertyType || !["flat", "house", "plot", "commercial"].includes(propertyType)) {
      return res.status(400).json({ success: false, error: "Property type must be flat, house, plot, or commercial" });
    }
    if (!title || title.trim().length < 5 || title.trim().length > 100) {
      return res.status(400).json({ success: false, error: "Title must be between 5 and 100 characters" });
    }
    if (!description || description.trim().length < 20 || description.trim().length > 1000) {
      return res.status(400).json({ success: false, error: "Description must be between 20 and 1000 characters" });
    }
    if (!price || Number(price) <= 0) {
      return res.status(400).json({ success: false, error: "Price must be a positive number" });
    }
    if (!location || !location.city || !location.area || !location.state) {
      return res.status(400).json({ success: false, error: "City, area, and state are required" });
    }
    if (location.pincode && !/^\d{6}$/.test(location.pincode)) {
      return res.status(400).json({ success: false, error: "Pincode must be exactly 6 digits" });
    }
    if (!contactPhone || !/^[6-9]\d{9}$/.test(contactPhone)) {
      return res.status(400).json({ success: false, error: "Enter a valid 10-digit Indian phone number" });
    }
    if (!contactEmail || !/^\S+@\S+\.\S+$/.test(contactEmail)) {
      return res.status(400).json({ success: false, error: "Enter a valid email address" });
    }

    // Conditional validation for flat/house
    const isResidential = propertyType === "flat" || propertyType === "house";
    if (isResidential) {
      if (!bedrooms || Number(bedrooms) < 1 || Number(bedrooms) > 10) {
        return res.status(400).json({ success: false, error: "Bedrooms must be between 1 and 10" });
      }
      if (!bathrooms || Number(bathrooms) < 1 || Number(bathrooms) > 10) {
        return res.status(400).json({ success: false, error: "Bathrooms must be between 1 and 10" });
      }
      if (!furnishing || !["furnished", "semi-furnished", "unfurnished"].includes(furnishing)) {
        return res.status(400).json({ success: false, error: "Furnishing must be furnished, semi-furnished, or unfurnished" });
      }
    }

    // Validate amenities against allowed list
    if (amenities && Array.isArray(amenities)) {
      const invalid = amenities.filter((a) => !ALLOWED_AMENITIES.includes(a));
      if (invalid.length > 0) {
        return res.status(400).json({ success: false, error: `Invalid amenities: ${invalid.join(", ")}` });
      }
    }

    // Validate images array
    if (images && (!Array.isArray(images) || images.length > 10)) {
      return res.status(400).json({ success: false, error: "Maximum 10 images allowed" });
    }
    // Validate image URLs are from Cloudinary to prevent storing malicious URLs
    if (images && Array.isArray(images)) {
      const invalidUrl = images.find((url) => !isValidCloudinaryUrl(url));
      if (invalidUrl) {
        return res.status(400).json({ success: false, error: "Invalid image URL detected" });
      }
    }
    // Validate video URL if provided
    if (video && !isValidCloudinaryUrl(video)) {
      return res.status(400).json({ success: false, error: "Invalid video URL detected" });
    }

    // Build property data
    const propertyData = {
      vendorId: req.user._id,
      listingType,
      propertyType,
      title: stripHtml(title),
      description: stripHtml(description),
      price: Number(price),
      location: {
        city: stripHtml(location.city),
        area: stripHtml(location.area),
        state: stripHtml(location.state),
        pincode: location.pincode || undefined,
      },
      contactPhone,
      contactEmail: contactEmail.toLowerCase().trim(),
      status: "active",
      planType: "free",
      viewCount: 0,
      contactUnlockCount: 0,
    };

    // Add conditional fields
    if (isResidential) {
      propertyData.bedrooms = Number(bedrooms);
      propertyData.bathrooms = Number(bathrooms);
      propertyData.furnishing = furnishing;
    }
    if (areaSqft && Number(areaSqft) > 0) {
      propertyData.areaSqft = Number(areaSqft);
    }
    if (amenities && amenities.length > 0) {
      propertyData.amenities = amenities;
    }
    if (images && images.length > 0) {
      propertyData.images = images;
    }
    if (video) {
      propertyData.video = video;
    }

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      data: {
        _id: property._id,
        vendorId: property.vendorId,
        title: property.title,
        status: property.status,
        createdAt: property.createdAt,
      },
    });
  } catch (error) {
    console.error("Create property error:", error);
    res.status(500).json({ success: false, error: "Failed to create property. Please try again." });
  }
};

// Get logged-in user's properties
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ vendorId: req.user._id })
      .select("title price listingType propertyType location images status viewCount contactUnlockCount createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch your listings" });
  }
};

// Update a property (owner only)
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }
    if (property.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "You can only edit your own properties" });
    }

    // Strip protected fields
    PROTECTED_FIELDS.forEach((field) => delete req.body[field]);

    // Sanitize string fields if present
    if (req.body.title) req.body.title = stripHtml(req.body.title);
    if (req.body.description) req.body.description = stripHtml(req.body.description);
    if (req.body.location) {
      if (req.body.location.city) req.body.location.city = stripHtml(req.body.location.city);
      if (req.body.location.area) req.body.location.area = stripHtml(req.body.location.area);
      if (req.body.location.state) req.body.location.state = stripHtml(req.body.location.state);
    }
    if (req.body.contactEmail) req.body.contactEmail = req.body.contactEmail.toLowerCase().trim();

    // Convert number fields
    if (req.body.price) req.body.price = Number(req.body.price);
    if (req.body.bedrooms) req.body.bedrooms = Number(req.body.bedrooms);
    if (req.body.bathrooms) req.body.bathrooms = Number(req.body.bathrooms);
    if (req.body.areaSqft) req.body.areaSqft = Number(req.body.areaSqft);

    // Validate amenities if provided
    if (req.body.amenities && Array.isArray(req.body.amenities)) {
      const invalid = req.body.amenities.filter((a) => !ALLOWED_AMENITIES.includes(a));
      if (invalid.length > 0) {
        return res.status(400).json({ success: false, error: `Invalid amenities: ${invalid.join(", ")}` });
      }
    }

    // Validate phone if provided
    if (req.body.contactPhone && !/^[6-9]\d{9}$/.test(req.body.contactPhone)) {
      return res.status(400).json({ success: false, error: "Enter a valid 10-digit Indian phone number" });
    }

    // Validate email if provided
    if (req.body.contactEmail && !/^\S+@\S+\.\S+$/.test(req.body.contactEmail)) {
      return res.status(400).json({ success: false, error: "Enter a valid email address" });
    }

    // Validate pincode if provided
    if (req.body.location?.pincode && !/^\d{6}$/.test(req.body.location.pincode)) {
      return res.status(400).json({ success: false, error: "Pincode must be exactly 6 digits" });
    }

    // Validate image URLs if provided
    if (req.body.images && Array.isArray(req.body.images)) {
      const invalidUrl = req.body.images.find((url) => !isValidCloudinaryUrl(url));
      if (invalidUrl) {
        return res.status(400).json({ success: false, error: "Invalid image URL detected" });
      }
    }
    // Validate video URL if provided
    if (req.body.video && !isValidCloudinaryUrl(req.body.video)) {
      return res.status(400).json({ success: false, error: "Invalid video URL detected" });
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("_id title status updatedAt").lean();

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({ success: false, error: "Failed to update property" });
  }
};

// Delete a property (owner only)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }
    if (property.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "You can only delete your own properties" });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: { message: "Property deleted successfully" } });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete property" });
  }
};

// Toggle property status (owner only)
const togglePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["active", "paused"].includes(status)) {
      return res.status(400).json({ success: false, error: "Status must be active or paused" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }
    if (property.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "You can only change status of your own properties" });
    }

    property.status = status;
    await property.save();

    res.status(200).json({ success: true, data: { _id: property._id, status: property.status } });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update property status" });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  togglePropertyStatus,
};
