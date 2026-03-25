import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { createWantedProperty } from "../services/wantedService";
import "./PostWantedPage.css";

function PostWantedPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "flat",
    listingType: "sale",
    budgetMin: "",
    budgetMax: "",
    city: "",
    area: "",
    state: "",
    bedrooms: "",
    contactPhone: user?.phone || "",
    contactEmail: user?.email || "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 5) e.title = "Title must be at least 5 characters";
    if (!form.description.trim() || form.description.trim().length < 20) e.description = "Description must be at least 20 characters";
    if (!form.budgetMin || Number(form.budgetMin) <= 0) e.budgetMin = "Enter minimum budget";
    if (!form.budgetMax || Number(form.budgetMax) <= 0) e.budgetMax = "Enter maximum budget";
    if (form.budgetMin && form.budgetMax && Number(form.budgetMin) > Number(form.budgetMax)) {
      e.budgetMax = "Max budget must be greater than min";
    }
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.contactPhone.trim() || !/^[6-9]\d{9}$/.test(form.contactPhone.trim())) {
      e.contactPhone = "Enter a valid 10-digit phone number";
    }
    if (!form.contactEmail.trim() || !/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) {
      e.contactEmail = "Enter a valid email";
    }
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await createWantedProperty({
        title: form.title.trim(),
        description: form.description.trim(),
        propertyType: form.propertyType,
        listingType: form.listingType,
        budget: { min: Number(form.budgetMin), max: Number(form.budgetMax) },
        location: {
          city: form.city.trim(),
          area: form.area.trim(),
          state: form.state.trim(),
        },
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim(),
      });
      showToast("Requirement posted successfully!", "success");
      navigate("/wanted");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to post requirement";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-wanted-page">
      <div className="post-wanted-header">
        <div className="container post-wanted-header-content">
          <h1>Post Your Requirement</h1>
          <p className="post-wanted-subtitle">Tell sellers and landlords what you are looking for</p>
        </div>
      </div>

      <div className="container post-wanted-content">
        <form onSubmit={handleSubmit} className="post-wanted-form">
          <div className="pw-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Looking for 2BHK in Pune under 50L"
              value={form.title}
              onChange={handleChange}
              className={errors.title ? "input-error" : ""}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="pw-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              placeholder="Describe what you are looking for in detail..."
              value={form.description}
              onChange={handleChange}
              className={errors.description ? "input-error" : ""}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="pw-row">
            <div className="pw-field">
              <label htmlFor="listingType">I want to</label>
              <select id="listingType" name="listingType" value={form.listingType} onChange={handleChange}>
                <option value="sale">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            <div className="pw-field">
              <label htmlFor="propertyType">Property Type</label>
              <select id="propertyType" name="propertyType" value={form.propertyType} onChange={handleChange}>
                <option value="flat">Flat</option>
                <option value="house">House</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div className="pw-field">
              <label htmlFor="bedrooms">Bedrooms</label>
              <select id="bedrooms" name="bedrooms" value={form.bedrooms} onChange={handleChange}>
                <option value="">Any</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>
          </div>

          <div className="pw-row">
            <div className="pw-field">
              <label htmlFor="budgetMin">Min Budget (₹)</label>
              <input
                id="budgetMin"
                name="budgetMin"
                type="number"
                placeholder="e.g. 2000000"
                value={form.budgetMin}
                onChange={handleChange}
                className={errors.budgetMin ? "input-error" : ""}
              />
              {errors.budgetMin && <span className="field-error">{errors.budgetMin}</span>}
            </div>

            <div className="pw-field">
              <label htmlFor="budgetMax">Max Budget (₹)</label>
              <input
                id="budgetMax"
                name="budgetMax"
                type="number"
                placeholder="e.g. 5000000"
                value={form.budgetMax}
                onChange={handleChange}
                className={errors.budgetMax ? "input-error" : ""}
              />
              {errors.budgetMax && <span className="field-error">{errors.budgetMax}</span>}
            </div>
          </div>

          <div className="pw-row">
            <div className="pw-field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                placeholder="e.g. Pune"
                value={form.city}
                onChange={handleChange}
                className={errors.city ? "input-error" : ""}
              />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>

            <div className="pw-field">
              <label htmlFor="area">Area (optional)</label>
              <input
                id="area"
                name="area"
                type="text"
                placeholder="e.g. Baner"
                value={form.area}
                onChange={handleChange}
              />
            </div>

            <div className="pw-field">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                placeholder="e.g. Maharashtra"
                value={form.state}
                onChange={handleChange}
                className={errors.state ? "input-error" : ""}
              />
              {errors.state && <span className="field-error">{errors.state}</span>}
            </div>
          </div>

          <div className="pw-row">
            <div className="pw-field">
              <label htmlFor="contactPhone">Contact Phone</label>
              <input
                id="contactPhone"
                name="contactPhone"
                type="text"
                value={form.contactPhone}
                onChange={handleChange}
                className={errors.contactPhone ? "input-error" : ""}
              />
              {errors.contactPhone && <span className="field-error">{errors.contactPhone}</span>}
            </div>

            <div className="pw-field">
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                className={errors.contactEmail ? "input-error" : ""}
              />
              {errors.contactEmail && <span className="field-error">{errors.contactEmail}</span>}
            </div>
          </div>

          <button type="submit" className="btn-primary pw-submit" disabled={loading}>
            {loading ? "Posting..." : "Post Requirement"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostWantedPage;
