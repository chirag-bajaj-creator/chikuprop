# Phase 5 — Software Architect Output: Dashboards & Admin Panel

---

## 1. System Architecture Overview

Phase 5 adds three subsystems to ChikuProp, all sharing the same MongoDB database and Express server:

```
                     ┌──────────────────────────────────┐
                     │          MongoDB Atlas            │
                     │  Users | Properties | Leads |     │
                     │  SavedProperties | RecentlyViewed │
                     │  Grievances                       │
                     └──────────┬───────────────────────┘
                                │
                     ┌──────────┴───────────────────────┐
                     │     Express API Server            │
                     │                                   │
                     │  /api/auth      (existing)        │
                     │  /api/properties (existing)       │
                     │  /api/leads     (existing + new)  │
                     │  /api/saved     (NEW)             │
                     │  /api/recently-viewed (NEW)       │
                     │  /api/dashboard (NEW)             │
                     │  /api/admin     (NEW)             │
                     │  /api/grievances (NEW)            │
                     └──────┬───────────┬───────────────┘
                            │           │
              ┌─────────────┘           └──────────────┐
              │                                        │
   ┌──────────┴──────────┐              ┌──────────────┴─────────┐
   │  Consumer Frontend   │              │  Admin Frontend        │
   │  (React, pink-purple)│              │  (React, dark/neutral) │
   │                      │              │                        │
   │  / (Landing)         │              │  /admin/login          │
   │  /buy, /rent         │              │  /admin/dashboard      │
   │  /dashboard          │              │  /admin/users          │
   │  /vendor/dashboard   │              │  /admin/properties     │
   │  /vendor/leads       │              │  /admin/grievances     │
   └──────────────────────┘              └────────────────────────┘
```

### Key Architectural Decisions

1. **Single Express server** — admin and consumer APIs coexist on the same server, differentiated by route prefix (`/api/admin/*` vs others).
2. **Layered middleware** — admin routes use `protect` then `requireAdmin`. The `protect` middleware gains an `isBlocked` check.
3. **No separate admin auth** — admins use the same JWT mechanism. The frontend checks `role === "admin"` after login.
4. **Layout split in React** — `App.jsx` restructured with `ConsumerLayout` (Navbar + Footer) and `AdminLayout` (sidebar). Routes under `/admin/*` never render consumer chrome.
5. **Grievance model built in Phase 5** — required for admin grievance tracking (M4). Minimal schema, no public submission form yet (that can be Phase 6).

---

## 2. MongoDB Schemas

### 2A. New Model: SavedProperty

**File:** `server/models/SavedProperty.js`

```javascript
const savedPropertySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
    },
  },
  { timestamps: true }
);

// Compound unique index — one user can save a property only once
savedPropertySchema.index({ userId: 1, propertyId: 1 }, { unique: true });

// Fast lookup for "get all saved by user" sorted by newest first
savedPropertySchema.index({ userId: 1, createdAt: -1 });
```

### 2B. New Model: RecentlyViewed

**File:** `server/models/RecentlyViewed.js`

```javascript
const recentlyViewedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// Compound unique index — upsert on re-view updates viewedAt
recentlyViewedSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

// Fast lookup for "get recent views by user" sorted by most recent
recentlyViewedSchema.index({ userId: 1, viewedAt: -1 });
```

**Note:** No `timestamps: true` needed here because `viewedAt` serves as the only relevant timestamp. We omit `createdAt`/`updatedAt` to keep the document lean. However, to follow project convention (CLAUDE.md models rule), add `timestamps: true` anyway — the `viewedAt` field is still the sort key.

**Revised:** Include `timestamps: true` for consistency.

### 2C. New Model: Grievance

**File:** `server/models/Grievance.js`

```javascript
const grievanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      minlength: [5, "Subject must be at least 5 characters"],
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [20, "Message must be at least 20 characters"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Fast lookup for admin listing sorted by newest
grievanceSchema.index({ status: 1, createdAt: -1 });

// Fast lookup for user's own grievances
grievanceSchema.index({ userId: 1, createdAt: -1 });
```

### 2D. Modified Model: User (isBlocked field)

**File:** `server/models/User.js` — ADD this field to the existing schema:

```javascript
isBlocked: {
  type: Boolean,
  default: false,
},
```

**Where to add:** After the `avatar` field, before the schema options. Existing users in production will not have this field — Mongoose defaults it to `false` automatically. No migration needed.

### 2E. Modified Model: Property (expanded status enum)

**File:** `server/models/Property.js` — CHANGE the status enum:

```javascript
// BEFORE:
status: {
  type: String,
  enum: ["active", "paused", "expired"],
  default: "active",
},

// AFTER:
status: {
  type: String,
  enum: ["active", "paused", "expired", "flagged", "rejected"],
  default: "active",
},
```

