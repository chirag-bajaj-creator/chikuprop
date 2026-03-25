# SOFTWARE_ARCHITECT Output — Phase 3: Vendor Flow (Property Listing)
**Agent:** SOFTWARE_ARCHITECT
**Status:** Complete
**Date:** 2026-03-21

---

## Table of Contents
1. [API Contracts](#1-api-contracts)
2. [File Map (New + Modified)](#2-file-map)
3. [React Component Architecture](#3-react-component-architecture)
4. [State Management](#4-state-management)
5. [Upload Architecture](#5-upload-architecture)
6. [Auth Integration](#6-auth-integration)
7. [Key Data Flows](#7-key-data-flows)
8. [Shared Components](#8-shared-components)
9. [Notes for Backend Developer](#9-notes-for-backend-developer)
10. [Notes for Frontend Developer](#10-notes-for-frontend-developer)

---

## 1. API Contracts

All endpoints follow the existing response format:
- Success: `{ success: true, data: { ... } }`
- Error: `{ success: false, error: "message string" }`

Auth is via `Authorization: Bearer <token>` header, handled by existing `protect` middleware in `server/middleware/auth.js`.

---

### 1.1 POST /api/upload/images
**Auth:** Required (protect)
**Content-Type:** `multipart/form-data`

**Request:**
- Field name: `images`
- Max files: 10
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Max size per file: 5MB

**Response 200:**
```json
{
  "success": true,
  "data": {
    "urls": [
      "https://res.cloudinary.com/xxx/image/upload/v123/chikuprop/properties/abc.jpg",
      "https://res.cloudinary.com/xxx/image/upload/v123/chikuprop/properties/def.png"
    ]
  }
}
```

**Error Responses:**
| Status | Condition | Error |
|--------|-----------|-------|
| 400 | No files provided | "At least one image is required" |
| 400 | File exceeds 5MB | "Each image must be under 5MB" |
| 400 | Invalid file type | "Only jpg, png, and webp images are allowed" |
| 400 | More than 10 files | "Maximum 10 images allowed" |
| 401 | No/invalid token | "Not authorized — no token" |
| 500 | Cloudinary failure | "Image upload failed. Please try again." |

---

### 1.2 POST /api/upload/video
**Auth:** Required (protect)
**Content-Type:** `multipart/form-data`

**Request:**
- Field name: `video`
- Max files: 1
- Allowed MIME types: `video/mp4`
- Max size: 50MB

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/xxx/video/upload/v123/chikuprop/properties/vid123.mp4"
  }
}
```

**Error Responses:**
| Status | Condition | Error |
|--------|-----------|-------|
| 400 | No file provided | "A video file is required" |
| 400 | File exceeds 50MB | "Video must be under 50MB" |
| 400 | Invalid file type | "Only mp4 videos are allowed" |
| 401 | No/invalid token | "Not authorized — no token" |
| 500 | Cloudinary failure | "Video upload failed. Please try again." |

---

### 1.3 POST /api/properties
**Auth:** Required (protect)

**Request Body (JSON):**
```json
{
  "listingType": "sale",
  "propertyType": "flat",
  "title": "Spacious 3BHK in Koramangala",
  "description": "Well-maintained flat with garden view...",
  "price": 8500000,
  "location": {
    "city": "Bangalore",
    "area": "Koramangala",
    "state": "Karnataka",
    "pincode": "560034"
  },
  "bedrooms": 3,
  "bathrooms": 2,
  "areaSqft": 1450,
  "furnishing": "semi-furnished",
  "amenities": ["Parking", "Gym", "Security"],
  "images": ["https://res.cloudinary.com/...jpg"],
  "video": "https://res.cloudinary.com/...mp4",
  "contactPhone": "9876543210",
  "contactEmail": "seller@example.com"
}
```

**Validation Rules (server-side):**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| listingType | string | Yes | enum: `sale`, `rent` |
| propertyType | string | Yes | enum: `flat`, `house`, `plot`, `commercial` |
| title | string | Yes | min 5, max 100, trimmed, HTML stripped |
| description | string | Yes | min 20, max 1000, HTML stripped |
| price | number | Yes | min 1, must be positive integer |
| location.city | string | Yes | non-empty, trimmed |
| location.area | string | Yes | non-empty, trimmed |
| location.state | string | Yes | non-empty, trimmed |
| location.pincode | string | No | if provided, must be exactly 6 digits (`/^\d{6}$/`) |
| bedrooms | number | No | 1-10, required only if propertyType is `flat` or `house` |
| bathrooms | number | No | 1-10, required only if propertyType is `flat` or `house` |
| areaSqft | number | No | if provided, min 1 |
| furnishing | string | No | enum: `furnished`, `semi-furnished`, `unfurnished`; required if propertyType is `flat` or `house` |
| amenities | array | No | array of strings, max 10 items, each from allowed list |
| images | array | No | array of valid URL strings, max 10 |
| video | string | No | valid URL string |
| contactPhone | string | Yes | matches `/^[6-9]\d{9}$/` (Indian mobile) |
| contactEmail | string | Yes | matches `/^\S+@\S+\.\S+$/` |

**Server sets automatically:**
- `vendorId` = `req.user._id`
- `status` = `"active"`
- `planType` = `"free"`
- `viewCount` = `0`
- `contactUnlockCount` = `0`

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "665abc123...",
    "vendorId": "664def456...",
    "title": "Spacious 3BHK in Koramangala",
    "status": "active",
    "createdAt": "2026-03-21T10:00:00.000Z"
  }
}
```
Note: Return only `_id`, `vendorId`, `title`, `status`, `createdAt` — not the full document. The frontend redirects to My Listings after creation and fetches the full list there.

**Error Responses:**
| Status | Condition | Error |
|--------|-----------|-------|
| 400 | Missing required field | "Title is required" (specific field name) |
| 400 | Invalid enum value | "Listing type must be sale or rent" |
| 400 | Invalid phone | "Enter a valid 10-digit Indian phone number" |
| 400 | Price not positive | "Price must be a positive number" |
| 401 | Not authenticated | "Not authorized — no token" |
| 500 | Server/DB error | "Failed to create property. Please try again." |

---

### 1.4 GET /api/properties/my
**Auth:** Required (protect)

**Query Parameters:** None (returns all properties for the authenticated user).

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "665abc123...",
      "title": "Spacious 3BHK in Koramangala",
      "price": 8500000,
      "listingType": "sale",
      "propertyType": "flat",
      "location": { "city": "Bangalore", "area": "Koramangala" },
      "images": ["https://res.cloudinary.com/...jpg"],
      "status": "active",
      "viewCount": 42,
      "contactUnlockCount": 5,
      "createdAt": "2026-03-21T10:00:00.000Z"
    }
  ]
}
```
Sort: `{ createdAt: -1 }` (newest first).
Select: `_id title price listingType propertyType location images status viewCount contactUnlockCount createdAt` — exclude description, video, amenities, contactPhone, contactEmail (not needed for card display).

**Error Responses:**
| Status | Condition | Error |
|--------|-----------|-------|
| 401 | Not authenticated | "Not authorized — no token" |
| 500 | Server error | "Failed to fetch your listings" |

---

### 1.5 GET /api/properties/:id (existing — no change needed)
Already returns the full property document. Used by the Edit Property page to prefill the form. No ownership check — the property data is not secret. Frontend uses this existing endpoint.

---

### 1.6 PUT /api/properties/:id
**Auth:** Required (protect) + ownership check

**Request Body (JSON):** Same fields as POST /api/properties. Same validation rules. All fields optional (only changed fields sent), but required fields must remain present if originally required.

**Ownership Check:** `property.vendorId.toString() === req.user._id.toString()`. If false, return 403.

**Server must NOT allow updating:** `vendorId`, `status`, `planType`, `viewCount`, `contactUnlockCount`.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "665abc123...",
    "title": "Updated Title",
    "status": "active",
    "updatedAt": "2026-03-21T12:00:00.000Z"
  }
}
```

**Error Responses:**
| Status | Condition | Error |
|--------|-----------|-------|
| 400 | Validation failure | Specific field error message |
| 401 | Not authenticated | "Not authorized — no token" |
| 403 | Not the owner | "You can only edit your own properties" |
| 404 | Property not found | "Property not found" |
| 500 | Server error | "Failed to update property" |

---

### 1.7 DELETE /api/properties/:id
**Auth:** Required (protect) + ownership check

**Request Body:** None.

**Response 200:**
```json
{
  "success": true,
  "data": { "message": "Property deleted successfully" }
}
```

**Error Responses:**
| Status | Condition | Error |
|--------|-----------|-------|
| 401 | Not authenticated | "Not authorized — no token" |
| 403 | Not the owner | "You can only delete your own properties" |
| 404 | Property not found | "Property not found" |
| 500 | Server error | "Failed to delete property" |

---

### 1.8 PATCH /api/properties/:id/status
**Auth:** Required (protect) + ownership check

**Request Body:**
```json
{
  "status": "paused"
}
```

**Validation:** `status` must be `"active"` or `"paused"` only. The `"expired"` status is system-managed (Phase 4+).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "665abc123...",
    "status": "paused"
  }
}
```

**Error Responses:**
| Status | Condition | Error |
|--------|-----------|-------|
| 400 | Invalid status value | "Status must be active or paused" |
| 401 | Not authenticated | "Not authorized — no token" |
| 403 | Not the owner | "You can only change status of your own properties" |
| 404 | Property not found | "Property not found" |
| 500 | Server error | "Failed to update property status" |

---

## 2. File Map

### New Files to Create

#### Backend (server/)
| File | Purpose |
|------|---------|
| `server/routes/uploadRoutes.js` | Express router for POST /api/upload/images and POST /api/upload/video |
| `server/controllers/uploadController.js` | Multer config + Cloudinary upload logic for images and video |
| `server/middleware/multerUpload.js` | Shared multer configuration (memory storage, file filters, size limits) |

#### Frontend (client/src/)
| File | Purpose |
|------|---------|
| `client/src/services/propertyService.js` | All property and upload API calls |
| `client/src/context/ToastContext.jsx` | Toast notification context + provider |
| `client/src/pages/AddPropertyPage.jsx` | Add Property wizard page |
| `client/src/pages/AddPropertyPage.css` | Styles for Add Property page |
| `client/src/pages/MyListingsPage.jsx` | My Listings dashboard page |
| `client/src/pages/MyListingsPage.css` | Styles for My Listings page |
| `client/src/pages/EditPropertyPage.jsx` | Edit Property page (thin wrapper around PropertyForm) |
| `client/src/pages/EditPropertyPage.css` | Styles for Edit Property page |
| `client/src/components/property/PropertyForm.jsx` | Shared 5-step wizard form (used by Add + Edit) |
| `client/src/components/property/PropertyForm.css` | Styles for the wizard form |
| `client/src/components/property/StepIndicator.jsx` | Horizontal step progress bar |
| `client/src/components/property/StepIndicator.css` | Styles for step indicator |
| `client/src/components/property/ImageUploader.jsx` | Drag-and-drop image upload with thumbnails |
| `client/src/components/property/ImageUploader.css` | Styles for image uploader |
| `client/src/components/property/VideoUploader.jsx` | Single video file upload |
| `client/src/components/property/VideoUploader.css` | Styles for video uploader |
| `client/src/components/property/ListingCard.jsx` | Card for My Listings dashboard (differs from public PropertyCard) |
| `client/src/components/property/ListingCard.css` | Styles for listing card |
| `client/src/components/common/DeleteModal.jsx` | Reusable delete confirmation modal |
| `client/src/components/common/DeleteModal.css` | Styles for delete modal |
| `client/src/components/common/Toast.jsx` | Toast notification display component |
| `client/src/components/common/Toast.css` | Toast styles |

### Existing Files to Modify

| File | Changes |
|------|---------|
| `server/server.js` | Add `app.use("/api/upload", uploadRoutes)` and `app.use(express.json({ limit: "10mb" }))` |
| `server/routes/propertyRoutes.js` | Add routes: POST /, GET /my, PUT /:id, DELETE /:id, PATCH /:id/status |
| `server/controllers/propertyController.js` | Add functions: createProperty, getMyProperties, updateProperty, deleteProperty, togglePropertyStatus |
| `client/src/App.jsx` | Add routes for /add-property, /my-listings, /edit-property/:id; wrap with ToastProvider |
| `client/src/components/common/Navbar.jsx` | Change "List Property" link from /vendor to /add-property; add "My Listings" to dropdown |
| `client/src/pages/LoginPage.jsx` | Support `?redirect=` query param (read from `searchParams`, not just `location.state`) |
| `client/src/pages/RegisterPage.jsx` | Support `?redirect=` query param (same approach as LoginPage) |
| `client/src/services/api.js` | Update 401 interceptor to preserve redirect param |

---

## 3. React Component Architecture

### Component Tree

```
App.jsx
├── ToastProvider (new)
│   ├── Navbar (modified)
│   │   └── "List Property" -> /add-property
│   │   └── Dropdown: "My Listings" -> /my-listings
│   │
│   ├── Routes
│   │   ├── /add-property -> AddPropertyPage
│   │   │   └── PropertyForm (mode="add")
│   │   │       ├── StepIndicator
│   │   │       ├── Step 1: Basic Details fields
│   │   │       ├── Step 2: Location & Pricing fields
│   │   │       ├── Step 3: Specifications fields (conditional)
│   │   │       ├── Step 4: Media
│   │   │       │   ├── ImageUploader
│   │   │       │   └── VideoUploader
│   │   │       └── Step 5: Contact & Review
│   │   │
│   │   ├── /my-listings -> ProtectedRoute -> MyListingsPage
│   │   │   ├── Stats summary bar
│   │   │   ├── ListingCard[] (map)
│   │   │   │   └── Each card: Edit / Pause / Delete buttons
│   │   │   ├── DeleteModal (conditional)
│   │   │   └── EmptyState / Loader / ErrorState
│   │   │
│   │   └── /edit-property/:id -> ProtectedRoute -> EditPropertyPage
│   │       ├── Loader (while fetching)
│   │       └── PropertyForm (mode="edit", initialData={...})
│   │
│   └── Toast (rendered by ToastProvider, positioned fixed)
```

### Component Props & Responsibilities

#### PropertyForm
```jsx
Props:
  mode: "add" | "edit"
  initialData: object | null        // null for add, property data for edit
  onSubmitSuccess: () => void       // called after successful API call

State (internal):
  formData: object                  // all property fields
  currentStep: number               // 1-5
  errors: object                    // per-field validation errors
  submitting: boolean
  showLoginPrompt: boolean          // only in add mode, when not logged in

Responsibilities:
  - Render the 5-step wizard
  - Validate current step on "Next"
  - In add mode: handle login-at-submit flow
  - In edit mode: just submit PUT request
  - Delegates upload to ImageUploader/VideoUploader
```

#### StepIndicator
```jsx
Props:
  steps: string[]                   // ["Basic Details", "Location & Pricing", ...]
  currentStep: number               // 1-based
  completedSteps: number[]          // array of completed step numbers
  onStepClick: (step: number) => void

Responsibilities:
  - Render horizontal progress bar with step labels
  - Highlight current step, checkmark completed
  - Allow click-back to completed steps only
```

#### ImageUploader
```jsx
Props:
  images: string[]                  // array of Cloudinary URLs
  onImagesChange: (urls: string[]) => void
  maxImages: 10

State (internal):
  uploading: { [filename]: progress% }
  errors: { [filename]: "error msg" }

Responsibilities:
  - Drag-and-drop + click-to-browse
  - Upload each image to POST /api/upload/images immediately
  - Show progress per image
  - Return Cloudinary URLs to parent via onImagesChange
  - Handle remove (just removes URL from array, no Cloudinary delete)
  - Show "Cover Photo" badge on first image
```

#### VideoUploader
```jsx
Props:
  video: string | null              // Cloudinary URL or null
  onVideoChange: (url: string | null) => void

State (internal):
  uploading: boolean
  progress: number
  error: string | null

Responsibilities:
  - Single file upload to POST /api/upload/video
  - Show progress bar while uploading
  - Show filename + remove button after upload
  - Return Cloudinary URL to parent via onVideoChange
```

#### ListingCard
```jsx
Props:
  property: object                  // property from GET /api/properties/my
  onEdit: (id: string) => void
  onDelete: (id: string, title: string) => void
  onToggleStatus: (id: string, currentStatus: string) => void
  statusLoading: boolean            // true while status toggle is in progress

Responsibilities:
  - Display thumbnail, title, price, location, status, stats
  - Format price using formatPrice util
  - Show action buttons: Edit, Pause/Activate, Delete
```

#### DeleteModal
```jsx
Props:
  isOpen: boolean
  propertyTitle: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean

Responsibilities:
  - Render backdrop + centered modal card
  - Show property title for clarity
  - Close on backdrop click or Escape
  - Show spinner on confirm button while loading
  - Focus trap while open
```

#### Toast (rendered by ToastContext)
```jsx
Props (from context):
  toasts: Array<{ id, message, type }>   // type: "success" | "error" | "info"

Responsibilities:
  - Position fixed, top-right
  - Auto-dismiss after 4 seconds
  - Fade-in/fade-out animation
  - Multiple toasts stack vertically
```

---

## 4. State Management

### 4.1 Wizard Form State

Single `formData` object managed inside `PropertyForm`:

```js
const INITIAL_FORM_DATA = {
  listingType: "sale",              // default per UX spec
  propertyType: "",
  title: "",
  description: "",
  price: "",
  location: {
    city: "",
    area: "",
    state: "",
    pincode: "",
  },
  bedrooms: "",
  bathrooms: "",
  areaSqft: "",
  furnishing: "",
  amenities: [],
  images: [],                       // array of Cloudinary URL strings
  video: "",                        // single Cloudinary URL string or ""
  contactPhone: "",
  contactEmail: "",
};
```

All fields stored as strings/arrays for easy serialization. Convert `price`, `bedrooms`, `bathrooms`, `areaSqft` to numbers at submission time.

### 4.2 localStorage Strategy

**Key:** `pendingProperty`

**When to save:** Only when user clicks "Post Property" while NOT logged in. Do NOT auto-save on every field change (out of scope for MVP — see Product Owner notes).

**What to save:**
```js
const pendingData = {
  formData: { ...formData },        // full form state including image/video URLs
  savedAt: Date.now(),              // for potential expiry check
};
localStorage.setItem("pendingProperty", JSON.stringify(pendingData));
```

**When to restore:** On `AddPropertyPage` mount, check for `pendingProperty` in localStorage. If found:
1. Parse and set as `formData`
2. Set `currentStep` to 5 (Review step)
3. Show info banner: "Your property details have been restored. Review and submit."
4. If user is now logged in AND `contactPhone`/`contactEmail` are empty, prefill from `user.phone`/`user.email`

**When to clear:** After successful POST /api/properties response only.

**Expiry:** If `savedAt` is older than 7 days, discard and start fresh. This prevents stale data from accumulating.

### 4.3 Toast Context

```js
// ToastContext provides:
{
  showToast: (message: string, type?: "success" | "error" | "info") => void
}
```

Implementation:
- `toasts` array in state, each with `{ id: Date.now(), message, type }`
- `showToast` adds to array
- Each toast auto-removes after 4000ms via `setTimeout`
- Cleanup: `useEffect` returns clearTimeout for each toast
- Max 3 toasts visible at once (oldest removed if exceeded)

---

## 5. Upload Architecture

### 5.1 Server-Side Upload Flow

```
Client (multipart/form-data)
    |
    v
Express Route (protect middleware first)
    |
    v
Multer (memory storage, file filter, size limit)
    |
    v
Controller: Loop through req.files
    |
    v
cloudinary.uploader.upload_stream() per file
    |
    v
Collect Cloudinary URLs
    |
    v
Return { success: true, data: { urls: [...] } }
```

### 5.2 Multer Configuration (`server/middleware/multerUpload.js`)

```js
const multer = require("multer");

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, png, and webp images are allowed"), false);
  }
};

const videoFilter = (req, file, cb) => {
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(new Error("Only mp4 videos are allowed"), false);
  }
};

