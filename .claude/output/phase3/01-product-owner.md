# PRODUCT_OWNER Output — Phase 3: Vendor Flow (Property Listing)
**Agent:** PRODUCT_OWNER
**Status:** Complete
**Date:** 2026-03-21

---

## Delivery Scope Summary

Phase 3 enables any logged-in user to list properties on ChikuProp. This includes:
- A public-access Add Property form (no login wall before the form)
- Cloudinary-based image and video upload
- A "My Listings" dashboard for users to manage their listed properties
- Edit and Delete property capabilities
- Property status management (active/paused)
- Backend APIs to support all CRUD operations and file uploads

Key UX decision: The Add Property form is accessible without login. Login is required only at the moment of submission ("Amazon cart" pattern).

---

## Prioritized Features / Pages

### High Priority (P0 — Must Ship)
1. **POST /api/properties** — Create Property API (auth-protected)
2. **Cloudinary Upload API** — POST /api/upload (images + video)
3. **Add Property Page** — Public form, login-at-submit pattern
4. **My Listings Page** — Dashboard showing user's listed properties
5. **GET /api/properties/my** — Fetch logged-in user's properties (auth-protected)

### Medium Priority (P1 — Must Ship)
6. **PUT /api/properties/:id** — Update Property API (auth-protected, owner-only)
7. **DELETE /api/properties/:id** — Delete Property API (auth-protected, owner-only)
8. **Edit Property Page** — Pre-filled form for editing an existing listing
9. **PATCH /api/properties/:id/status** — Toggle active/paused (auth-protected, owner-only)
10. **"List Property" CTA** — Visible button in Navbar/Header linking to Add Property

---

## User Stories

### US-1: List a Property (Public Form, Login at Submit)
**As a** user visiting ChikuProp,
**I want to** fill out a property listing form without logging in first,
**so that** I can invest my effort before being asked to create an account.

**Acceptance Criteria:**
- [ ] Form is accessible at `/add-property` without authentication
- [ ] All Property model fields are represented in the form
- [ ] Form validates required fields client-side before submit
- [ ] If logged in: submitting creates the property and redirects to My Listings
- [ ] If not logged in: form data saved to `localStorage` under key `pendingProperty`, redirects to `/login?redirect=/add-property`
- [ ] After login, returning to `/add-property` restores data from localStorage and pre-fills the form
- [ ] Message shown: "Your property details have been restored. Review and submit."
- [ ] After successful submission, `pendingProperty` is cleared from localStorage
- [ ] Contact Phone and Email pre-filled from user profile when logged in
- [ ] Bedrooms, Bathrooms, Furnishing hidden when Property Type is "plot" or "commercial"
- [ ] Form is fully responsive (mobile, tablet, desktop)

### US-2: Upload Property Images
**As a** user listing a property,
**I want to** upload up to 10 photos of my property.

**Acceptance Criteria:**
- [ ] Image upload accepts jpg, png, webp formats only
- [ ] Maximum file size per image: 5MB
- [ ] Maximum 10 images per property
- [ ] Images uploaded to Cloudinary via server proxy (POST /api/upload/images)
- [ ] Upload shows progress indicator per image
- [ ] Uploaded images show as thumbnails with remove button
- [ ] If upload fails, error message shown for that specific image

### US-3: Upload Property Video
**As a** user listing a property,
**I want to** optionally upload a video walkthrough.

**Acceptance Criteria:**
- [ ] Video upload accepts mp4 format only
- [ ] Maximum file size: 50MB
- [ ] Maximum 1 video per property
- [ ] Video uploaded to Cloudinary via server proxy (POST /api/upload/video)
- [ ] Upload shows progress indicator
- [ ] Uploaded video shows preview/filename with remove button

### US-4: View My Listings Dashboard
**As a** logged-in user,
**I want to** see all properties I have listed.

**Acceptance Criteria:**
- [ ] Page at `/my-listings` requires authentication
- [ ] Displays all properties where vendorId matches logged-in user
- [ ] Each card shows: thumbnail, title, price, city, status badge, viewCount, contactUnlockCount
- [ ] Cards sorted by creation date (newest first)
- [ ] Empty state: "You haven't listed any properties yet. [List Your First Property]"
- [ ] Loading and error states handled