**Impact check:** The existing `getProperties` controller already filters `status: "active"`, so flagged/rejected properties will NOT appear in public listings. The `togglePropertyStatus` controller only allows "active"/"paused" — this is correct, vendors should not be able to set flagged/rejected. Only admins can set those statuses via the admin API.

---

## 3. API Contracts

### Response Format Convention (existing pattern)
```
Success: { success: true, data: { ... } }
Success with pagination: { success: true, data: [...], pagination: { page, limit, total, pages } }
Error: { success: false, error: "Human-readable message" }
```

---

### 3A. Saved Property APIs

**Route file:** `server/routes/savedRoutes.js`
**Controller file:** `server/controllers/savedController.js`
**Mount point:** `app.use("/api/saved", savedRoutes)` in server.js

---

#### POST /api/saved/:propertyId — Toggle save/unsave

**Middleware:** `protect`

**Request:**
- Params: `propertyId` (MongoDB ObjectId)
- Body: none

**Logic:**
1. Validate `propertyId` is a valid ObjectId
2. Verify property exists and is active
3. Check if SavedProperty doc exists for this user+property
4. If exists: delete it (unsave), return `{ saved: false }`
5. If not exists: create it (save), return `{ saved: true }`

**Response (200):**
```json
{ "success": true, "data": { "saved": true } }
```
or
```json
{ "success": true, "data": { "saved": false } }
```

**Errors:**
- 400: Invalid property ID
- 401: Not authorized
- 404: Property not found
- 500: Server error

---

#### GET /api/saved — Get user's saved properties

**Middleware:** `protect`

**Request:**
- Query: `page` (default 1), `limit` (default 12, max 50)

**Logic:**
1. Find all SavedProperty docs for `req.user._id`, sorted by `createdAt: -1`
2. Populate `propertyId` with: `title price location images listingType propertyType status viewCount`
3. Filter out entries where populated property is null (deleted properties)
4. Paginate

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "savedPropId",
      "propertyId": { "_id": "...", "title": "...", "price": 5000000, "location": {...}, "images": [...], "listingType": "sale", "propertyType": "flat", "status": "active" },
      "createdAt": "2026-03-20T..."
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 25, "pages": 3 }
}
```

---

#### GET /api/saved/check/:propertyId — Check if single property is saved

**Middleware:** `protect`

**Request:**
- Params: `propertyId`

**Logic:**
1. Validate ObjectId
2. Check if SavedProperty doc exists for user+property

**Response (200):**
```json
{ "success": true, "data": { "saved": true } }
```

---

#### GET /api/saved/check-batch — Batch check saved status

**Middleware:** `protect`

**Request:**
- Query: `ids` — comma-separated property IDs (e.g., `ids=id1,id2,id3`)

**Logic:**
1. Parse and validate IDs (max 50 per request to prevent abuse)
2. Find all SavedProperty docs matching `userId` + `propertyId $in [ids]`
3. Return a map of `{ propertyId: true }` for saved ones

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id1": true,
    "id3": true
  }
}
```

Properties not in the response map are not saved (falsy by absence).

**Errors:**
- 400: "Provide property IDs as comma-separated query param"
- 400: "Maximum 50 IDs per batch check"

---

### 3B. Recently Viewed APIs

**Route file:** `server/routes/recentlyViewedRoutes.js`
**Controller file:** `server/controllers/recentlyViewedController.js`
**Mount point:** `app.use("/api/recently-viewed", recentlyViewedRoutes)` in server.js

---

#### POST /api/recently-viewed/:propertyId — Record a view

**Middleware:** `protect`

**Request:**
- Params: `propertyId`

**Logic:**
1. Validate ObjectId
2. Verify property exists
3. Upsert: `findOneAndUpdate({ userId, propertyId }, { viewedAt: new Date() }, { upsert: true })`

**Response (200):**
```json
{ "success": true, "data": { "recorded": true } }
```

**Note:** This is a fire-and-forget call from the frontend. The frontend should NOT block rendering on this response. Call it in a `useEffect` on PropertyDetail mount, catch errors silently.

---

#### GET /api/recently-viewed — Get user's recent views

**Middleware:** `protect`

**Request:**
- Query: `limit` (default 20, max 50)