const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
}).array("images", 10);

const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
}).single("video");

module.exports = { uploadImages, uploadVideo };
```

### 5.3 Cloudinary Upload Helper

In `uploadController.js`, use `cloudinary.uploader.upload_stream`:

```js
// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};
```

Cloudinary options:
- Images: `{ folder: "chikuprop/properties", resource_type: "image" }`
- Video: `{ folder: "chikuprop/properties", resource_type: "video" }`

### 5.4 Client-Side Upload Flow

Image uploads happen **immediately on file selection** in Step 4, not on form submit.

```
User selects files via input/drop
    |
    v
ImageUploader validates (type, size, count) client-side
    |
    v
For each file: POST /api/upload/images (FormData, one file per request for individual progress)
    |
    v
On success: add Cloudinary URL to formData.images[]
On error: show error on that specific thumbnail
    |
    v
URLs stored in formData, submitted with POST /api/properties
```

**Important decision:** Upload images one at a time (not batched) so each image shows individual progress. This is better UX on slow connections. If the user has already uploaded images (edit mode or returned from login), those URLs are already in `formData.images` and display as thumbnails immediately.

**Alternative considered:** Batching all 10 into one request. Rejected because: no per-image progress, one failure kills the whole batch, and the 5MB x 10 = 50MB payload would time out on 3G networks.

### 5.5 Upload Auth Requirement

Both upload endpoints require authentication. This means:
- **Logged-in user on Add Property:** Can upload immediately in Step 4.
- **Not-logged-in user on Add Property:** Cannot upload in Step 4. Show message: "Sign in to upload photos. You can add photos after publishing by editing your listing." The file inputs should be disabled. The image/video URLs in `formData` will be empty arrays. After login redirect and restore, user will be on Step 5 and can go back to Step 4 to upload.

This avoids orphan uploads from anonymous users and keeps the upload API secure.

---

## 6. Auth Integration

### 6.1 Login/Register Redirect Support (BLOCKING PREREQUISITE)

**Current behavior (broken for our use case):**
- `LoginPage.jsx` line 17: `const redirectTo = location.state?.from?.pathname || "/";`
- `RegisterPage.jsx` line 90: `navigate("/", { replace: true })` hardcoded
- `ProtectedRoute.jsx` passes redirect via `location.state`
- Neither reads `?redirect=` from the URL query string

**Required changes to LoginPage.jsx:**
```js
// Replace line 17 with:
const searchParams = new URLSearchParams(location.search);
const redirectTo = searchParams.get("redirect") || location.state?.from?.pathname || "/";
```

And in the `useEffect` that redirects already-authenticated users (line 21-24):
```js
useEffect(() => {
  if (!authLoading && user) {
    navigate(redirectTo, { replace: true });
  }
}, [user, authLoading, navigate, redirectTo]);
```

And in `handleSubmit` (line 52):
```js
setTimeout(() => navigate(redirectTo, { replace: true }), 1000);
```

Also update the "Register" link at the bottom to forward the redirect:
```jsx
<Link to={`/register${location.search}`} className="login-link">Register</Link>
```

**Required changes to RegisterPage.jsx:**
Same pattern — read `?redirect=` from `searchParams`, use it in navigate calls, and forward it to the Login link.

**Required change to api.js 401 interceptor:**
Currently the 401 handler does `window.location.href = "/login"`. This loses context. Change to:
```js
const currentPath = window.location.pathname;
window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
```

### 6.2 Ownership Checks

**Backend (every PUT, DELETE, PATCH):**
```js
const property = await Property.findById(req.params.id);
if (!property) {
  return res.status(404).json({ success: false, error: "Property not found" });
}
if (property.vendorId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ success: false, error: "You can only edit your own properties" });
}
```

**Frontend (EditPropertyPage):**
After fetching the property, compare `property.vendorId` with `user._id`. If mismatch, show error message with link back to `/my-listings`. Do NOT render the form.

### 6.3 Route Protection

| Route | Protection |
|-------|-----------|
| `/add-property` | **Public** — no ProtectedRoute wrapper. Auth checked only at submit time. |
| `/my-listings` | **Protected** — wrap with ProtectedRoute. Redirects to `/login?redirect=/my-listings` |
| `/edit-property/:id` | **Protected** — wrap with ProtectedRoute. Redirects to `/login?redirect=/edit-property/:id` |

**ProtectedRoute modification needed:** Currently uses `Navigate to="/login" state={{ from: location }}`. Should also pass `?redirect=` as a query param for consistency:
```jsx
return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
```

---

## 7. Key Data Flows

### 7.1 Add Property (Logged In)

```
1. User navigates to /add-property
2. AddPropertyPage mounts
3. Check localStorage for "pendingProperty" -> not found
4. Check user from AuthContext -> logged in
5. Pre-fill contactPhone from user.phone, contactEmail from user.email
6. User fills Steps 1-4, uploads images in Step 4
7. User reaches Step 5, clicks "Post Property"
8. PropertyForm calls propertyService.createProperty(formData)
9. API returns 201
10. showToast("Property listed successfully!", "success")
11. navigate("/my-listings")
```

### 7.2 Add Property (Not Logged In)

```
1. User navigates to /add-property
2. AddPropertyPage mounts
3. Check localStorage for "pendingProperty" -> not found
4. Check user from AuthContext -> null (not logged in)
5. contactPhone and contactEmail are empty (user fills manually)
6. User fills Steps 1-3
7. Step 4: Image/video uploads are DISABLED (requires auth)
   -> Message: "Sign in to upload photos..."