### US-5: Edit My Property
**As a** logged-in user,
**I want to** edit a property I have listed.

**Acceptance Criteria:**
- [ ] Edit page at `/edit-property/:id` requires authentication
- [ ] Form pre-filled with existing property data
- [ ] All fields editable, including adding/removing images
- [ ] Backend verifies ownership — returns 403 if not owner
- [ ] On success, redirect to My Listings with success toast
- [ ] Cannot edit status via this form (separate toggle)

### US-6: Delete My Property
**As a** logged-in user,
**I want to** delete a property listing I no longer need.

**Acceptance Criteria:**
- [ ] Delete action available on My Listings dashboard (per card)
- [ ] Confirmation dialog: "Are you sure? This cannot be undone."
- [ ] Backend verifies ownership — returns 403 if not owner
- [ ] On success, property removed from list immediately
- [ ] Success toast: "Property deleted successfully"

### US-7: Toggle Property Status (Active/Paused)
**As a** logged-in user,
**I want to** pause or reactivate my property listing.

**Acceptance Criteria:**
- [ ] Toggle button on each listing card in My Listings
- [ ] Calls PATCH /api/properties/:id/status
- [ ] Status changes between "active" and "paused" only
- [ ] Status badge updates immediately
- [ ] Backend verifies ownership
- [ ] Paused properties do NOT appear in public search results
- [ ] Toast: "Property paused" or "Property reactivated"

### US-8: Navigate to List Property
**As a** visitor or user,
**I want to** see a clear "List Property" button in navigation.

**Acceptance Criteria:**
- [ ] "List Property" button visible in Navbar for all users (logged in or not)
- [ ] Clicking navigates to `/add-property`
- [ ] Styled as primary action
- [ ] Visible and accessible on mobile

---

## Dependencies

### Existing to Reuse
- AuthContext, authService, api.js, protect middleware, Property model, User model
- propertyRoutes.js, propertyController.js (add new functions)
- Cloudinary config (server/config/cloudinary.js)

### New Files Needed
- Frontend: AddPropertyPage.jsx/.css, MyListingsPage.jsx/.css, EditPropertyPage.jsx/.css, propertyService.js
- Backend: uploadRoutes.js, uploadController.js

### Critical Dependency: Login Redirect Support
Login flow MUST support `?redirect=` query parameter. After login at `/login?redirect=/add-property`, user must be redirected to `/add-property` (not homepage).

---

## Delivery Sequence

### Sprint 1 — Backend Foundation
1. Upload API (POST /api/upload/images, POST /api/upload/video)
2. Create Property API (POST /api/properties)
3. Get My Properties API (GET /api/properties/my)
4. Login redirect support (if not already)

### Sprint 2 — Core Frontend
5. propertyService.js
6. Add Property Page (form + upload + localStorage save/restore)
7. My Listings Page (dashboard)
8. "List Property" button in Navbar

### Sprint 3 — Edit, Delete, Status
9. Update Property API (PUT /api/properties/:id)
10. Delete Property API (DELETE /api/properties/:id)
11. Toggle Status API (PATCH /api/properties/:id/status)
12. Edit Property Page
13. Delete confirmation + toggle UI

---

## Out of Scope (Phase 4+)
- Property expiry logic
- Paid listing plans / payment
- Bulk upload (CSV/Excel)
- Admin moderation
- Cloudinary asset cleanup on delete
- Property draft/auto-save
- Property verification/approval workflow

---

## Notes for Next Agent (UX_DESIGNER)

1. **Login-at-submit flow** is the most important UX challenge — transition must feel seamless
2. **Form length** — 15+ fields. Consider multi-step form (wizard):
   - Step 1: Basic Info (listing type, property type, title, description)
   - Step 2: Pricing & Location (price, city, area, state, pincode)
   - Step 3: Specs (bedrooms, bathrooms, area, furnishing, amenities)
   - Step 4: Media (images, video)
   - Step 5: Contact Info (phone, email)
3. **Conditional fields** — hide bedrooms/bathrooms/furnishing for plot & commercial
4. **My Listings** — status, price, location are top 3 info at a glance
5. **Empty states** — make them inviting, guide toward first listing
6. **Mobile-first** — Indian users often list from mobile