**Logic:**
1. Find RecentlyViewed docs for `req.user._id`, sorted by `viewedAt: -1`, limit to requested count
2. Populate `propertyId` with: `title price location images listingType propertyType status`
3. Filter out null-populated entries (deleted properties)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "rvId",
      "propertyId": { "_id": "...", "title": "...", "price": 5000000, ... },
      "viewedAt": "2026-03-22T..."
    }
  ]
}
```

---

### 3C. Dashboard APIs

**Route file:** `server/routes/dashboardRoutes.js`
**Controller file:** `server/controllers/dashboardController.js`
**Mount point:** `app.use("/api/dashboard", dashboardRoutes)` in server.js

---

#### GET /api/dashboard/vendor — Vendor stats

**Middleware:** `protect`

**Logic:** Run aggregation queries using `req.user._id`:
1. `Property.countDocuments({ vendorId })` — total listings
2. `Property.aggregate([{ $match: { vendorId } }, { $group: { _id: null, totalViews: { $sum: "$viewCount" }, totalUnlocks: { $sum: "$contactUnlockCount" } } }])` — total views + unlocks
3. `Lead.countDocuments({ vendorId })` — total leads

Use `Promise.all` for parallel execution.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalListings": 12,
    "totalViews": 340,
    "totalLeads": 28,
    "totalUnlocks": 45
  }
}
```

---

#### GET /api/dashboard/buyer — Buyer's contacted properties

**Middleware:** `protect`

**Logic:**
1. Find leads where `userId === req.user._id`, populate `propertyId` with card-level fields
2. Return populated property data (deduplicated by propertyId)

**Note:** This replaces the need for a separate `GET /api/leads/my` endpoint. We add it to the dashboard controller since it is dashboard-specific.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "leadId",
      "propertyId": { "_id": "...", "title": "...", "price": ..., "location": {...}, "images": [...] },
      "createdAt": "2026-03-15T..."
    }
  ]
}
```

---

### 3D. Admin APIs

**Route file:** `server/routes/adminRoutes.js`
**Controller file:** `server/controllers/adminController.js`
**Mount point:** `app.use("/api/admin", adminRoutes)` in server.js

**All admin routes apply:** `router.use(protect, requireAdmin)` at the top of the route file.

---

#### GET /api/admin/stats — Site-wide analytics

**Logic:** Parallel aggregation:
1. `User.countDocuments()` — total users
2. `Property.countDocuments()` — total listings
3. `Property.countDocuments({ status: "active" })` — active listings
4. `Property.countDocuments({ status: "paused" })` — paused listings
5. `Property.countDocuments({ status: "expired" })` — expired listings
6. `Property.countDocuments({ status: "flagged" })` — flagged listings
7. `Property.countDocuments({ status: "rejected" })` — rejected listings
8. `Property.aggregate([ { $group: { _id: null, totalViews: { $sum: "$viewCount" } } } ])` — total views
9. `Lead.countDocuments()` — total leads

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalListings": 85,
    "activeListings": 60,
    "pausedListings": 10,
    "expiredListings": 8,
    "flaggedListings": 5,
    "rejectedListings": 2,
    "totalViews": 12400,
    "totalLeads": 320
  }
}
```

---

#### GET /api/admin/users — List users with search + pagination

**Query params:** `search` (string), `page` (default 1), `limit` (default 20, max 50)

**Logic:**
1. Build filter: if `search` provided, match against `name` or `email` using case-insensitive regex (use `escapeRegex` from existing utils)
2. Exclude password field (`.select("-password")`)
3. Sort by `createdAt: -1`
4. Paginate

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "userId",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "9876543210",
      "role": "user",
      "isBlocked": false,
      "createdAt": "2026-01-15T..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 150, "pages": 8 }
}
```

---

#### PATCH /api/admin/users/:id/block — Toggle block/unblock

**Request body:**
```json
{ "isBlocked": true }
```

**Logic:**
1. Validate `id` is valid ObjectId
2. Validate `isBlocked` is a boolean
3. Prevent admin from blocking themselves: `if (req.params.id === req.user._id.toString())` return 400
4. Prevent blocking other admins: find user, check role, return 400 if admin
5. Update `isBlocked` field
6. Return updated user (sans password)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "userId",
    "name": "Bad Actor",
    "email": "bad@example.com",
    "isBlocked": true
  }
}
```

**Errors:**
- 400: "isBlocked must be a boolean"
- 400: "Cannot block yourself"
- 400: "Cannot block admin users"
- 404: "User not found"

---

#### GET /api/admin/properties — All properties with filters + pagination

**Query params:** `status` (string, optional), `search` (string, optional), `page`, `limit`