8. User reaches Step 5, clicks "Post Property"
9. PropertyForm detects user is null
10. Set showLoginPrompt = true
11. Render transition overlay: "One last step — sign in to publish"
12. User clicks "Sign In"
13. Save formData to localStorage key "pendingProperty"
14. navigate("/login?redirect=/add-property")
15. User logs in on LoginPage
16. LoginPage reads redirect=/add-property, navigates there
17. AddPropertyPage mounts again
18. Check localStorage for "pendingProperty" -> FOUND
19. Restore formData, set currentStep = 5
20. Show info banner: "Your property details have been restored..."
21. Pre-fill contactPhone/contactEmail from user profile if empty
22. User can go back to Step 4 to upload images now (they are logged in)
23. User clicks "Post Property" on Step 5
24. PropertyForm calls propertyService.createProperty(formData)
25. API returns 201
26. Clear localStorage "pendingProperty"
27. showToast("Property listed successfully!", "success")
28. navigate("/my-listings")
```

### 7.3 Edit Property

```
1. User clicks "Edit" on a listing card in MyListingsPage
2. navigate("/edit-property/:id")
3. EditPropertyPage mounts, shows Loader
4. Calls propertyService.getPropertyById(id)
5. Receives full property data
6. Compares property.vendorId with user._id
7. If mismatch: show error, link to /my-listings
8. If match: render PropertyForm with mode="edit", initialData={property}
9. PropertyForm pre-fills all fields, all steps unlocked
10. User edits fields, can go to any step
11. User clicks "Save Changes" on Step 5
12. PropertyForm calls propertyService.updateProperty(id, formData)
13. API returns 200
14. showToast("Property updated successfully", "success")
15. navigate("/my-listings")
```

### 7.4 Delete Property

```
1. User clicks "Delete" on a listing card in MyListingsPage
2. MyListingsPage sets deleteTarget = { id, title }
3. DeleteModal opens with property title
4. User clicks "Delete" in modal
5. MyListingsPage calls propertyService.deleteProperty(id)
6. API returns 200
7. Remove property from local listings state (no re-fetch needed)
8. Close modal
9. showToast("Property deleted successfully", "success")
```

### 7.5 Toggle Status

```
1. User clicks "Pause" on a listing card
2. ListingCard calls onToggleStatus(id, "active")
3. MyListingsPage calls propertyService.togglePropertyStatus(id, "paused")
4. API returns 200 with new status
5. Update property status in local listings state
6. showToast("Property paused", "success")
```

---

## 8. Shared Components

### 8.1 PropertyForm (shared by AddPropertyPage + EditPropertyPage)

The PropertyForm component is the core of this phase. It must be reusable:

| Behavior | mode="add" | mode="edit" |
|----------|-----------|------------|
| Page title | "List Your Property" | "Edit Property" |
| Initial data | INITIAL_FORM_DATA (or localStorage) | fetched property |
| Step access | Sequential (unlock on next) | All steps unlocked |
| Submit text | "Post Property" | "Save Changes" |
| Login-at-submit | Yes, if not logged in | No (always authenticated) |
| Cancel button | No | Yes (back to /my-listings) |
| Contact prefill | From user profile | From property data |
| API call | POST /api/properties | PUT /api/properties/:id |

### 8.2 DeleteModal (reusable)

Located at `client/src/components/common/DeleteModal.jsx`. Generic enough to reuse in future phases (e.g., delete account, delete grievance).

### 8.3 Toast System (reusable)

Located at `client/src/context/ToastContext.jsx` + `client/src/components/common/Toast.jsx`. Available app-wide via `useToast()` hook.

Usage:
```js
const { showToast } = useToast();
showToast("Property listed successfully!", "success");
showToast("Failed to delete property", "error");
showToast("Your property details have been restored", "info");
```

---

## 9. Notes for Backend Developer

### 9.1 Route Registration Order
In `propertyRoutes.js`, register `GET /my` BEFORE `GET /:id`. Otherwise Express will treat "my" as an `:id` parameter.

```js
// Correct order:
router.get("/my", protect, getMyProperties);           // must be before /:id
router.get("/:id", getPropertyById);
router.get("/:id/contact", protect, unlockContact);
router.post("/", protect, createProperty);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);
router.patch("/:id/status", protect, togglePropertyStatus);
```

### 9.2 Input Sanitization
Strip HTML from all string inputs using the existing `stripHtml` helper from `authController.js`. Extract it to `server/utils/sanitize.js` and reuse it.

### 9.3 Multer Error Handling
Multer errors (file too large, wrong type) are thrown as errors, not sent as responses. Wrap multer middleware in a custom handler:

```js
const handleMulterError = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, error: "File size exceeds the limit" });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ success: false, error: "Too many files" });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};
```

### 9.4 Allowed Amenities List
Hardcode the allowed amenities in a shared constant:

```js
// server/utils/constants.js
const ALLOWED_AMENITIES = [
  "Parking", "Gym", "Swimming Pool", "Garden", "Security",
  "Elevator", "Power Backup", "Water Supply", "Club House", "Playground"
];
```

Validate submitted amenities against this list. Reject unknown values.

### 9.5 Disallowed Fields on Update
When processing PUT /api/properties/:id, explicitly delete protected fields from `req.body` before passing to Mongoose:

```js
const PROTECTED_FIELDS = ["vendorId", "status", "planType", "viewCount", "contactUnlockCount"];
PROTECTED_FIELDS.forEach(field => delete req.body[field]);
```

### 9.6 Cloudinary Folder Structure
All uploads go to folder `chikuprop/properties`. No per-user subfolder (simplifies for MVP). Orphan cleanup is out of scope (Phase 4+).

### 9.7 server.js Changes
- Register upload routes: `app.use("/api/upload", uploadRoutes);`
- No change to `express.json()` limit needed — uploads use `multipart/form-data` handled by multer, not JSON body. The current default is fine.

### 9.8 Conditional Validation Logic
When `propertyType` is `flat` or `house`:
- `bedrooms` is required (1-10)
- `bathrooms` is required (1-10)
- `furnishing` is required (must be valid enum)

When `propertyType` is `plot` or `commercial`:
- `bedrooms`, `bathrooms`, `furnishing` should be ignored (strip from body before save)

### 9.9 Response Conventions
- `createProperty` returns 201
- `updateProperty`, `deleteProperty`, `togglePropertyStatus` return 200
- All use `{ success: true, data: { ... } }` format
- Return `.lean()` or `.select()` results, never raw Mongoose documents

---

## 10. Notes for Frontend Developer

### 10.1 propertyService.js Functions

```js
// client/src/services/propertyService.js
import API from "./api";

