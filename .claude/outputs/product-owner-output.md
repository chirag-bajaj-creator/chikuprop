# Phase 5 — Product Owner Output: Dashboards & Admin Panel

## 1. Delivery Scope Summary

Phase 5 delivers **two separate dashboard systems** for ChikuProp:

**A. User Dashboards** — Vendor and Buyer/Tenant dashboards integrated into the existing consumer website (same Navbar, Footer, pink-purple theme). Includes save/unsave property functionality.

**B. Admin Dashboard** — A completely separate admin panel with its own login, layout (sidebar navigation), and professional visual identity. Connected to the same MongoDB database via shared and new APIs.

### What Phase 5 Does NOT Include
- Payment/billing logic
- Email notifications
- Role changes (users remain "user" or "admin" in the User model)
- Grievance submission form (the current GrievancesPage is a static contact page — Phase 5 admin can track grievances only if a Grievance model is built; see Risks section)

---

## 2. Prioritized Features

### HIGH Priority (Must ship)
| # | Feature | System |
|---|---------|--------|
| H1 | SavedProperty model + Save/Unsave API | Backend |
| H2 | Save/Unsave heart toggle on PropertyCard | Frontend (Consumer) |
| H3 | Vendor Dashboard page | Frontend (Consumer) |
| H4 | Vendor Leads page | Frontend (Consumer) |
| H5 | Buyer/Tenant Dashboard page | Frontend (Consumer) |
| H6 | Admin auth middleware (requireAdmin) | Backend |
| H7 | Admin Login page (/admin/login) | Frontend (Admin) |
| H8 | Admin Layout (sidebar + content area) | Frontend (Admin) |
| H9 | Admin Dashboard — site analytics | Frontend (Admin) + API |
| H10 | Admin User Management — list, search, block/unblock | Frontend (Admin) + API |
| H11 | Admin Property Moderation — approve/reject/flag/remove | Frontend (Admin) + API |

### MEDIUM Priority (Should ship)
| # | Feature | System |
|---|---------|--------|
| M1 | RecentlyViewed model + tracking API | Backend |
| M2 | Recently Viewed section on Buyer Dashboard | Frontend (Consumer) |
| M3 | Contacted Properties section on Buyer Dashboard | Frontend (Consumer) |
| M4 | Admin Grievance Tracking page | Frontend (Admin) + API |

### LATER (Nice-to-have, can slip to Phase 6)
| # | Feature | System |
|---|---------|--------|
| L1 | Export leads as CSV (Vendor) | Backend + Frontend |
| L2 | Admin bulk actions (block multiple users, reject multiple properties) | Frontend (Admin) |

---

## 3. Feature Requirements & Goals

### H1 — SavedProperty Model + Save/Unsave API
**Goal:** Let logged-in users bookmark properties for quick access later.

- New Mongoose model: `SavedProperty` with fields: userId (ObjectId ref User), propertyId (ObjectId ref Property), timestamps
- Compound unique index on `{ userId: 1, propertyId: 1 }` to prevent duplicates
- API endpoints:
  - `POST /api/saved/:propertyId` — save a property (toggle: if already saved, unsave it; otherwise save it)
  - `GET /api/saved` — get all saved properties for the logged-in user (populate propertyId with title, price, location, images, listingType, propertyType, status)
  - `GET /api/saved/check/:propertyId` — check if a property is saved by the current user (returns `{ saved: true/false }`)
- All routes require `protect` middleware

### H2 — Save/Unsave Heart Toggle on PropertyCard
**Goal:** Users can save/unsave properties directly from browse pages.

- Add a heart icon (top-right of image area) to PropertyCard component
- If user is not logged in: clicking the heart redirects to login with redirect back
- If user is logged in: toggle save/unsave via API, update heart state (filled = saved, outline = not saved)
- On initial render of property lists (BuyPage, RentPage), batch-check saved status for all visible properties (or check individually)
- Heart icon must NOT interfere with the Link wrapping the card (use `e.stopPropagation()` and `e.preventDefault()`)

### H3 — Vendor Dashboard Page
**Goal:** Give vendors a quick overview of their listing performance.