**Logic:**
1. Build filter — if `status` provided, filter by it; otherwise return all statuses
2. If `search` provided, match against `title` (regex)
3. Populate `vendorId` with `name email`
4. Sort by `createdAt: -1`
5. Paginate

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "propertyId",
      "title": "3BHK in Bandra",
      "vendorId": { "_id": "...", "name": "Seller Name", "email": "seller@email.com" },
      "location": { "city": "Mumbai", "area": "Bandra", "state": "Maharashtra" },
      "listingType": "sale",
      "propertyType": "flat",
      "status": "active",
      "planType": "free",
      "createdAt": "2026-03-10T..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 85, "pages": 5 }
}
```

---

#### PATCH /api/admin/properties/:id/status — Update property status

**Request body:**
```json
{ "status": "flagged" }
```

**Logic:**
1. Validate `status` is one of: `["active", "paused", "expired", "flagged", "rejected"]`
2. Find property, update status
3. Return updated property (minimal fields)

**Response (200):**
```json
{
  "success": true,
  "data": { "_id": "propertyId", "title": "...", "status": "flagged" }
}
```

---

#### DELETE /api/admin/properties/:id — Hard delete a property

**Logic:**
1. Find property, verify it exists
2. Delete the property document
3. Also delete associated SavedProperty and RecentlyViewed docs (cleanup)
4. Note: Leads are kept for historical data

**Response (200):**
```json
{ "success": true, "data": { "message": "Property deleted successfully" } }
```

---

#### GET /api/admin/grievances — List grievances with filters + pagination

**Query params:** `status` (string, optional), `page`, `limit`

**Logic:**
1. Build filter by status if provided
2. Populate `userId` with `name email`
3. Sort by `createdAt: -1`
4. Paginate

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "grievanceId",
      "userId": { "_id": "...", "name": "User Name", "email": "user@email.com" },
      "subject": "Property listing issue",
      "message": "...",
      "status": "pending",
      "createdAt": "2026-03-18T..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 12, "pages": 1 }
}
```

---

#### PATCH /api/admin/grievances/:id/status — Update grievance status

**Request body:**
```json
{ "status": "in-progress" }
```

**Logic:**
1. Validate `status` is one of `["pending", "in-progress", "resolved"]`
2. Find grievance, update status
3. Return updated grievance

**Response (200):**
```json
{
  "success": true,
  "data": { "_id": "grievanceId", "subject": "...", "status": "in-progress" }
}
```

---

### 3E. Grievance Submission API (Minimal — for future public use)

**Route file:** `server/routes/grievanceRoutes.js`
**Controller file:** `server/controllers/grievanceController.js`
**Mount point:** `app.use("/api/grievances", grievanceRoutes)` in server.js

#### POST /api/grievances — Submit a grievance

**Middleware:** `protect`

**Request body:**
```json
{
  "subject": "Issue with property listing",
  "message": "I found a fraudulent listing at..."
}
```

**Logic:**
1. Validate subject (5-200 chars) and message (20-2000 chars)
2. Create Grievance doc with `userId: req.user._id`, status "pending"

**Response (201):**
```json
{
  "success": true,
  "data": { "_id": "grievanceId", "subject": "...", "status": "pending", "createdAt": "..." }
}
```

**Note:** The public grievance submission form is not part of Phase 5 frontend. This API is built so the admin grievance tracking (M4) has data to work with. Grievances can be seeded manually or the submission form can be added in Phase 6.

---

### 3F. New Lead Endpoint for Buyer Dashboard

Add to existing `server/controllers/leadController.js` and `server/routes/leadRoutes.js`:

#### GET /api/leads/my — Get properties the current user has unlocked

**Middleware:** `protect`

**Logic:**
1. Find leads where `userId === req.user._id`
2. Populate `propertyId` with: `title price location images listingType propertyType status`
3. Sort by `createdAt: -1`
4. Limit to 20

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "leadId",
      "propertyId": { "_id": "...", "title": "...", ... },
      "createdAt": "2026-03-15T..."
    }
  ]
}
```

---

## 4. Auth & Security Architecture

### 4A. New Middleware: requireAdmin

**File:** `server/middleware/auth.js` (add to existing file)

```javascript
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Access denied — admin only" });
  }
  next();
};
```

**Usage pattern:**
```javascript
// In adminRoutes.js
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/auth");

