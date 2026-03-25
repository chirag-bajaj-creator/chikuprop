# Build Order — 6 Phases

## Phase 1 — Core Public Flow
- Project setup (Express + React + MongoDB connection)
- Property model + seed data for testing
- Landing page + PropertyCard component
- Purchaser listing page with filters (city, type, price, bedrooms)
- Tenant listing page (same layout, filtered for rent)
- Property detail page (without contact unlock yet)
- SearchBar, Loader, ErrorState, ViewToggle components

## Phase 2 — Auth
- User model
- POST /register + POST /login APIs with JWT
- Auth middleware (verify JWT)
- Role middleware (check purchaser/tenant/vendor)
- Login page + Register page (with role selection)
- AuthContext in React
- ProtectedRoute component

## Phase 3 — Vendor Flow
- Vendor info page (why list, free vs paid)
- Post Property page + POST /api/properties API
- Cloudinary image/video upload integration
- My Listings page + GET /api/properties/my-listings
- Edit listing functionality

## Phase 4 — Lead Flow (Core Business Logic)
- maskContact utility (phone: 98XXXXXX45, email: ab****@gmail.com)
- Property detail page: show masked contact before login
- Contact unlock API: POST /api/leads/unlock/:propertyId
  - Creates Lead record
  - Increments contactUnlockCount
  - Returns full contact
- After login: show full contact + call/WhatsApp buttons
- Lead model

## Phase 5 — Dashboards
- Vendor dashboard (stats: listings, views, leads, unlocks)
- Vendor leads page (who unlocked, which property, when)
- Purchaser dashboard (saved, recently viewed, contacted)
- Tenant dashboard (saved rentals, recently viewed, contacted)
- SavedProperty + RecentlyViewed models and APIs
- Save/unsave toggle on PropertyCard

## Phase 6 — Extra
- Wanted Properties page + API
- Services page
- Profile page (update name, phone, email, password, picture)
- Notifications page
- Polish UI, responsive design, final testing
- Deployment to Vercel + Render

## After Each Phase — Verify
1. Test all new API routes (Postman or browser)
2. Check frontend pages load with loading/error states
3. Verify auth — unauthenticated users can't access protected routes
4. After Phase 4: full flow test — post property → search → open → login → unlock → lead created → vendor sees lead
