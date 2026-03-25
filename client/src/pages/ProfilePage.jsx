import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateProfile, changePassword, uploadAvatar } from "../services/profileService";
import Loader from "../components/common/Loader";
import "./ProfilePage.css";

function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar state
  const [avatarLoading, setAvatarLoading] = useState(false);

  const getInitial = () => {
    if (!user?.name) return "?";
    return user.name.charAt(0).toUpperCase();
  };

  // Profile validation
  const validateProfile = () => {
    const errors = {};
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    if (!profileForm.email.trim() || !/^\S+@\S+\.\S+$/.test(profileForm.email.trim())) {
      errors.email = "Enter a valid email";
    }
    if (profileForm.phone && !/^[6-9]\d{9}$/.test(profileForm.phone.trim())) {
      errors.phone = "Enter a valid 10-digit phone number";
    }
    return errors;
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    if (profileErrors[e.target.name]) {
      setProfileErrors({ ...profileErrors, [e.target.name]: "" });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errors = validateProfile();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    try {
      setProfileLoading(true);
      await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || "",
      });
      await refreshUser();
      showToast("Profile updated successfully", "success");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update profile";
      showToast(message, "error");
    } finally {
      setProfileLoading(false);
    }
  };

  // Password validation
  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({ ...passwordErrors, [e.target.name]: "" });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully", "success");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to change password";
      showToast(message, "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast("Only jpg, png, and webp images are allowed", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB", "error");
      return;
    }

    try {
      setAvatarLoading(true);
      await uploadAvatar(file);
      await refreshUser();
      showToast("Avatar updated", "success");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to upload avatar";
      showToast(message, "error");
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  if (authLoading) return <Loader />;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="container profile-header-content">
          <h1>My Profile</h1>
          <p className="profile-subtitle">Manage your account details</p>
        </div>
      </div>

      <div className="container profile-content">
        {/* Avatar section */}
        <section className="profile-section profile-avatar-section">
          <div className="profile-avatar-wrapper" onClick={handleAvatarClick}>
            {avatarLoading ? (
              <div className="profile-avatar profile-avatar--loading">
                <span className="profile-avatar-spinner"></span>
              </div>
            ) : user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-avatar profile-avatar--img" />
            ) : (
              <div className="profile-avatar profile-avatar--initial">{getInitial()}</div>
            )}
            <span className="profile-avatar-overlay">Change</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="profile-avatar-input"
          />
          <p className="profile-avatar-hint">Click to upload (jpg, png, webp — max 5MB)</p>
        </section>

        {/* Personal info */}
        <section className="profile-section">
          <h2>Personal Information</h2>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="profile-field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileChange}
                className={profileErrors.name ? "input-error" : ""}
              />
              {profileErrors.name && <span className="field-error">{profileErrors.name}</span>}
            </div>

            <div className="profile-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className={profileErrors.email ? "input-error" : ""}
              />
              {profileErrors.email && <span className="field-error">{profileErrors.email}</span>}
            </div>

            <div className="profile-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={profileForm.phone}
                onChange={handleProfileChange}
                placeholder="10-digit Indian number"
                className={profileErrors.phone ? "input-error" : ""}
              />
              {profileErrors.phone && <span className="field-error">{profileErrors.phone}</span>}
            </div>

            <button type="submit" className="btn-primary profile-submit" disabled={profileLoading}>
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* Change password */}
        <section className="profile-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="profile-field">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className={passwordErrors.currentPassword ? "input-error" : ""}
              />
              {passwordErrors.currentPassword && (
                <span className="field-error">{passwordErrors.currentPassword}</span>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className={passwordErrors.newPassword ? "input-error" : ""}
              />
              {passwordErrors.newPassword && (
                <span className="field-error">{passwordErrors.newPassword}</span>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className={passwordErrors.confirmPassword ? "input-error" : ""}
              />
              {passwordErrors.confirmPassword && (
                <span className="field-error">{passwordErrors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="btn-primary profile-submit" disabled={passwordLoading}>
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