router.use(protect, requireAdmin);
// All routes below are admin-only
```

### 4B. isBlocked Check in protect Middleware

**Modification to existing `protect` middleware in `server/middleware/auth.js`:**

After `const user = await User.findById(decoded.id)` and the null check, add:

```javascript
if (user.isBlocked) {
  return res.status(403).json({ success: false, error: "Account blocked — contact support" });
}
```

**Full updated protect flow:**
1. Extract Bearer token from Authorization header
2. Verify JWT
3. Find user by decoded ID
4. If user not found: 401
5. **If user.isBlocked is true: 403 "Account blocked"** (NEW)
6. Set `req.user = user`
7. Call `next()`

### 4C. Frontend Admin Auth

The admin panel does NOT use a separate auth system. It uses the same `AuthContext` and JWT token:

1. Admin navigates to `/admin/login`
2. Submits email + password to `POST /api/auth/login` (existing endpoint)
3. Frontend receives user data including `role`
4. If `role !== "admin"`, show error "Access denied — admin only" and do NOT store the token
5. If `role === "admin"`, store token and redirect to `/admin/dashboard`

**AdminProtectedRoute component** (new, similar to existing `ProtectedRoute`):
- Checks `user.role === "admin"`
- If not admin, redirects to `/admin/login`
- Wraps all `/admin/*` routes except `/admin/login`

### 4D. Security Considerations

1. **Rate limiting on admin routes** — Not required for Phase 5 but recommended for Phase 6. Document as a future improvement.
2. **Admin cannot block themselves** — Enforced in the block API.
3. **Admin cannot block other admins** — Enforced in the block API.
4. **Blocked users get 403 on ALL authenticated requests** — The protect middleware check ensures immediate lockout.
5. **No admin creation flow** — Seed one admin directly in MongoDB. This is acceptable for Phase 5.
6. **Batch check ID limit** — Max 50 IDs per request to prevent denial-of-service via large queries.

---

## 5. Frontend Component Architecture

### 5A. App.jsx Restructure

The current `App.jsx` wraps ALL routes with `Navbar` and `Footer`. This must change to a layout-based routing pattern:

```
App.jsx
├── BrowserRouter
│   ├── AuthProvider
│   │   ├── ToastProvider
│   │   │   ├── Routes
│   │   │   │   ├── ConsumerLayout (Navbar + Footer + GrievanceWidget)
│   │   │   │   │   ├── / (Landing)
│   │   │   │   │   ├── /buy (BuyPage)
│   │   │   │   │   ├── /rent (RentPage)
│   │   │   │   │   ├── /property/:id (PropertyDetail)
│   │   │   │   │   ├── /login (LoginPage)
│   │   │   │   │   ├── /register (RegisterPage)
│   │   │   │   │   ├── /advertise (AdvertisePage)
│   │   │   │   │   ├── /grievances (GrievancesPage)
│   │   │   │   │   ├── /add-property (AddPropertyPage)
│   │   │   │   │   ├── ProtectedRoute wrapper
│   │   │   │   │   │   ├── /my-listings
│   │   │   │   │   │   ├── /edit-property/:id
│   │   │   │   │   │   ├── /dashboard (BuyerDashboard)
│   │   │   │   │   │   ├── /vendor/dashboard (VendorDashboard)
│   │   │   │   │   │   └── /vendor/leads (VendorLeads)
│   │   │   │   ├── /admin/login (AdminLoginPage — no layout)
│   │   │   │   ├── AdminProtectedRoute wrapper
│   │   │   │   │   └── AdminLayout (sidebar + content)
│   │   │   │   │       ├── /admin/dashboard (AdminDashboard)
│   │   │   │   │       ├── /admin/users (AdminUsers)
│   │   │   │   │       ├── /admin/properties (AdminProperties)
│   │   │   │   │       └── /admin/grievances (AdminGrievances)
```

**Implementation approach:** Use React Router's layout route feature:
```jsx
<Route element={<ConsumerLayout />}>
  {/* all consumer routes */}
</Route>
<Route path="/admin/login" element={<AdminLoginPage />} />
<Route element={<AdminProtectedRoute />}>
  <Route element={<AdminLayout />}>
    {/* all admin routes */}
  </Route>
