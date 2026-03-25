import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { createProperty, updateProperty } from "../../services/propertyService";
import StepIndicator from "./StepIndicator";
import ImageUploader from "./ImageUploader";
import VideoUploader from "./VideoUploader";
import { INDIAN_STATES, SUPPORTED_CITIES, AMENITIES_LIST } from "../../utils/constants";
import "./PropertyForm.css";

const INITIAL_FORM_DATA = {
  listingType: "sale",
  propertyType: "",
  title: "",
  description: "",
  price: "",
  city: "",
  area: "",
  state: "",
  pincode: "",
  bedrooms: "",
  bathrooms: "",
  furnishing: "",
  areaSqft: "",
  amenities: [],
  images: [],
  video: "",
  contactPhone: "",
  contactEmail: "",
};

const PROPERTY_TYPES = [
  { value: "flat", label: "Flat", icon: "\uD83C\uDFE2" },
  { value: "house", label: "House", icon: "\uD83C\uDFE0" },
  { value: "plot", label: "Plot", icon: "\uD83D\uDDFA" },
  { value: "commercial", label: "Commercial", icon: "\uD83C\uDFEC" },
];

const BEDROOM_OPTIONS = [1, 2, 3, 4, "5+"];
const BATHROOM_OPTIONS = [1, 2, 3, "4+"];

