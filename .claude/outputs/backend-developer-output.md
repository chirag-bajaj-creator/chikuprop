# Phase 5 — Backend Developer Output: Dashboards & Admin Panel

## Implementation Summary

All backend code for Phase 5 has been implemented following the architect's specifications and matching existing code patterns exactly.

---

## 1. New Models Created

### SavedProperty — `server/models/SavedProperty.js`
- Fields: `userId` (ObjectId ref User), `propertyId` (ObjectId ref Property)
- Compound unique index on `{ userId: 1, propertyId: 1 }` to prevent duplicates
- Secondary index on `{ userId: 1, createdAt: -1 }` for fast sorted lookups
- Timestamps enabled

### RecentlyViewed — `server/models/RecentlyViewed.js`
- Fields: `userId` (ObjectId ref User), `propertyId` (ObjectId ref Property), `viewedAt` (Date, default now)
- Compound unique index on `{ userId: 1, propertyId: 1 }` for upsert behavior
- Secondary index on `{ userId: 1, viewedAt: -1 }` for sorted lookups
- Timestamps enabled

### Grievance — `server/models/Grievance.js`
- Fields: `userId` (ObjectId ref User), `subject` (String, 5-200 chars), `message` (String, 20-2000 chars), `category` (enum: listing/account/payment/technical/other), `status` (enum: pending/in-progress/resolved), `adminNotes` (String, max 1000 chars)
- Indexes on `{ status: 1, createdAt: -1 }` and `{ userId: 1, createdAt: -1 }`
- Timestamps enabled

---

## 2. Model Updates

### User.js — `server/models/User.js`
- Added `isBlocked: { type: Boolean, default: false }` field after `avatar`
- Existing users default to `false` — no migration needed

### Property.js — `server/models/Property.js`
- Expanded status enum from `["active", "paused", "expired"]` to `["active", "paused", "expired", "flagged", "rejected"]`
- Existing `getProperties` controller already filters `status: "active"`, so flagged/rejected properties are excluded from public listings
- Vendor's `togglePropertyStatus` only allows "active"/"paused" — vendors cannot set flagged/rejected

---

## 3. Middleware Updates — `server/middleware/auth.js`

### `protect` middleware (updated)
- Added `isBlocked` check after user lookup: returns 403 "Account blocked — contact support" if `user.isBlocked` is true
- All authenticated routes now automatically reject blocked users

### `requireAdmin` middleware (new)
- Checks `req.user.role === "admin"`, returns 403 "Access denied — admin only" if not
- Exported alongside `protect` from the same file

---

## 4. New Controllers

### savedController.js — `server/controllers/savedController.js`
| Function | Description |
|----------|-------------|
| `saveProperty` | POST /api/saved/:propertyId — Toggle save (if exists: unsave; else: save). Validates ObjectId, checks property exists. Handles duplicate key race condition. |
| `unsaveProperty` | DELETE /api/saved/:propertyId — Explicit unsave. Returns 404 if not saved. |
| `getSavedProperties` | GET /api/saved — Paginated list of saved properties with populated property data. Filters out deleted properties. |
| `checkSaved` | GET /api/saved/check/:propertyId — Returns `{ saved: true/false }` for a single property. |
| `checkSavedBatch` | GET /api/saved/check-batch?ids=id1,id2,id3 — Batch check up to 50 IDs. Returns map of `{ propertyId: true }`. |

### recentlyViewedController.js — `server/controllers/recentlyViewedController.js`
| Function | Description |
|----------|-------------|
| `recordView` | POST /api/recently-viewed/:propertyId — Upsert: updates viewedAt if exists, creates if not. Validates property exists. |
| `getRecentlyViewed` | GET /api/recently-viewed?limit=20 — Returns recent views sorted by viewedAt desc, max 50. Filters out deleted properties. |

### dashboardController.js — `server/controllers/dashboardController.js`
| Function | Description |
|----------|-------------|
| `getVendorStats` | GET /api/dashboard/vendor — Returns totalListings, totalViews, totalLeads, totalUnlocks using Promise.all for parallel aggregation. |
| `getBuyerContacted` | GET /api/dashboard/buyer — Paginated list of properties the buyer unlocked contact for, with populated property data. |

### adminController.js — `server/controllers/adminController.js`
| Function | Description |
|----------|-------------|
| `getAdminStats` | GET /api/admin/stats — Returns totalUsers, totalListings, activeListings, pausedListings, expiredListings, flaggedListings, rejectedListings, totalViews, totalLeads. Uses Promise.all with 9 parallel queries. |
| `getUsers` | GET /api/admin/users?search=&page=&limit= — Paginated user list with search by name/email. Excludes password field. |
| `blockUser` | PATCH /api/admin/users/:id/block — Toggle block/unblock. Validates isBlocked is boolean. Prevents blocking self or other admins. |
| `getAdminProperties` | GET /api/admin/properties?status=&search=&page=&limit= — Paginated property list with status filter and title search. Populates vendor name/email. |
| `updatePropertyStatus` | PATCH /api/admin/properties/:id/status — Updates property status. Validates against full enum including flagged/rejected. |
| `deleteAdminProperty` | DELETE /api/admin/properties/:id — Hard deletes property + cleans up SavedProperty and RecentlyViewed records. Keeps Lead records for history. |
| `getGrievances` | GET /api/admin/grievances?status=&page=&limit= — Paginated grievance list with status filter. Populates user name/email. |
| `updateGrievanceStatus` | PATCH /api/admin/grievances/:id/status — Updates grievance status (pending/in-progress/resolved). |