</Route>
```

### 5B. New Layout Components

#### ConsumerLayout
**File:** `client/src/components/layouts/ConsumerLayout.jsx`

Extracts the existing Navbar + Footer + GrievanceWidget wrapper from App.jsx:
```jsx
function ConsumerLayout() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <GrievanceWidget />
      <Footer />
    </>
  );
}
```

#### AdminLayout
**File:** `client/src/components/layouts/AdminLayout.jsx`
**CSS File:** `client/src/components/layouts/AdminLayout.css`

Structure:
```
┌─────────────────────────────────────────┐
│ Top Bar (admin name, logout)            │
├──────────┬──────────────────────────────┤
│ Sidebar  │ Content Area                 │
│ (240px)  │ (<Outlet />)                │
│          │                              │
│ Dashboard│                              │
│ Users    │                              │
│ Properties                              │
│ Grievances                              │
│          │                              │
│ Logout   │                              │
└──────────┴──────────────────────────────┘
```

- Dark sidebar (charcoal/navy), light content area
- Sidebar nav items with icons + labels
- Active item highlighted
- Mobile: sidebar collapses behind hamburger toggle
- Uses `useAuth()` for admin name and logout

#### AdminProtectedRoute
**File:** `client/src/components/auth/AdminProtectedRoute.jsx`

```jsx
function AdminProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
```

### 5C. New Page Components

| Page | File Path | Route |
|------|-----------|-------|
| BuyerDashboard | `client/src/pages/BuyerDashboard.jsx` | `/dashboard` |
| VendorDashboard | `client/src/pages/VendorDashboard.jsx` | `/vendor/dashboard` |
| VendorLeads | `client/src/pages/VendorLeads.jsx` | `/vendor/leads` |
| AdminLoginPage | `client/src/pages/admin/AdminLoginPage.jsx` | `/admin/login` |
| AdminDashboard | `client/src/pages/admin/AdminDashboard.jsx` | `/admin/dashboard` |
| AdminUsers | `client/src/pages/admin/AdminUsers.jsx` | `/admin/users` |
| AdminProperties | `client/src/pages/admin/AdminProperties.jsx` | `/admin/properties` |
| AdminGrievances | `client/src/pages/admin/AdminGrievances.jsx` | `/admin/grievances` |

### 5D. New Service Files

| Service | File Path | Purpose |
|---------|-----------|---------|
| savedService | `client/src/services/savedService.js` | Save/unsave, get saved, check saved, batch check |
| recentlyViewedService | `client/src/services/recentlyViewedService.js` | Record view, get recent views |
| dashboardService | `client/src/services/dashboardService.js` | Vendor stats, buyer contacted |
| adminService | `client/src/services/adminService.js` | All admin API calls |

**Pattern (matches existing `leadService.js`):**
```javascript
import API from "./api";

export const saveProperty = (propertyId) =>
  API.post(`/saved/${propertyId}`);

export const getSavedProperties = (params) =>
  API.get("/saved", { params });