function PropertyForm({ mode = "add", initialData, onSubmitSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Pre-fill from initialData (edit mode) or from localStorage (pending property)
  // Runs once when initialData is first provided (ref-stable via useMemo in parent)
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialData && !initialized) {
      const mapped = {
        listingType: initialData.listingType || "sale",
        propertyType: initialData.propertyType || "",
        title: initialData.title || "",
        description: initialData.description || "",
        price: initialData.price ? String(initialData.price) : "",
        city: initialData.location?.city || "",
        area: initialData.location?.area || "",
        state: initialData.location?.state || "",
        pincode: initialData.location?.pincode || "",
        bedrooms: initialData.bedrooms ? String(initialData.bedrooms) : "",
        bathrooms: initialData.bathrooms ? String(initialData.bathrooms) : "",
        furnishing: initialData.furnishing || "",
        areaSqft: initialData.areaSqft ? String(initialData.areaSqft) : "",
        amenities: initialData.amenities || [],
        images: initialData.images || [],
        video: initialData.video || "",
        contactPhone: initialData.contactPhone || "",
        contactEmail: initialData.contactEmail || "",
      };
      setFormData(mapped);
      setInitialized(true);
      if (mode === "edit") {
        setCompletedSteps([0, 1, 2, 3, 4]);
      } else if (mode === "add" && initialData._pendingRestore) {
        setCompletedSteps([0, 1, 2, 3, 4]);
        setCurrentStep(4);
      }
    }
  }, [initialData, mode, initialized]);

  // Pre-fill contact info from user profile when logged in
  useEffect(() => {
    if (user && mode === "add") {
      setFormData((prev) => ({
        ...prev,
        contactPhone: prev.contactPhone || user.phone || "",
        contactEmail: prev.contactEmail || user.email || "",
      }));
    }
  }, [user, mode]);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const toggleAmenity = useCallback((amenity) => {
    setFormData((prev) => {
      const current = prev.amenities;
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter((a) => a !== amenity) };
      }
      if (current.length >= 10) return prev;
      return { ...prev, amenities: [...current, amenity] };
    });
  }, []);

  const needsResidentialFields = formData.propertyType === "flat" || formData.propertyType === "house";

  // Per-step validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.propertyType) newErrors.propertyType = "Select a property type";
      if (!formData.title.trim()) newErrors.title = "Title is required";
      else if (formData.title.trim().length < 5) newErrors.title = "Title must be at least 5 characters";
      else if (formData.title.trim().length > 100) newErrors.title = "Title must be under 100 characters";
      if (!formData.description.trim()) newErrors.description = "Description is required";
      else if (formData.description.trim().length < 20) newErrors.description = "Description must be at least 20 characters";
      else if (formData.description.trim().length > 1000) newErrors.description = "Description must be under 1000 characters";
    }

    if (step === 1) {
      if (!formData.price) newErrors.price = "Price is required";
      else if (Number(formData.price) <= 0) newErrors.price = "Price must be a positive number";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.area.trim()) newErrors.area = "Area / Locality is required";
      if (!formData.state) newErrors.state = "State is required";
      if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Pincode must be exactly 6 digits";
      }
    }

    if (step === 2) {
      if (needsResidentialFields) {
        if (!formData.bedrooms) newErrors.bedrooms = "Select number of bedrooms";
        if (!formData.bathrooms) newErrors.bathrooms = "Select number of bathrooms";
        if (!formData.furnishing) newErrors.furnishing = "Select furnishing status";
      }
      if (formData.areaSqft && Number(formData.areaSqft) <= 0) {
        newErrors.areaSqft = "Area must be a positive number";
      }
    }

    // Step 3 (media) has no required fields
    if (step === 3) {
      // No validation needed — images and video are optional
    }

    if (step === 4) {
      if (!formData.contactPhone.trim()) newErrors.contactPhone = "Phone number is required";
      else if (!/^[6-9]\d{9}$/.test(formData.contactPhone.trim())) {
        newErrors.contactPhone = "Enter a valid 10-digit Indian phone number";
      }
      if (!formData.contactEmail.trim()) newErrors.contactEmail = "Email is required";
      else if (!/^\S+@\S+\.\S+/.test(formData.contactEmail.trim())) {
        newErrors.contactEmail = "Enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const newCompleted = completedSteps.includes(currentStep)
      ? completedSteps
      : [...completedSteps, currentStep];
    setCompletedSteps(newCompleted);

    if (currentStep < 4) {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const buildPayload = () => {
    const payload = {
      listingType: formData.listingType,
      propertyType: formData.propertyType,
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      location: {
        city: formData.city,
        area: formData.area.trim(),
        state: formData.state,
        ...(formData.pincode ? { pincode: formData.pincode.trim() } : {}),
      },
      contactPhone: formData.contactPhone.trim(),
      contactEmail: formData.contactEmail.trim(),
    };

    if (needsResidentialFields) {
      payload.bedrooms = formData.bedrooms === "5+" ? 5 : Number(formData.bedrooms);
      payload.bathrooms = formData.bathrooms === "4+" ? 4 : Number(formData.bathrooms);
      payload.furnishing = formData.furnishing;
    }

    if (formData.areaSqft) payload.areaSqft = Number(formData.areaSqft);
    if (formData.amenities.length > 0) payload.amenities = formData.amenities;
    if (formData.images.length > 0) payload.images = formData.images;
    if (formData.video) payload.video = formData.video;

    return payload;
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    // If not logged in (add mode), trigger login prompt
    if (!user && mode === "add") {
      // Save form data to localStorage
      const pendingData = {
        ...formData,
        savedStep: 4,
        savedAt: Date.now(),
      };
      localStorage.setItem("pendingProperty", JSON.stringify(pendingData));
      setShowLoginPrompt(true);
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();

      if (mode === "add") {
        await createProperty(payload);
        // Clear any pending property data
        localStorage.removeItem("pendingProperty");
        showToast("Property listed successfully!", "success");
        navigate("/my-listings", { replace: true });
      } else {
        await updateProperty(initialData._id, payload);
        showToast("Property updated successfully!", "success");
        if (onSubmitSuccess) {
          onSubmitSuccess();
        } else {
          navigate("/my-listings", { replace: true });
        }
      }
    } catch (err) {
      const message = err.response?.data?.error || "Something went wrong. Please try again.";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginRedirect = (path) => {
    navigate(`${path}?redirect=/add-property`);
  };

  const formatIndianPrice = (num) => {
    if (!num) return "";
    const n = Number(num);
    if (isNaN(n)) return "";
    return n.toLocaleString("en-IN");
  };

  const getSpecsStepTitle = () => {
    if (formData.propertyType === "plot") return "Plot Details";
    if (formData.propertyType === "commercial") return "Commercial Space Details";
    return "Property Specifications";
  };

  // Login prompt overlay for unauthenticated users
  if (showLoginPrompt) {
    return (
      <div className="pf-login-prompt">
        <h3>One last step -- sign in to publish</h3>
        <p>Your property details are saved. Sign in or create an account to publish your listing.</p>
        <div className="pf-login-actions">
          <button
            className="btn-primary"
            onClick={() => handleLoginRedirect("/login")}
          >
            Sign In
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleLoginRedirect("/register")}
          >
            Create Account
          </button>
        </div>
        <small>Your listing details will be waiting for you after sign-in.</small>
      </div>
    );
  }

  return (
    <div className="property-form">
      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />

      {/* Step 1: Basic Details */}
      {currentStep === 0 && (
        <div className="pf-step">
          <h3 className="pf-step-title">Basic Details</h3>

          <div className="form-group">
            <label>Listing Type</label>
            <div className="pf-toggle-group">
              <button
                type="button"
                className={`pf-toggle-btn${formData.listingType === "sale" ? " pf-toggle-active" : ""}`}
                onClick={() => updateField("listingType", "sale")}
              >
                Sale
              </button>
              <button
                type="button"
                className={`pf-toggle-btn${formData.listingType === "rent" ? " pf-toggle-active" : ""}`}
                onClick={() => updateField("listingType", "rent")}
              >
                Rent
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Property Type</label>
            <div className="pf-type-cards">
              {PROPERTY_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  className={`pf-type-card${formData.propertyType === pt.value ? " pf-type-active" : ""}`}
                  onClick={() => updateField("propertyType", pt.value)}
                >
                  <span className="pf-type-icon">{pt.icon}</span>
                  <span className="pf-type-label">{pt.label}</span>
                </button>
              ))}
            </div>
            {errors.propertyType && <span className="field-error">{errors.propertyType}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pf-title">Title</label>
            <input
              type="text"
              id="pf-title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Spacious 3BHK in Koramangala"
              maxLength={100}
              aria-describedby={errors.title ? "pf-title-error" : undefined}
            />
            <div className="pf-char-counter">{formData.title.length}/100</div>
            {errors.title && <span className="field-error" id="pf-title-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pf-description">Description</label>
            <textarea
              id="pf-description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe your property — features, condition, surroundings..."
              maxLength={1000}
              rows={4}
              aria-describedby={errors.description ? "pf-desc-error" : undefined}
            />
            <div className="pf-char-counter">{formData.description.length}/1000</div>
            {errors.description && <span className="field-error" id="pf-desc-error">{errors.description}</span>}
          </div>
        </div>
      )}

      {/* Step 2: Location & Pricing */}
      {currentStep === 1 && (
        <div className="pf-step">
          <h3 className="pf-step-title">Location & Pricing</h3>

          <div className="form-group">
            <label htmlFor="pf-price">Price (INR)</label>
            <div className="pf-price-wrapper">
              <span className="pf-price-prefix">INR</span>
              <input
                type="number"
                id="pf-price"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="e.g. 2500000"
                min="1"
              />
            </div>
            {formData.price && Number(formData.price) > 0 && (
              <span className="pf-price-display">{formatIndianPrice(formData.price)}</span>
            )}
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pf-city">City</label>
            <select
              id="pf-city"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
            >
              <option value="">Select city</option>
              {SUPPORTED_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pf-area">Area / Locality</label>
            <input
              type="text"
              id="pf-area"
              value={formData.area}
              onChange={(e) => updateField("area", e.target.value)}
              placeholder="e.g. Koramangala, Bandra West"
            />
            {errors.area && <span className="field-error">{errors.area}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pf-state">State</label>
            <select
              id="pf-state"
              value={formData.state}
              onChange={(e) => updateField("state", e.target.value)}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            {errors.state && <span className="field-error">{errors.state}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pf-pincode">Pincode (optional)</label>
            <input
              type="text"
              id="pf-pincode"
              value={formData.pincode}
              onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="e.g. 560034"
              maxLength={6}
            />
            {errors.pincode && <span className="field-error">{errors.pincode}</span>}
          </div>
        </div>
      )}

      {/* Step 3: Specifications */}
      {currentStep === 2 && (
        <div className="pf-step">
          <h3 className="pf-step-title">{getSpecsStepTitle()}</h3>

          {needsResidentialFields && (
            <>
              <div className="form-group">
                <label>Bedrooms</label>
                <div className="pf-number-selector">
                  {BEDROOM_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`pf-number-btn${formData.bedrooms === String(opt) ? " pf-number-active" : ""}`}
                      onClick={() => updateField("bedrooms", String(opt))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {errors.bedrooms && <span className="field-error">{errors.bedrooms}</span>}
              </div>

              <div className="form-group">
                <label>Bathrooms</label>
                <div className="pf-number-selector">
                  {BATHROOM_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`pf-number-btn${formData.bathrooms === String(opt) ? " pf-number-active" : ""}`}
                      onClick={() => updateField("bathrooms", String(opt))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {errors.bathrooms && <span className="field-error">{errors.bathrooms}</span>}
              </div>

              <div className="form-group">
                <label>Furnishing</label>
                <div className="pf-toggle-group pf-toggle-group-3">
                  {["furnished", "semi-furnished", "unfurnished"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`pf-toggle-btn${formData.furnishing === f ? " pf-toggle-active" : ""}`}
                      onClick={() => updateField("furnishing", f)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1).replace("-", " ")}
                    </button>
                  ))}
                </div>
                {errors.furnishing && <span className="field-error">{errors.furnishing}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="pf-area-sqft">Area (sq.ft.)</label>
            <input
              type="number"
              id="pf-area-sqft"
              value={formData.areaSqft}
              onChange={(e) => updateField("areaSqft", e.target.value)}
              placeholder="e.g. 1200"
              min="1"
            />
            {errors.areaSqft && <span className="field-error">{errors.areaSqft}</span>}
          </div>

          <div className="form-group">
            <label>Amenities</label>
            <div className="pf-amenities-grid">
              {AMENITIES_LIST.map((amenity) => (
                <label key={amenity} className="pf-amenity-item">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                  <span className="pf-amenity-label">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Photos & Video */}
      {currentStep === 3 && (
        <div className="pf-step">
          <h3 className="pf-step-title">Photos & Video</h3>

          <ImageUploader
            images={formData.images}
            onChange={(imgs) => updateField("images", imgs)}
            disabled={!user && mode === "add"}
          />

          <div className="pf-media-divider" />

          <VideoUploader
            video={formData.video}
            onChange={(url) => updateField("video", url)}
            disabled={!user && mode === "add"}
          />

          {!user && mode === "add" && (
            <div className="pf-media-login-note">
              <p>Sign in to upload photos and videos. You can skip this step and add them later.</p>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Contact & Review */}
      {currentStep === 4 && (
        <div className="pf-step">
          <h3 className="pf-step-title">Contact & Review</h3>

          <div className="form-group">
            <label htmlFor="pf-phone">Contact Phone</label>
            <div className="pf-price-wrapper">
              <span className="pf-price-prefix">+91</span>
              <input
                type="tel"
                id="pf-phone"
                value={formData.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
            {errors.contactPhone && <span className="field-error">{errors.contactPhone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pf-email">Contact Email</label>
            <input
              type="email"
              id="pf-email"
              value={formData.contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              placeholder="you@example.com"
            />
            {errors.contactEmail && <span className="field-error">{errors.contactEmail}</span>}
          </div>

          {/* Review summary */}
          <div className="pf-review">
            <h4 className="pf-review-heading">Review Your Listing</h4>

            <div className="pf-review-section">
              <div className="pf-review-section-header">
                <span>Basic Details</span>
                <button className="pf-review-edit" onClick={() => goToStep(0)}>Edit</button>
              </div>
              <div className="pf-review-row">
                <span className="pf-review-label">Type</span>
                <span className="pf-review-value">
                  {formData.propertyType ? formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1) : "—"} for {formData.listingType === "sale" ? "Sale" : "Rent"}
                </span>
              </div>
              <div className="pf-review-row">
                <span className="pf-review-label">Title</span>
                <span className="pf-review-value">{formData.title || "—"}</span>
              </div>
              <div className="pf-review-row">
                <span className="pf-review-label">Description</span>
                <span className="pf-review-value pf-review-desc">{formData.description || "—"}</span>
              </div>
            </div>

            <div className="pf-review-section">
              <div className="pf-review-section-header">
                <span>Location & Pricing</span>
                <button className="pf-review-edit" onClick={() => goToStep(1)}>Edit</button>
              </div>
              <div className="pf-review-row">
                <span className="pf-review-label">Price</span>
                <span className="pf-review-value">
                  {formData.price ? `INR ${formatIndianPrice(formData.price)}` : "—"}
                </span>
              </div>
              <div className="pf-review-row">
                <span className="pf-review-label">Location</span>
                <span className="pf-review-value">
                  {[formData.area, formData.city, formData.state].filter(Boolean).join(", ") || "—"}
                </span>
              </div>
              {formData.pincode && (
                <div className="pf-review-row">
                  <span className="pf-review-label">Pincode</span>
                  <span className="pf-review-value">{formData.pincode}</span>
                </div>
              )}
            </div>

            <div className="pf-review-section">
              <div className="pf-review-section-header">
                <span>Specifications</span>
                <button className="pf-review-edit" onClick={() => goToStep(2)}>Edit</button>
              </div>
              {needsResidentialFields && (
                <>
                  <div className="pf-review-row">
                    <span className="pf-review-label">Bedrooms</span>
                    <span className="pf-review-value">{formData.bedrooms || "—"}</span>
                  </div>
                  <div className="pf-review-row">
                    <span className="pf-review-label">Bathrooms</span>
                    <span className="pf-review-value">{formData.bathrooms || "—"}</span>
                  </div>
                  <div className="pf-review-row">
                    <span className="pf-review-label">Furnishing</span>
                    <span className="pf-review-value">
                      {formData.furnishing ? formData.furnishing.charAt(0).toUpperCase() + formData.furnishing.slice(1).replace("-", " ") : "—"}
                    </span>
                  </div>
                </>
              )}
              {formData.areaSqft && (
                <div className="pf-review-row">
                  <span className="pf-review-label">Area</span>
                  <span className="pf-review-value">{formData.areaSqft} sq.ft.</span>
                </div>
              )}
              {formData.amenities.length > 0 && (
                <div className="pf-review-row">
                  <span className="pf-review-label">Amenities</span>
                  <span className="pf-review-value">{formData.amenities.join(", ")}</span>
                </div>
              )}
            </div>

            <div className="pf-review-section">
              <div className="pf-review-section-header">
                <span>Photos & Video</span>
                <button className="pf-review-edit" onClick={() => goToStep(3)}>Edit</button>
              </div>
              {formData.images.length > 0 ? (
                <div className="pf-review-images">
                  {formData.images.map((url, i) => (
                    <img key={url} src={url} alt={`Photo ${i + 1}`} className="pf-review-thumb" />
                  ))}
                </div>
              ) : (
                <p className="pf-review-none">No photos added</p>
              )}
              <div className="pf-review-row">
                <span className="pf-review-label">Video</span>
                <span className="pf-review-value">{formData.video ? "Uploaded" : "None"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="pf-nav">
        {currentStep > 0 && (
          <button
            type="button"
            className="btn-secondary pf-nav-back"
            onClick={handleBack}
            disabled={submitting}
          >
            Back
          </button>
        )}

        <div className="pf-nav-spacer" />

        {currentStep < 4 ? (
          <button
            type="button"
            className="btn-primary pf-nav-next"
            onClick={handleNext}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary pf-nav-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <span className="btn-spinner"></span>
            ) : mode === "add" ? (
              "Post Property"
            ) : (
              "Save Changes"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default PropertyForm;