- Route: `/vendor/dashboard` (protected, requires logged-in user)
- Stats cards showing:
  - Total Listings (count of vendor's properties)
  - Total Views (sum of viewCount across vendor's properties)
  - Total Leads (count of leads where vendorId matches)
  - Total Contact Unlocks (sum of contactUnlockCount across vendor's properties)
- Quick-action links: "My Listings" (/my-listings), "View Leads" (/vendor/leads), "Add Property" (/add-property)
- API endpoint: `GET /api/dashboard/vendor` — returns aggregated stats for the logged-in vendor
- Uses existing Property and Lead models, no new models needed

### H4 — Vendor Leads Page
**Goal:** Let vendors see who unlocked their contact info, for which property, and when.

- Route: `/vendor/leads` (protected)
- Uses existing `GET /api/leads/vendor` API (already built, paginated, populates userId and propertyId)
- Display as a responsive table (desktop) / card list (mobile):
  - Buyer name, email (from populated userId)
  - Property title (from populated propertyId)
  - Date/time of unlock (from createdAt)
- Pagination controls (existing API supports page/limit params)
- Empty state: "No leads yet. Share your listings to get more visibility."

### H5 — Buyer/Tenant Dashboard Page
**Goal:** Give buyers a personal hub showing their property interactions.

- Route: `/dashboard` (protected)
- Three sections:
  1. **Saved Properties** — fetched from `GET /api/saved`, rendered as PropertyCard grid, with unsave option
  2. **Recently Viewed** — fetched from `GET /api/recently-viewed`, rendered as PropertyCard grid (requires M1)
  3. **Contacted Properties** — properties where the user has unlocked contact (fetched from new `GET /api/leads/my` endpoint)
- Each section: show up to 4 items with "View All" link if more exist
- API endpoint needed: `GET /api/leads/my` — returns properties where the current user has unlocked contact (populate propertyId)

### H6 — Admin Auth Middleware
**Goal:** Protect all admin API routes so only users with role "admin" can access them.

- New middleware: `requireAdmin` — checks `req.user.role === "admin"`, returns 403 if not
- Used after `protect` middleware on all admin routes: `router.use(protect, requireAdmin)`
- The existing User model already has `role: enum ["user", "admin"]` — no schema change needed

### H7 — Admin Login Page
**Goal:** Separate login experience for admins, visually distinct from consumer login.

- Route: `/admin/login`
- Separate page component, NOT using the consumer Navbar/Footer
- Clean, professional design — dark or neutral color scheme, NOT pink-purple
- Same auth flow as consumer login (calls same `POST /api/auth/login` endpoint) but after login, checks if `user.role === "admin"`. If not admin, shows error "Access denied — admin only"
- On successful admin login, redirects to `/admin/dashboard`
- Stores the same JWT token (same TOKEN_KEY) — the admin panel reads from the same AuthContext

### H8 — Admin Layout
**Goal:** Provide the structural shell for all admin pages.

- New layout component: `AdminLayout` with sidebar + content area
- Sidebar navigation items:
  - Dashboard (/admin/dashboard)
  - Users (/admin/users)
  - Properties (/admin/properties)
  - Grievances (/admin/grievances)
  - Logout action
- Top bar: shows admin name, avatar
- Responsive: sidebar collapses to hamburger on mobile
- All `/admin/*` routes (except /admin/login) wrapped in `AdminLayout` and `AdminProtectedRoute` (checks role === "admin")
- AdminLayout must NOT render consumer Navbar or Footer

### H9 — Admin Dashboard (Site Analytics)
**Goal:** Give admins a bird's-eye view of platform health.

- Route: `/admin/dashboard`
- Stats cards:
  - Total Users (count)
  - Total Listings (count)
  - Total Active Listings vs Paused/Expired
  - Total Views (sum of all viewCount)
  - Total Leads (count)
- API endpoint: `GET /api/admin/stats` — returns all aggregated counts
- Protected by `protect` + `requireAdmin`

### H10 — Admin User Management
**Goal:** Let admins view, search, and block/unblock users.

- Route: `/admin/users`
- Table displaying: name, email, phone, role, createdAt, status (active/blocked)
- Search bar: search by name or email (server-side)
- Block/Unblock toggle button per user row
- Requires adding `isBlocked` field to User model (Boolean, default false). **This is a schema change — see Sensitive Areas note.**
- API endpoints:
  - `GET /api/admin/users?search=&page=&limit=` — paginated user list with search
  - `PATCH /api/admin/users/:id/block` — toggle block/unblock
- When a user is blocked, the `protect` middleware should reject their token with 403 "Account blocked"
- Protected by `protect` + `requireAdmin`

### H11 — Admin Property Moderation
**Goal:** Let admins review, approve, reject, flag, or remove property listings.

- Route: `/admin/properties`
- Table displaying: title, vendor name, city, listingType, status, planType, createdAt, actions
- Filter by status (active/paused/expired/flagged)
- Actions per property: Approve (set active), Reject (set rejected), Flag (set flagged), Remove (delete)
- Requires adding "flagged" and "rejected" to Property status enum: `["active", "paused", "expired", "flagged", "rejected"]`. **Schema change — see Sensitive Areas note.**
- API endpoints:
  - `GET /api/admin/properties?status=&page=&limit=` — paginated property list
  - `PATCH /api/admin/properties/:id/status` — update property status (body: { status })
  - `DELETE /api/admin/properties/:id` — hard delete a property
- Protected by `protect` + `requireAdmin`

### M1 — RecentlyViewed Model + Tracking API
**Goal:** Track which properties each user has viewed for personalized experience.

- New Mongoose model: `RecentlyViewed` with fields: userId (ObjectId ref User), propertyId (ObjectId ref Property), viewedAt (Date, default now)
- Compound unique index on `{ userId: 1, propertyId: 1 }` — on re-view, update viewedAt (upsert)
- API endpoints:
  - `POST /api/recently-viewed/:propertyId` — record a view (upsert)
  - `GET /api/recently-viewed` — get recent 20 properties for logged-in user, sorted by viewedAt desc
- The POST endpoint should be called from PropertyDetail page on mount (only if user is logged in)
- Protected by `protect` middleware

### M2 — Recently Viewed Section on Buyer Dashboard
**Goal:** Show buyers their browsing history.

- Section on `/dashboard` page showing recently viewed properties
- Fetches from `GET /api/recently-viewed`
- Shows up to 4 PropertyCards, "View All" links to a full page if needed later

### M3 — Contacted Properties Section on Buyer Dashboard
**Goal:** Let buyers quickly re-access properties where they unlocked contact info.

- Section on `/dashboard` page
- Fetches from `GET /api/leads/my` (new endpoint)
- Shows up to 4 PropertyCards with contact info visible

### M4 — Admin Grievance Tracking
**Goal:** Let admins view and manage user grievances.

- Route: `/admin/grievances`
- **DEPENDENCY:** Requires a Grievance model to exist. Currently, the GrievancesPage is a static contact page with no backend. A Grievance model must be created first (see Risks section).
- If Grievance model is built: table showing subject, user, status (pending/in-progress/resolved), createdAt, actions
- Status update dropdown per grievance
- API endpoints:
  - `GET /api/admin/grievances?status=&page=&limit=`
  - `PATCH /api/admin/grievances/:id/status` — update status

---

## 4. User Stories

### Vendor Stories
- **VS-1:** As a vendor, I want to see a dashboard with my listing stats so I know how my properties are performing.
- **VS-2:** As a vendor, I want to see which buyers unlocked my contact info, for which property, and when, so I can follow up.
- **VS-3:** As a vendor, I want quick-action links on my dashboard to add a property or view my listings.

### Buyer/Tenant Stories
- **BS-1:** As a buyer, I want to save properties I like so I can come back to them later.
- **BS-2:** As a buyer, I want to unsave a property I no longer want.
- **BS-3:** As a buyer, I want to see all my saved properties on my dashboard.
- **BS-4:** As a buyer, I want to see recently viewed properties so I can revisit ones I browsed earlier.
- **BS-5:** As a buyer, I want to see properties where I unlocked contact info so I can follow up with vendors.
- **BS-6:** As a buyer, I want to save a property with one click from the property card without leaving the browse page.

### Admin Stories
- **AS-1:** As an admin, I want a separate login page so the admin experience is distinct from the consumer site.
- **AS-2:** As an admin, I want a dashboard showing total users, listings, views, and leads so I understand platform health.
- **AS-3:** As an admin, I want to search and view all users so I can manage the user base.
- **AS-4:** As an admin, I want to block/unblock users to handle bad actors.
- **AS-5:** As an admin, I want to approve, reject, flag, or remove property listings to maintain content quality.
- **AS-6:** As an admin, I want to filter properties by status so I can focus on flagged or pending ones.
- **AS-7:** As an admin, I want to view and update the status of grievances so users feel heard.

---

## 5. Acceptance Criteria

### H1 — SavedProperty API
- [ ] `POST /api/saved/:propertyId` with valid token saves the property; calling again unsaves it
- [ ] `GET /api/saved` returns only the logged-in user's saved properties with populated property data
- [ ] `GET /api/saved/check/:propertyId` returns `{ saved: true }` if saved, `{ saved: false }` if not
- [ ] Saving the same property twice does not create a duplicate (compound unique index)
- [ ] All endpoints return 401 without a valid token

### H2 — Heart Toggle on PropertyCard
- [ ] Heart icon visible on every PropertyCard in BuyPage, RentPage, and dashboard sections
- [ ] Clicking heart when not logged in redirects to /login with redirect back
- [ ] Clicking heart when logged in toggles saved state (filled/outline) without page reload
- [ ] Heart click does NOT navigate to the property detail page (event propagation stopped)
- [ ] Saved state persists across page refreshes

### H3 — Vendor Dashboard
- [ ] Page loads at /vendor/dashboard for logged-in users
- [ ] Shows 4 stat cards: total listings, total views, total leads, total unlocks
- [ ] Stats match actual database counts for the vendor
- [ ] Quick-action links navigate to correct pages
- [ ] Shows loading state while fetching, error state on failure

### H4 — Vendor Leads Page
- [ ] Page loads at /vendor/leads for logged-in users
- [ ] Shows table/cards with buyer name, property title, and unlock date
- [ ] Pagination works (next/prev page)
- [ ] Empty state shown when vendor has no leads
- [ ] Responsive: table on desktop, cards on mobile

### H5 — Buyer/Tenant Dashboard
- [ ] Page loads at /dashboard for logged-in users
- [ ] Saved Properties section shows saved properties (or empty state)
- [ ] Recently Viewed section shows recent properties (or empty state, or "Coming soon" if M1 not done)
- [ ] Contacted Properties section shows unlocked properties (or empty state)
- [ ] Each section limited to 4 items with "View All" if more

### H6 — Admin Auth Middleware
- [ ] Requests to /api/admin/* without token return 401
- [ ] Requests to /api/admin/* with non-admin token return 403
- [ ] Requests to /api/admin/* with admin token succeed (200)

### H7 — Admin Login
- [ ] /admin/login page renders without consumer Navbar/Footer
- [ ] Submitting valid admin credentials redirects to /admin/dashboard
- [ ] Submitting valid non-admin credentials shows "Access denied — admin only"
- [ ] Submitting invalid credentials shows appropriate error

### H8 — Admin Layout
- [ ] All /admin/* pages (except /admin/login) render with sidebar + content layout
- [ ] Sidebar shows Dashboard, Users, Properties, Grievances, Logout
- [ ] Active sidebar item is visually highlighted
- [ ] Consumer Navbar and Footer are NOT visible on any admin page
- [ ] Sidebar collapses on mobile with hamburger toggle

### H9 — Admin Dashboard
- [ ] Shows stat cards: total users, total listings, active vs paused/expired, total views, total leads
- [ ] Numbers match actual database counts
- [ ] Loading and error states handled

### H10 — Admin User Management
- [ ] Table shows all users with name, email, phone, role, date joined, blocked status
- [ ] Search filters users by name or email (server-side)
- [ ] Block button toggles user's isBlocked field
- [ ] Blocked user cannot make authenticated API calls (protect middleware rejects)
- [ ] Pagination works

### H11 — Admin Property Moderation
- [ ] Table shows all properties with key fields
- [ ] Filter by status works
- [ ] Approve sets status to "active", Reject to "rejected", Flag to "flagged"
- [ ] Remove permanently deletes the property
- [ ] Confirmation modal before Remove action
- [ ] Pagination works

### M4 — Admin Grievance Tracking
- [ ] Only renders if Grievance model exists
- [ ] Shows grievances with status filter
- [ ] Status can be updated from pending -> in-progress -> resolved

---

## 6. Dependencies on Existing Code

### Models (Existing — no changes unless noted)
| Model | Used By | Changes Needed |
|-------|---------|----------------|
| User | H6, H7, H9, H10 | ADD `isBlocked: { type: Boolean, default: false }` for H10 |
| Property | H3, H9, H11 | ADD "flagged" and "rejected" to status enum for H11 |
| Lead | H3, H4, H5 | No changes |

### Models (New)
| Model | Used By |
|-------|---------|
| SavedProperty | H1, H2, H5 |
| RecentlyViewed | M1, M2 |
| Grievance (if built) | M4 |

### Existing APIs Used
| API | Used By |
|-----|---------|
| `GET /api/leads/vendor` | H4 (Vendor Leads page) — already built |
| `POST /api/auth/login` | H7 (Admin Login) — same endpoint, role check on frontend |
| `GET /api/auth/me` | H7, H8 (verify admin role on frontend) |
| `protect` middleware | H6 (base for requireAdmin) |

### Existing Frontend Code Used
| Component/Service | Used By |
|-------------------|---------|
| AuthContext (useAuth) | H2, H3, H4, H5, H7, H8 |
| ProtectedRoute (roles prop) | H3, H4, H5 |
| PropertyCard | H2 (add heart icon), H5 (render saved/recent/contacted) |
| leadService.js (getVendorLeads) | H4 |
| Loader, ErrorState | All pages |
| ToastContext | H2 (save/unsave feedback), H10, H11 |

### Routing (App.jsx)
- Consumer routes to add: `/dashboard`, `/vendor/dashboard`, `/vendor/leads`
- Admin routes: Must be added as a separate route tree — `/admin/*` routes should NOT render inside the consumer `<Navbar>` / `<Footer>` wrapper. This requires restructuring App.jsx to conditionally render layout based on path prefix.

---

## 7. Delivery Sequence

Build in this order to minimize blockers:

### Sprint 1 — Backend Foundation
1. **H6** — requireAdmin middleware
2. **H1** — SavedProperty model + API routes
3. **M1** — RecentlyViewed model + API routes
4. **H3 (API only)** — `GET /api/dashboard/vendor` stats endpoint
5. **H5 (API only)** — `GET /api/leads/my` endpoint for buyer's contacted properties
6. **H9 (API only)** — `GET /api/admin/stats` endpoint
7. **H10 (API only)** — Admin user management APIs + User model `isBlocked` field + protect middleware update
8. **H11 (API only)** — Admin property moderation APIs + Property model status enum update

### Sprint 2 — Consumer Frontend
9. **H2** — Heart toggle on PropertyCard (depends on H1)
10. **H3** — Vendor Dashboard page (depends on H3 API)
11. **H4** — Vendor Leads page (uses existing API)
12. **H5** — Buyer/Tenant Dashboard page (depends on H1, M1, H5 API)
13. Add new consumer routes to App.jsx

### Sprint 3 — Admin Frontend
14. **H7** — Admin Login page
15. **H8** — Admin Layout (sidebar + content shell)
16. **H9** — Admin Dashboard page (depends on H9 API)
17. **H10** — Admin User Management page (depends on H10 API)
18. **H11** — Admin Property Moderation page (depends on H11 API)
19. **M4** — Admin Grievance Tracking (if Grievance model exists)
20. Restructure App.jsx for admin route tree (no Navbar/Footer on /admin/*)

---

## 8. Risks & Gaps

### RISK 1 — Grievance Model Does Not Exist (HIGH)
**Impact:** M4 (Admin Grievance Tracking) cannot be built without a backend Grievance model. The current GrievancesPage is purely a static UI with phone numbers and WhatsApp links — no data is stored in MongoDB.
**Mitigation:** Either (a) build a Grievance model + submission API as part of Phase 5, or (b) defer M4 to a later phase. Recommendation: build a minimal Grievance model (userId, subject, message, status, timestamps) and a `POST /api/grievances` endpoint now, then build admin tracking on top of it.

### RISK 2 — User Model Schema Change (MEDIUM)
**Impact:** Adding `isBlocked` to User model affects every authenticated request (protect middleware must check it). Existing users in production will not have this field — must default to `false`.
**Mitigation:** Use `default: false` in schema. Test protect middleware thoroughly. No migration needed — Mongoose handles missing fields with defaults.

### RISK 3 — Property Status Enum Expansion (MEDIUM)
**Impact:** Adding "flagged" and "rejected" to Property status enum. Existing queries filtering by status must still work. Public property listings should exclude flagged/rejected properties.
**Mitigation:** Update `getProperties` controller to filter `status: "active"` only (verify this is already the case). Add "flagged" and "rejected" to enum. Existing properties are unaffected.

### RISK 4 — App.jsx Layout Split (LOW-MEDIUM)
**Impact:** Admin pages must NOT render consumer Navbar/Footer. Currently, App.jsx renders Navbar and Footer around ALL routes. This requires restructuring to conditionally render layout.
**Mitigation:** Use a layout route pattern — wrap consumer routes in a `ConsumerLayout` (Navbar + Footer) and admin routes in `AdminLayout` (sidebar). This is a structural change to App.jsx.

### RISK 5 — Admin User Creation (LOW)
**Impact:** There is no "create admin" flow. The User model supports role "admin" but there is no registration path for admins.
**Mitigation:** For Phase 5, seed one admin user directly in MongoDB (or via a one-time script). Admin user management does not include creating new admins — only managing existing users.

### GAP — No "vendor" Role Distinction
The User model has roles "user" and "admin" only. There is no "vendor" role. Currently, any logged-in user can post a property (becoming a de facto vendor). The Vendor Dashboard will identify vendors as users who have at least one property (vendorId match). This is acceptable for Phase 5 — a formal vendor role can be added later if needed.

---

## 9. Notes for UX Designer

### Consumer Dashboards (Vendor + Buyer)
- These pages must use the **existing pink-purple ChikuProp theme** — same Navbar, Footer, typography, and color palette as BuyPage/RentPage.
- **Vendor Dashboard:** Think of it as a simple stats overview — 4 stat cards in a row (responsive: 2x2 on mobile), then quick-action buttons below. No complex charts needed. Keep it clean.
- **Vendor Leads Page:** Desktop = table with columns (buyer name, property title, date). Mobile = stacked cards. Use same card styling conventions as ListingCard.
- **Buyer Dashboard:** Three horizontal sections, each with a heading + "View All" link + row of up to 4 PropertyCards. Similar layout to the Landing page's property sections.
- **Heart Icon on PropertyCard:** Position top-right of the image area (like Airbnb/Zillow). Outline by default, filled red when saved. Must be clickable without triggering the card's Link navigation. Consider a subtle scale animation on click.

### Admin Panel (Completely Separate)
- **Visual identity:** Professional, clean, management-style. Suggested palette: dark sidebar (charcoal/navy), light content area (white/light gray), accent color for actions (blue or teal — NOT pink/purple).
- **Admin Login:** Centered card on a clean background. Show ChikuProp logo + "Admin Panel" subtitle. Minimal, no consumer marketing elements.
- **Admin Layout:** Fixed sidebar (240px width) on left, scrollable content area on right. Sidebar items: icon + label. Collapse to icon-only or hamburger on mobile/tablet.
- **Admin Dashboard:** Stat cards at top (similar to vendor dashboard but with more metrics). Could add a simple bar chart or line chart later — not required for Phase 5.
- **Tables (Users, Properties, Grievances):** Clean data tables with:
  - Search bar above
  - Filter dropdowns
  - Sortable columns (nice-to-have)
  - Pagination at bottom
  - Action buttons in last column (small, icon-based)
  - Row hover highlight
- **Block/Unblock:** Red "Block" button, green "Unblock" button. Show confirmation modal before blocking.
- **Property Moderation:** Status shown as colored badges (green=active, yellow=paused, red=rejected, orange=flagged). Action dropdown per row.
- **Responsive behavior:** Admin panel is primarily a desktop tool. Mobile support should be functional (sidebar collapses) but pixel-perfect mobile design is lower priority than consumer pages.
- **IMPORTANT:** The admin panel must feel like a completely different product from the consumer site. Different fonts are welcome (e.g., Inter or system font stack for admin vs. the consumer's branded font). Do NOT reuse consumer component styling.