// etc.
```

### 5E. PropertyCard Modification (Heart Icon)

**File:** `client/src/components/common/PropertyCard.jsx`

Add heart icon overlay on the image area:
- Position: absolute, top-right of image container
- State: `isSaved` boolean (from batch check or individual check)
- On click: `e.stopPropagation()` + `e.preventDefault()`, then call toggle save API
- If not logged in: redirect to `/login?redirect=currentPath`
- Visual: outline heart (not saved) / filled red heart (saved)
- Uses `useAuth()` to check login status

**New prop:** `isSaved` (boolean) and `onToggleSave` (callback) — passed from parent pages that do the batch check.

### 5F. Frontend 401 Handling for Blocked Users

The existing `api.js` interceptor already handles 401 by redirecting to login. For blocked users (403), we need to add handling:

**Modification to `client/src/services/api.js`:**
In the response error interceptor, add a check for 403 with the "Account blocked" error message. When detected, clear the token and redirect to `/login` with a message parameter.

---

## 6. Error Handling Guidelines

### Backend Error Handling

1. **Every async controller** wraps logic in try-catch. On catch, return `{ success: false, error: "Human-readable message" }` with appropriate status code.
2. **Input validation** happens BEFORE any database operation. Return 400 for invalid input.
3. **ObjectId validation** — use `mongoose.isValidObjectId()` before any `findById` call. Return 400 if invalid.
4. **Duplicate key errors** (code 11000) — catch in the catch block and return a friendly message (e.g., "Property already saved").
5. **Population null checks** — after populating refs, filter out entries where the referenced doc was deleted.
6. **Admin actions** — always verify the target exists before modifying. Return 404 if not found.

### Frontend Error Handling

1. **Every API call** in services returns the axios promise. Components use try-catch in their handlers.
2. **Loading state** — every page/component that fetches data shows a `<Loader />` while loading.
3. **Error state** — every page/component shows an error message when the API call fails. Use the existing `ErrorState` component or inline error display.
4. **Toast notifications** — use `ToastContext` for save/unsave feedback, block/unblock confirmations, and status change confirmations.
5. **Empty states** — every list/table shows a meaningful empty state message when there is no data.
6. **Optimistic UI for heart toggle** — update the heart icon immediately on click, revert if the API call fails. This prevents perceived lag.

---

## 7. Technical Risks

### RISK 1 — Grievance Model Does Not Exist (HIGH)
**Status:** Resolved by this architecture. We create a minimal Grievance model and a `POST /api/grievances` endpoint. No public submission form in Phase 5 — grievances can be seeded or the form added in Phase 6.

### RISK 2 — User Model Schema Change: isBlocked (MEDIUM)
**Mitigation:** `default: false` in schema. Mongoose handles missing fields on existing docs. The protect middleware check (`if (user.isBlocked)`) evaluates `undefined` as falsy, so existing users are unaffected even before the field is set. Tested by: creating a user without the field and verifying they can still authenticate.

### RISK 3 — Property Status Enum Expansion (MEDIUM)
**Mitigation:** The existing `getProperties` controller already filters `status: "active"`. The `togglePropertyStatus` controller only allows `["active", "paused"]` — vendors cannot set flagged/rejected. Only the admin `PATCH /api/admin/properties/:id/status` can set all 5 statuses. No existing data is affected.

### RISK 4 — App.jsx Layout Split (MEDIUM)
**Mitigation:** Use React Router's layout route pattern. The `ConsumerLayout` component extracts the existing Navbar+Footer wrapper. All existing routes continue to work identically. Admin routes are added as a separate branch. This is a structural refactor of App.jsx but does not change any existing page behavior.

### RISK 5 — Batch Check Performance (LOW)
**Mitigation:** The `GET /api/saved/check-batch` endpoint is capped at 50 IDs. The compound index on `{ userId, propertyId }` makes this query fast. For listing pages with 12 properties, this is a single query returning at most 12 results.

### RISK 6 — Admin Stats Aggregation Performance (LOW)
**Mitigation:** The `GET /api/admin/stats` endpoint runs multiple `countDocuments` and one `aggregate` call. On a small dataset (hundreds to low thousands of docs), this is fast. For scale, add caching (Redis or in-memory with TTL) in Phase 6+.

### RISK 7 — Blocked User Token Still Valid (LOW)
**Mitigation:** When a user is blocked, their existing JWT is not invalidated — it is still cryptographically valid. However, every authenticated request goes through the `protect` middleware which now checks `isBlocked`. So the JWT passes verification, but the user is rejected at the isBlocked check. This is immediate and effective. Full JWT invalidation (token blacklist) is not needed for Phase 5.

---

## 8. Implementation Sequence

Build order designed to minimize blockers — each step can be tested independently.

### Sprint 1 — Backend Foundation (build first, test with Postman/curl)

| Step | Task | Files Created/Modified | Depends On |
|------|------|----------------------|------------|
| 1.1 | Add `isBlocked` to User model | `server/models/User.js` | Nothing |
| 1.2 | Add `isBlocked` check to `protect` middleware | `server/middleware/auth.js` | 1.1 |
| 1.3 | Add `requireAdmin` middleware | `server/middleware/auth.js` | Nothing |
| 1.4 | Expand Property status enum | `server/models/Property.js` | Nothing |
| 1.5 | Create SavedProperty model | `server/models/SavedProperty.js` | Nothing |
| 1.6 | Create RecentlyViewed model | `server/models/RecentlyViewed.js` | Nothing |
| 1.7 | Create Grievance model | `server/models/Grievance.js` | Nothing |
| 1.8 | Build saved controller + routes | `server/controllers/savedController.js`, `server/routes/savedRoutes.js` | 1.5 |
| 1.9 | Build recentlyViewed controller + routes | `server/controllers/recentlyViewedController.js`, `server/routes/recentlyViewedRoutes.js` | 1.6 |
| 1.10 | Build dashboard controller + routes | `server/controllers/dashboardController.js`, `server/routes/dashboardRoutes.js` | Nothing |
| 1.11 | Add `getMyLeads` to leadController + route | `server/controllers/leadController.js`, `server/routes/leadRoutes.js` | Nothing |
| 1.12 | Build admin controller + routes | `server/controllers/adminController.js`, `server/routes/adminRoutes.js` | 1.1, 1.3, 1.4, 1.7 |
| 1.13 | Build grievance submission controller + routes | `server/controllers/grievanceController.js`, `server/routes/grievanceRoutes.js` | 1.7 |
| 1.14 | Mount all new routes in server.js | `server/server.js` | 1.8–1.13 |

### Sprint 2 — Consumer Frontend

| Step | Task | Files Created/Modified | Depends On |
|------|------|----------------------|------------|
| 2.1 | Create service files (savedService, recentlyViewedService, dashboardService) | `client/src/services/savedService.js`, `recentlyViewedService.js`, `dashboardService.js` | Sprint 1 APIs |
| 2.2 | Create ConsumerLayout component | `client/src/components/layouts/ConsumerLayout.jsx` | Nothing |
| 2.3 | Add heart icon to PropertyCard | `client/src/components/common/PropertyCard.jsx`, `PropertyCard.css` | 2.1 |
| 2.4 | Build VendorDashboard page | `client/src/pages/VendorDashboard.jsx`, `.css` | 2.1 |
| 2.5 | Build VendorLeads page | `client/src/pages/VendorLeads.jsx`, `.css` | Existing leadService |
| 2.6 | Build BuyerDashboard page | `client/src/pages/BuyerDashboard.jsx`, `.css` | 2.1 |
| 2.7 | Add recently-viewed tracking to PropertyDetail | `client/src/pages/PropertyDetail.jsx` | 2.1 |
| 2.8 | Restructure App.jsx with ConsumerLayout + new routes | `client/src/App.jsx` | 2.2, 2.3–2.6 |

### Sprint 3 — Admin Frontend

| Step | Task | Files Created/Modified | Depends On |
|------|------|----------------------|------------|
| 3.1 | Create adminService | `client/src/services/adminService.js` | Sprint 1 APIs |
| 3.2 | Create AdminProtectedRoute | `client/src/components/auth/AdminProtectedRoute.jsx` | Nothing |
| 3.3 | Build AdminLayout (sidebar + content) | `client/src/components/layouts/AdminLayout.jsx`, `.css` | Nothing |
| 3.4 | Build AdminLoginPage | `client/src/pages/admin/AdminLoginPage.jsx`, `.css` | Nothing |
| 3.5 | Build AdminDashboard page | `client/src/pages/admin/AdminDashboard.jsx`, `.css` | 3.1 |
| 3.6 | Build AdminUsers page | `client/src/pages/admin/AdminUsers.jsx`, `.css` | 3.1 |
| 3.7 | Build AdminProperties page | `client/src/pages/admin/AdminProperties.jsx`, `.css` | 3.1 |
| 3.8 | Build AdminGrievances page | `client/src/pages/admin/AdminGrievances.jsx`, `.css` | 3.1 |
| 3.9 | Add admin routes to App.jsx | `client/src/App.jsx` | 3.2–3.8 |
| 3.10 | Add blocked-user 403 handling to api.js interceptor | `client/src/services/api.js` | 1.2 |

### Sprint 4 — Integration & Polish

| Step | Task |
|------|------|
| 4.1 | End-to-end testing: save/unsave flow |
| 4.2 | End-to-end testing: vendor dashboard + leads |
| 4.3 | End-to-end testing: buyer dashboard |
| 4.4 | End-to-end testing: admin login + dashboard |
| 4.5 | End-to-end testing: admin user block/unblock |
| 4.6 | End-to-end testing: admin property moderation |
| 4.7 | Responsive testing (mobile/tablet) for all new pages |
| 4.8 | Seed one admin user in MongoDB for testing |

---

## 9. File Summary — All New & Modified Files

### New Files (Backend)
```
server/models/SavedProperty.js
server/models/RecentlyViewed.js
server/models/Grievance.js
server/controllers/savedController.js
server/controllers/recentlyViewedController.js
server/controllers/dashboardController.js
server/controllers/adminController.js
server/controllers/grievanceController.js
server/routes/savedRoutes.js
server/routes/recentlyViewedRoutes.js
server/routes/dashboardRoutes.js
server/routes/adminRoutes.js
server/routes/grievanceRoutes.js
```

### Modified Files (Backend)
```
server/models/User.js              — add isBlocked field
server/models/Property.js          — expand status enum
server/middleware/auth.js           — add isBlocked check + requireAdmin
server/controllers/leadController.js — add getMyLeads function
server/routes/leadRoutes.js        — add GET /my route
server/server.js                   — mount 5 new route files
```

### New Files (Frontend)
```
client/src/components/layouts/ConsumerLayout.jsx
client/src/components/layouts/AdminLayout.jsx
client/src/components/layouts/AdminLayout.css
client/src/components/auth/AdminProtectedRoute.jsx
client/src/services/savedService.js
client/src/services/recentlyViewedService.js
client/src/services/dashboardService.js
client/src/services/adminService.js
client/src/pages/BuyerDashboard.jsx
client/src/pages/BuyerDashboard.css
client/src/pages/VendorDashboard.jsx
client/src/pages/VendorDashboard.css
client/src/pages/VendorLeads.jsx
client/src/pages/VendorLeads.css
client/src/pages/admin/AdminLoginPage.jsx
client/src/pages/admin/AdminLoginPage.css
client/src/pages/admin/AdminDashboard.jsx
client/src/pages/admin/AdminDashboard.css
client/src/pages/admin/AdminUsers.jsx
client/src/pages/admin/AdminUsers.css
client/src/pages/admin/AdminProperties.jsx
client/src/pages/admin/AdminProperties.css
client/src/pages/admin/AdminGrievances.jsx
client/src/pages/admin/AdminGrievances.css
```

### Modified Files (Frontend)
```
client/src/components/common/PropertyCard.jsx  — add heart icon
client/src/components/common/PropertyCard.css  — heart icon styles
client/src/pages/PropertyDetail.jsx            — add recently-viewed tracking
client/src/services/api.js                     — add 403 blocked-user handling
client/src/App.jsx                             — restructure with layouts + new routes
```