// Upload images (one at a time for individual progress tracking)
export const uploadImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("images", file);
  const response = await API.post("/upload/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return response.data.data.urls[0]; // single URL since we send 1 file
};

// Upload video
export const uploadVideo = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("video", file);
  const response = await API.post("/upload/video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return response.data.data.url;
};

// Create property
export const createProperty = async (propertyData) => {
  const response = await API.post("/properties", propertyData);
  return response.data.data;
};

// Get my listings
export const getMyProperties = async () => {
  const response = await API.get("/properties/my");
  return response.data.data;
};

// Get single property (for edit pre-fill)
export const getPropertyById = async (id) => {
  const response = await API.get(`/properties/${id}`);
  return response.data.data;
};

// Update property
export const updateProperty = async (id, propertyData) => {
  const response = await API.put(`/properties/${id}`, propertyData);
  return response.data.data;
};

// Delete property
export const deleteProperty = async (id) => {
  const response = await API.delete(`/properties/${id}`);
  return response.data.data;
};

// Toggle status
export const togglePropertyStatus = async (id, newStatus) => {
  const response = await API.patch(`/properties/${id}/status`, { status: newStatus });
  return response.data.data;
};
```

### 10.2 Client-Side Validation (Per Step)

**Step 1:**
| Field | Rule |
|-------|------|
| listingType | Required, must be "sale" or "rent" |
| propertyType | Required, must be one of "flat", "house", "plot", "commercial" |
| title | Required, 5-100 chars |
| description | Required, 20-1000 chars |

**Step 2:**
| Field | Rule |
|-------|------|
| price | Required, positive number, no decimals |
| location.city | Required, non-empty |
| location.area | Required, non-empty |
| location.state | Required, non-empty |
| location.pincode | Optional, if provided must be exactly 6 digits |

**Step 3 (only validate bedrooms/bathrooms/furnishing when propertyType is flat/house):**
| Field | Condition | Rule |
|-------|-----------|------|
| bedrooms | flat/house | Required, 1-10 |
| bathrooms | flat/house | Required, 1-10 |
| furnishing | flat/house | Required, must be valid enum |
| areaSqft | all types | Optional, if provided must be positive |
| amenities | all types | Optional |

**Step 4:**
No blocking validation. Images and video are optional. Show suggestion text: "You can add photos later by editing your listing."

**Step 5:**
| Field | Rule |
|-------|------|
| contactPhone | Required, matches `/^[6-9]\d{9}$/` |
| contactEmail | Required, matches `/^\S+@\S+\.\S+$/` |

### 10.3 Form Data Preparation Before Submit

Before calling the API, transform `formData`:

```js
const prepareSubmitData = (formData) => {
  const data = { ...formData };

  // Convert string numbers to actual numbers
  data.price = Number(data.price);
  if (data.areaSqft) data.areaSqft = Number(data.areaSqft);
  if (data.bedrooms) data.bedrooms = Number(data.bedrooms);
  if (data.bathrooms) data.bathrooms = Number(data.bathrooms);

  // Strip bedrooms/bathrooms/furnishing for plot/commercial
  if (data.propertyType === "plot" || data.propertyType === "commercial") {
    delete data.bedrooms;
    delete data.bathrooms;
    delete data.furnishing;
  }

  // Remove empty optional fields
  if (!data.video) delete data.video;
  if (!data.location.pincode) delete data.location.pincode;
  if (data.amenities.length === 0) delete data.amenities;
  if (data.images.length === 0) delete data.images;

  return data;
};
```

### 10.4 App.jsx Route Changes

```jsx
// New imports
import { ToastProvider } from "./context/ToastContext";
import AddPropertyPage from "./pages/AddPropertyPage";
import MyListingsPage from "./pages/MyListingsPage";
import EditPropertyPage from "./pages/EditPropertyPage";