### grievanceController.js — `server/controllers/grievanceController.js`
| Function | Description |
|----------|-------------|
| `createGrievance` | POST /api/grievances — Submit a grievance with subject (5-200 chars) and message (20-2000 chars). Sanitizes with stripHtml. Optional category. |

---

## 5. New Routes

### savedRoutes.js — `server/routes/savedRoutes.js`
- `GET /api/saved` — getSavedProperties (protect)
- `GET /api/saved/check-batch` — checkSavedBatch (protect)
- `GET /api/saved/check/:propertyId` — checkSaved (protect)
- `POST /api/saved/:propertyId` — saveProperty (protect)
- `DELETE /api/saved/:propertyId` — unsaveProperty (protect)

### recentlyViewedRoutes.js — `server/routes/recentlyViewedRoutes.js`
- `POST /api/recently-viewed/:propertyId` — recordView (protect)
- `GET /api/recently-viewed` — getRecentlyViewed (protect)

### dashboardRoutes.js — `server/routes/dashboardRoutes.js`
- `GET /api/dashboard/vendor` — getVendorStats (protect)
- `GET /api/dashboard/buyer` — getBuyerContacted (protect)

### adminRoutes.js — `server/routes/adminRoutes.js`
- All routes use `router.use(protect, requireAdmin)` at the top
- `GET /api/admin/stats` — getAdminStats
- `GET /api/admin/users` — getUsers
- `PATCH /api/admin/users/:id/block` — blockUser
- `GET /api/admin/properties` — getAdminProperties
- `PATCH /api/admin/properties/:id/status` — updatePropertyStatus
- `DELETE /api/admin/properties/:id` — deleteAdminProperty
- `GET /api/admin/grievances` — getGrievances
- `PATCH /api/admin/grievances/:id/status` — updateGrievanceStatus

### grievanceRoutes.js — `server/routes/grievanceRoutes.js`
- `POST /api/grievances` — createGrievance (protect)

---

## 6. Existing File Modifications

### leadController.js — Added `getBuyerLeads`
- `GET /api/leads/buyer` — Paginated list of leads where `userId = req.user._id`. Populates property data. Filters deleted properties.

### leadRoutes.js — Added buyer route
- `router.get("/buyer", protect, getBuyerLeads)` added after existing vendor route

### server.js — Registered all new routes
- Added imports for savedRoutes, recentlyViewedRoutes, dashboardRoutes, adminRoutes, grievanceRoutes
- Mounted at /api/saved, /api/recently-viewed, /api/dashboard, /api/admin, /api/grievances

---

## 7. Code Patterns Followed

- All async handlers use try-catch with console.error in catch blocks
- Response format: `{ success: true, data: {} }` or `{ success: false, error: "message" }`
- `.lean()` used on all read queries
- `.select()` used to limit returned fields where appropriate
- All inputs validated (ObjectId validation, type checks, enum validation, string length)
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- String inputs sanitized with `stripHtml` from existing utils
- Passwords never returned (`.select("-password")`)
- Pagination with safePage/safeLimit pattern (max 50 per page)
- `escapeRegex` used on search inputs to prevent ReDoS
- Race conditions handled (duplicate key errors caught gracefully)

---

## 8. API Endpoint Summary (for Frontend Developer)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/saved/:propertyId | protect | Toggle save/unsave |
| DELETE | /api/saved/:propertyId | protect | Explicit unsave |
| GET | /api/saved | protect | Get saved properties (paginated) |
| GET | /api/saved/check/:propertyId | protect | Check if property is saved |
| GET | /api/saved/check-batch?ids= | protect | Batch check saved status |
| POST | /api/recently-viewed/:propertyId | protect | Record a view |
| GET | /api/recently-viewed?limit= | protect | Get recently viewed |
| GET | /api/dashboard/vendor | protect | Vendor stats |
| GET | /api/dashboard/buyer | protect | Buyer contacted properties |
| GET | /api/leads/buyer | protect | Buyer's unlocked properties |
| POST | /api/grievances | protect | Submit a grievance |
| GET | /api/admin/stats | protect+admin | Site-wide analytics |
| GET | /api/admin/users | protect+admin | List users (search, paginated) |
| PATCH | /api/admin/users/:id/block | protect+admin | Toggle block/unblock |
| GET | /api/admin/properties | protect+admin | List properties (filter, paginated) |
| PATCH | /api/admin/properties/:id/status | protect+admin | Update property status |
| DELETE | /api/admin/properties/:id | protect+admin | Hard delete property |
| GET | /api/admin/grievances | protect+admin | List grievances (filter, paginated) |
| PATCH | /api/admin/grievances/:id/status | protect+admin | Update grievance status |