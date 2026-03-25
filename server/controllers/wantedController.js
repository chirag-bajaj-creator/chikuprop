const WantedProperty = require("../models/WantedProperty");
const { maskPhone, maskEmail } = require("../utils/maskContact");

const stripHtml = (str) => str.replace(/<[^>]*>/g, "").trim();

// GET /api/wanted — list active wanted properties (public)
const getWantedProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      propertyType,
      listingType,
      minBudget,
      maxBudget,
      search,
    } = req.query;

    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 12));
    const skip = (safePage - 1) * safeLimit;

    const filter = { status: "active" };

    if (city) filter["location.city"] = { $regex: new RegExp(`^${city}$`, "i") };
    if (propertyType) filter.propertyType = propertyType;
    if (listingType) filter.listingType = listingType;
    if (minBudget) filter["budget.max"] = { $gte: Number(minBudget) };
    if (maxBudget) filter["budget.min"] = { $lte: Number(maxBudget) };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [properties, total] = await Promise.all([
      WantedProperty.find(filter)
        .populate("userId", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      WantedProperty.countDocuments(filter),
    ]);

    // Mask contact info for non-authenticated users
    const isAuthenticated = !!req.user;
    const masked = properties.map((p) => ({
      ...p,
      contactPhone: isAuthenticated ? p.contactPhone : maskPhone(p.contactPhone),
      contactEmail: isAuthenticated ? p.contactEmail : maskEmail(p.contactEmail),
    }));

    res.status(200).json({
      success: true,
      data: masked,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error("Get wanted properties error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch wanted properties" });
  }
};

// POST /api/wanted — create wanted property (protected)
const createWanted = async (req, res) => {
  try {
    const { title, description, propertyType, listingType, budget, location, bedrooms, contactPhone, contactEmail } = req.body;

    if (!title || !description || !propertyType || !listingType || !budget || !location || !contactPhone || !contactEmail) {
      return res.status(400).json({ success: false, error: "All required fields must be provided" });
    }

    // Type checks
    if (typeof title !== "string" || typeof description !== "string" || typeof contactPhone !== "string" || typeof contactEmail !== "string") {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    const sanitizedTitle = stripHtml(title);
    const sanitizedDesc = stripHtml(description);

    if (sanitizedTitle.length < 5 || sanitizedTitle.length > 100) {
      return res.status(400).json({ success: false, error: "Title must be 5–100 characters" });
    }
    if (sanitizedDesc.length < 20 || sanitizedDesc.length > 1000) {
      return res.status(400).json({ success: false, error: "Description must be 20–1000 characters" });
    }

    if (!budget.min || !budget.max || Number(budget.min) > Number(budget.max)) {
      return res.status(400).json({ success: false, error: "Invalid budget range" });
    }

    if (!location.city || !location.state) {
      return res.status(400).json({ success: false, error: "City and state are required" });
    }

    const wanted = await WantedProperty.create({
      userId: req.user._id,
      title: sanitizedTitle,
      description: sanitizedDesc,
      propertyType,
      listingType,
      budget: { min: Number(budget.min), max: Number(budget.max) },
      location: {
        city: stripHtml(String(location.city)),
        area: location.area ? stripHtml(String(location.area)) : "",
        state: stripHtml(String(location.state)),
      },
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
    });

    res.status(201).json({ success: true, data: wanted });
  } catch (error) {
    console.error("Create wanted error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages[0] });
    }
    res.status(500).json({ success: false, error: "Failed to create wanted property" });
  }
};

// GET /api/wanted/mine — get current user's wanted posts (protected)
const getMyWanted = async (req, res) => {
  try {
    const properties = await WantedProperty.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("Get my wanted error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch your wanted properties" });
  }
};

// PUT /api/wanted/:id — update own wanted post (protected)
const updateWanted = async (req, res) => {
  try {
    const wanted = await WantedProperty.findById(req.params.id);
    if (!wanted) {
      return res.status(404).json({ success: false, error: "Wanted property not found" });
    }
    if (wanted.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized to update this post" });
    }

    const allowed = ["title", "description", "propertyType", "listingType", "budget", "location", "bedrooms", "contactPhone", "contactEmail", "status"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === "title" || key === "description") {
          updates[key] = stripHtml(String(req.body[key]));
        } else if (key === "budget") {
          updates[key] = { min: Number(req.body[key].min), max: Number(req.body[key].max) };
        } else if (key === "location") {
          updates[key] = {
            city: stripHtml(String(req.body[key].city || "")),
            area: req.body[key].area ? stripHtml(String(req.body[key].area)) : "",
            state: stripHtml(String(req.body[key].state || "")),
          };
        } else {
          updates[key] = req.body[key];
        }
      }
    }

    const updated = await WantedProperty.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Update wanted error:", error);
    res.status(500).json({ success: false, error: "Failed to update wanted property" });
  }
};

// DELETE /api/wanted/:id — delete own wanted post (protected)
const deleteWanted = async (req, res) => {
  try {
    const wanted = await WantedProperty.findById(req.params.id);
    if (!wanted) {
      return res.status(404).json({ success: false, error: "Wanted property not found" });
    }
    if (wanted.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized to delete this post" });
    }

    await WantedProperty.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: { message: "Wanted property deleted" } });
  } catch (error) {
    console.error("Delete wanted error:", error);
    res.status(500).json({ success: false, error: "Failed to delete wanted property" });
  }
};

module.exports = { getWantedProperties, createWanted, getMyWanted, updateWanted, deleteWanted };
