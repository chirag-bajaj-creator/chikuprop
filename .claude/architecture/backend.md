# Backend Architecture — Express + Node.js

## 6 Backend Systems

### System 1 — Auth (`/api/auth`)
- POST `/register` — create user with role, hash password with bcrypt, return JWT
- POST `/login` — validate credentials, return JWT token
- GET `/me` — get logged-in user profile (requires auth)
- Middleware:
  - `authMiddleware.js` — verify JWT from Authorization header
  - `roleMiddleware.js` — check user role (vendor/purchaser/tenant)

### System 2 — Property (`/api/properties`)
- POST `/` — create property (Vendor only, Cloudinary image upload)
- GET `/` — list properties (search, filter by city/type/price/bedrooms, sort, pagination)
- GET `/:id` — property detail (increment viewCount, add to recently viewed if logged in)
- PUT `/:id` — update property (only Vendor who owns it)
- DELETE `/:id` — soft delete / change status to expired (Vendor only)
- GET `/my-listings` — Vendor's own properties

### System 3 — Lead (`/api/leads`)
- POST `/unlock/:propertyId` — unlock contact details (logged-in only)
  - Creates lead record
  - Increments Property.contactUnlockCount
  - Returns full contact info
- GET `/vendor` — Vendor sees all leads for their properties
- GET `/user` — Purchaser/Tenant sees their contacted properties

### System 4 — User Activity (`/api/activity`)
- POST `/save/:propertyId` — save/unsave a property (toggle)
- GET `/saved` — get user's saved properties
- GET `/recent` — get recently viewed properties
- GET `/contacted` — get contacted properties (via leads)

### System 5 — Vendor Management (`/api/vendor`)
- GET `/dashboard` — stats (total listings, total views, total leads, total unlocks)
- GET `/listings` — all vendor listings with status
- PUT `/listings/:id/status` — pause/activate/expire a listing

### System 6 — Marketplace (`/api/marketplace`)
- POST `/wanted` — post a wanted property requirement
- GET `/wanted` — list all wanted properties
- GET `/services` — list services (shifting, loans, legal, interior)

## Folder Structure
```
server/
├── config/
│   ├── db.js              (MongoDB connection)
│   └── cloudinary.js      (Cloudinary config)
├── controllers/
│   ├── authController.js
│   ├── propertyController.js
│   ├── leadController.js
│   ├── activityController.js
│   ├── vendorController.js
│   └── marketplaceController.js
├── middleware/
│   ├── authMiddleware.js   (JWT verification)
│   ├── roleMiddleware.js   (role-based access)
│   └── errorHandler.js     (global error handler)
├── models/
│   ├── User.js
│   ├── Property.js
│   ├── Lead.js
│   ├── SavedProperty.js
│   ├── RecentlyViewed.js
│   └── WantedProperty.js
├── routes/
│   ├── authRoutes.js
│   ├── propertyRoutes.js
│   ├── leadRoutes.js
│   ├── activityRoutes.js
│   ├── vendorRoutes.js
│   └── marketplaceRoutes.js
├── utils/
│   ├── maskContact.js      (mask phone/email for unauthenticated users)
│   └── validators.js       (input validation helpers)
└── server.js               (Express app setup, CORS, route mounting)
```

## Key Rules
- Every async handler uses try-catch
- Validate input before MongoDB operations
- Hash passwords with bcrypt (never store plain text)
- Check auth on all protected routes
- Send proper HTTP status codes (201, 200, 400, 401, 404, 500)
- Use Mongoose models only — no raw MongoDB queries