// Wrap entire app content with ToastProvider (inside AuthProvider):
<AuthProvider>
  <ToastProvider>
    <Navbar />
    <main className="main-content">
      <Routes>
        {/* existing routes */}
        <Route path="/add-property" element={<AddPropertyPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="/edit-property/:id" element={<EditPropertyPage />} />
        </Route>
      </Routes>
    </main>
    <Footer />
  </ToastProvider>
</AuthProvider>
```

Remove the old `/vendor` placeholder route.

### 10.5 Navbar Changes

In `Navbar.jsx`:
1. Change "List Property" link `to` from `/vendor` to `/add-property`
2. Add `"My Listings"` to the user dropdown menu:
```jsx
<button className="dropdown-item" onClick={() => navigate("/my-listings")}>
  My Listings
</button>
```
Place it between the dropdown header and the "My Profile" item.

### 10.6 Indian States and Cities Lists

Hardcode dropdown options for MVP:

```js
// client/src/utils/constants.js
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry"
];

export const SUPPORTED_CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune", "Chennai",
  "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh",
  "Noida", "Gurgaon", "Ghaziabad", "Faridabad", "Indore",
  "Bhopal", "Nagpur", "Kochi", "Coimbatore", "Visakhapatnam",
  "Thiruvananthapuram", "Surat", "Vadodara"
];

