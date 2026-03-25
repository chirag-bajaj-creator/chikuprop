# Phase 5 — Dashboards

## What was built

### Routes added to App.jsx
- `/dashboard` — BuyerDashboardPage (any logged-in user)
- `/vendor/dashboard` — VendorDashboardPage (vendor role only)
- `/vendor/leads` — VendorLeadsPage (vendor role only)

### Navbar updates
- Dropdown now shows "Dashboard" link (routes to vendor or buyer dashboard based on role)
- Vendors see "My Listings" and "My Leads" links in dropdown

### Save/unsave toggle on Buy & Rent pages
- PropertyCard already had heart button — wired `isSaved` + `onToggleSave` props from BuyPage/RentPage
- Batch-checks saved status via `checkSavedBatch` after properties load
- Toggle calls `saveProperty`/`unsaveProperty` with toast feedback
- Non-logged-in users clicking heart are redirected to login

### Recently Viewed tracking
- PropertyDetail now calls `recordView(id)` on mount for logged-in users
- Feeds into BuyerDashboardPage "Recently Viewed" section

## Pages & Components (pre-existing, now connected)

| Component | File | Purpose |
|-----------|------|---------|
| VendorDashboardPage | pages/VendorDashboardPage.jsx | Stats: listings, views, leads, unlocks |
| VendorLeadsPage | pages/VendorLeadsPage.jsx | Table of buyers who unlocked contact |
| BuyerDashboardPage | pages/BuyerDashboardPage.jsx | Saved, recently viewed, contacted |
| StatCard | components/dashboard/StatCard.jsx | Stat display card |
| DashboardSection | components/dashboard/DashboardSection.jsx | Section with property grid + empty state |

## Backend APIs (pre-existing, verified)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/dashboard/vendor | Required | Vendor stats (listings, views, leads, unlocks) |
| GET | /api/dashboard/buyer | Required | Buyer's contacted properties |
| GET | /api/saved | Required | Get saved properties |
| GET | /api/saved/check-batch | Required | Batch check saved status |
| POST | /api/saved/:propertyId | Required | Save a property |
| DELETE | /api/saved/:propertyId | Required | Unsave a property |
| GET | /api/recently-viewed | Required | Get recently viewed |
| POST | /api/recently-viewed/:propertyId | Required | Record a view |
| GET | /api/leads/buyer | Required | Get buyer's leads |

## Models (pre-existing, verified)
- SavedProperty — userId + propertyId (unique compound index)
- RecentlyViewed — userId + propertyId (upsert on view)

## Files modified in this phase
- `client/src/App.jsx` — Added imports + routes for dashboards
- `client/src/components/common/Navbar.jsx` — Dashboard/leads links in dropdown
- `client/src/pages/BuyPage.jsx` — Save toggle wiring + batch check
- `client/src/pages/RentPage.jsx` — Save toggle wiring + batch check
- `client/src/pages/PropertyDetail.jsx` — Recently viewed tracking

## Key decisions
- Vendor dashboard is role-protected (`roles={["vendor"]}`) — buyers can't access
- Buyer dashboard at `/dashboard` is accessible to all logged-in users (buyers and tenants both see saved/recent/contacted)
- Save toggle uses optimistic UI with error rollback via toast
- Recently viewed fires on mount and silently ignores errors (non-critical tracking)