export const AMENITIES_LIST = [
  "Parking", "Gym", "Swimming Pool", "Garden", "Security",
  "Elevator", "Power Backup", "Water Supply", "Club House", "Playground"
];
```

### 10.7 Error Handling Pattern

All API calls in page components follow this pattern:

```js
try {
  setLoading(true);
  const data = await propertyService.someFunction(args);
  // handle success
} catch (err) {
  const message = err.response?.data?.error || "Something went wrong. Please try again.";
  // handle error (setError, showToast, etc.)
} finally {
  setLoading(false);
}
```

The `.error` field (not `.message`) matches the backend response convention.

### 10.8 Key CSS Notes

- Reuse existing CSS variables: `--gradient-subtle`, `--error`, `--success`, `--warning`, `--radius-modal`, `--shadow-card-hover`
- Reuse existing class patterns: `form-group`, `btn-primary`, `btn-secondary`, `field-error`, `btn-spinner`
- No inline styles — all styles in dedicated CSS files
- Mobile-first: min 44px touch targets, single-column form layout at all viewports

### 10.9 Accessibility Checklist

- All form inputs have `<label htmlFor="...">`
- Error messages use `aria-describedby` pointing to the error span's `id`
- StepIndicator uses `aria-current="step"` on the active step
- DeleteModal uses `role="dialog"`, `aria-modal="true"`, implements focus trap
- Escape key closes modal
- All buttons have clear text labels or `aria-label`
- Focus-visible outlines preserved (no `outline: none` without alternative)

---

## Appendix: Allowed Amenities (shared constant, backend + frontend)

```
Parking, Gym, Swimming Pool, Garden, Security,
Elevator, Power Backup, Water Supply, Club House, Playground
```

Both backend validation and frontend multi-select must reference the same list. Keep them in sync manually for MVP (no shared package between server and client).

---

## Appendix: Summary of Dependencies Between Agents

| Task | Blocks |
|------|--------|
| Login/Register `?redirect=` support | Everything involving login-at-submit flow |
| Upload routes + Cloudinary | Image/video upload in Step 4 |
| Toast system | All success/error feedback across pages |
| propertyService.js | All frontend pages |
| PropertyForm component | Both AddPropertyPage and EditPropertyPage |
| GET /api/properties/my route | MyListingsPage |

**Recommended build order:**
1. Backend: Upload routes + multer + Cloudinary
2. Backend: Property CRUD endpoints (create, getMyProperties, update, delete, toggleStatus)
3. Frontend: Fix login/register redirect
4. Frontend: Toast system
5. Frontend: propertyService.js
6. Frontend: PropertyForm + StepIndicator + ImageUploader + VideoUploader
7. Frontend: AddPropertyPage (with localStorage flow)
8. Frontend: MyListingsPage + ListingCard + DeleteModal
9. Frontend: EditPropertyPage
10. Frontend: Navbar updates
