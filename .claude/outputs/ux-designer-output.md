# Phase 5 — UX Designer Output: Dashboards & Admin Panel

---

## 1. UX Goal Summary

Phase 5 introduces **two distinct UX systems** that serve fundamentally different user needs:

**System A — Consumer Dashboards:** Extend the existing ChikuProp pink-purple consumer experience with personal dashboards for vendors and buyers/tenants. These pages must feel like a natural continuation of BuyPage, RentPage, and MyListingsPage — same Navbar, Footer, typography, colors, and interaction patterns. The goal is to make users feel "at home" while giving them actionable data about their property interactions.

**System B — Admin Panel:** A completely separate management application that shares the same database but presents a professional, tool-like interface. The admin panel must feel like a different product — no pink-purple gradients, no consumer Navbar/Footer, no marketing language. The goal is efficient data management with minimal clicks to find, review, and act on users, properties, and grievances.

**Core UX Principles for Phase 5:**
- Clarity over decoration — dashboards show data, not marketing
- One-glance comprehension — stat cards and tables must communicate at a glance
- Minimal friction — save a property in one click, block a user in two clicks
- Responsive but role-appropriate — consumer dashboards must work perfectly on mobile; admin panel prioritizes desktop but remains functional on mobile

---

## 2. Primary User Journeys

### 2A. Vendor Journey

**Journey 1 — Check Performance (daily habit)**
1. Vendor logs in (existing flow)
2. Navbar dropdown now shows "Dashboard" link (new)
3. Vendor sees `/vendor/dashboard` with 4 stat cards (listings, views, leads, unlocks)
4. Vendor scans numbers — is anything growing? Any new leads?
5. If leads look interesting, clicks "View Leads" quick-action to go to `/vendor/leads`

**Journey 2 — Review Leads (follow-up intent)**
1. From Vendor Dashboard or Navbar dropdown, vendor navigates to `/vendor/leads`
2. Sees table (desktop) or card stack (mobile) of lead entries
3. Each entry shows: buyer name, buyer email, property title, date of unlock
4. Vendor identifies a new lead and uses the email/phone to follow up externally
5. Pagination if leads exceed one page (10 per page)

**Journey 3 — Quick Actions**
1. From Vendor Dashboard, vendor clicks "Add Property" quick link -> goes to `/add-property`
2. Or clicks "My Listings" quick link -> goes to `/my-listings`
3. These are existing pages, no new flows needed

### 2B. Buyer/Tenant Journey

**Journey 1 — Save a Property (discovery intent)**
1. Buyer browses `/buy` or `/rent`
2. Sees heart icon (outline) on top-right of each PropertyCard image
3. Clicks heart — if not logged in, redirected to `/login` with return URL
4. If logged in, heart fills red, toast confirms "Property saved"
5. Clicking filled heart again unsaves it, toast confirms "Property removed from saved"

**Journey 2 — Access Dashboard (review intent)**
1. Buyer logs in, clicks "Dashboard" from Navbar dropdown
2. Sees `/dashboard` with three sections: Saved Properties, Recently Viewed, Contacted Properties
3. Each section shows up to 4 PropertyCards in a horizontal row
4. If a section has more than 4, a "View All" link appears in the section header
5. Buyer clicks a PropertyCard to revisit the property detail page

**Journey 3 — Manage Saved Properties**
1. From Dashboard, buyer sees Saved Properties section
2. Each PropertyCard has the filled heart icon — can unsave directly from here
3. "View All" goes to a full saved properties page (future phase, or scrolls to expanded view)

### 2C. Admin Journey

**Journey 1 — Admin Login (entry point)**
1. Admin navigates to `/admin/login` directly (no link from consumer site)
2. Sees a clean, professional login card — ChikuProp logo + "Admin Panel" subtitle
3. Enters email + password, submits
4. Backend authenticates; frontend checks `role === "admin"`
5. If not admin, error message: "Access denied — admin only"
6. If admin, redirects to `/admin/dashboard`

**Journey 2 — Review Platform Health (daily check)**
1. Admin lands on `/admin/dashboard`
2. Sees 5 stat cards: Total Users, Total Listings, Active vs Paused/Expired, Total Views, Total Leads
3. Quick scan — any anomalies? Sudden drops or spikes?
4. Sidebar navigation always visible for quick access to other sections

**Journey 3 — Manage Users (moderation)**
1. Admin clicks "Users" in sidebar -> `/admin/users`
2. Sees data table with all users: name, email, phone, role, joined date, blocked status
3. Uses search bar to find a specific user by name or email
4. Clicks "Block" on a problematic user -> confirmation modal -> confirms
5. User row updates to show "Blocked" badge, button changes to "Unblock"

**Journey 4 — Moderate Properties (quality control)**
1. Admin clicks "Properties" in sidebar -> `/admin/properties`
2. Sees data table with all properties, defaults to showing all statuses
3. Uses status filter dropdown to focus on "flagged" or new listings
4. Reviews a listing — clicks "Approve" (sets active), "Reject" (sets rejected), or "Flag" (sets flagged)
5. For serious violations, clicks "Remove" -> confirmation modal -> confirms permanent deletion

**Journey 5 — Track Grievances**
1. Admin clicks "Grievances" in sidebar -> `/admin/grievances`
2. Sees table of grievances with subject, user, status, date
3. Filters by status: pending, in-progress, resolved
4. Updates status via dropdown: pending -> in-progress -> resolved

---

## 3. Page & Feature Structure

### 3A. Consumer Pages — Section Order & Reasoning

#### Vendor Dashboard (`/vendor/dashboard`)

| Section | Order | Reasoning |
|---------|-------|-----------|
| Page header | 1 | "Dashboard" title + welcome message ("Welcome back, {firstName}") establishes context |
| Stat cards row | 2 | The primary reason vendors visit — scan numbers immediately |
| Quick actions row | 3 | After scanning stats, vendor needs to act — direct links to common tasks |

**Stat Cards Layout:**
- 4 cards in a single row on desktop (>900px)
- 2x2 grid on tablet (480px-900px)
- Single column stack on mobile (<480px)
- Each card: icon (top-left), number (large, bold), label (small, below number)
- Card styling: white background, var(--shadow-card), var(--radius-card), thin left border accent using var(--gradient-card-accent)

**Quick Actions Layout:**
- 3 buttons in a row: "My Listings" (secondary style), "View Leads" (secondary style), "Add Property" (primary gradient style)
- On mobile: full-width stacked buttons

#### Vendor Leads Page (`/vendor/leads`)

| Section | Order | Reasoning |
|---------|-------|-----------|
| Page header | 1 | "Your Leads" title + total count badge |
| Search/filter bar | 2 | Future enhancement placeholder — not required in Phase 5, but reserve the space |
| Leads table (desktop) / card list (mobile) | 3 | The core data |
| Pagination controls | 4 | Bottom of page, standard prev/next with page numbers |
| Empty state | fallback | Shown when no leads exist |

**Table Columns (desktop):**
1. Buyer Name
2. Buyer Email
3. Property Title (linked to property detail)
4. Date (formatted: "Mar 24, 2026")

**Card Layout (mobile, <768px):**
- Each lead as a card with:
  - Buyer name (bold) + email (gray, below)
  - Property title (linked)
  - Date (right-aligned or bottom)
- Same card styling as PropertyCard (white bg, shadow, radius)

#### Buyer/Tenant Dashboard (`/dashboard`)

| Section | Order | Reasoning |
|---------|-------|-----------|
| Page header | 1 | "My Dashboard" title + welcome message |
| Saved Properties section | 2 | Most actionable — user explicitly chose to save these |
| Recently Viewed section | 3 | Passive history — useful but less intentional than saves |
| Contacted Properties section | 4 | Past actions — useful for follow-up |

**Each Section Structure:**
- Section header: Title (left) + "View All >" link (right, only if more than 4 items)
- Property grid: up to 4 PropertyCards in a row (reusing existing PropertyCard component)
- Empty state: gentle message + CTA button
  - Saved: "No saved properties yet. Browse properties to find your next home." + "Browse Properties" button
  - Recently Viewed: "No recently viewed properties." (or "Coming soon" if M1 not built)
  - Contacted: "You haven't contacted any vendors yet." + "Browse Properties" button

**Grid Layout:**
- 4 columns on desktop (>900px)
- 2 columns on tablet (480px-900px)
- 1 column on mobile (<480px)
- Same grid gap and card sizing as BuyPage/RentPage property grids

#### Heart Icon on PropertyCard (cross-cutting)

**Placement:** Top-right corner of `.property-card__image`, absolutely positioned (same level as existing `.property-card__featured` badge but offset if both exist)

**States:**
- Default (not saved): outline heart, white with slight shadow for visibility on any image
- Saved: filled heart, red (#EF4444 / var(--error) repurposed, or dedicated red)
- Hover: slight scale(1.15) transform
- Click: scale bounce animation (scale 1 -> 1.3 -> 1, 200ms)

**Positioning Rules:**
- If both "Featured" badge and heart exist: Featured stays top-right, heart moves to second row (top: 44px) OR heart goes to top-right and Featured shifts left. Recommendation: Heart always top-right at `top: 12px; right: 12px`, Featured badge moves to `right: auto; left: 12px` to avoid collision. Wait — Featured is already at `right: 12px`. So: move heart to `top: 12px; right: 12px` and move Featured to `top: 44px; right: 12px` (below heart). This keeps heart always in the same predictable position.

**Interaction:**
- Click must NOT trigger card Link navigation — use `e.stopPropagation()` and `e.preventDefault()`
- Wrap heart in a `<button>` element (not a div) for accessibility
- `aria-label`: "Save property" / "Remove from saved"

### 3B. Admin Pages — Section Order & Reasoning

#### Admin Login (`/admin/login`)

**Layout:** Centered card on a full-viewport background

**Visual Design:**
- Background: solid #1A1A2E (dark navy) or subtle gradient from #1A1A2E to #16213E
- Login card: white, max-width 420px, centered vertically and horizontally
- Card content:
  1. ChikuProp logo (text-based, styled differently — no gradient, just dark text)
  2. "Admin Panel" subtitle in gray
  3. Email input
  4. Password input
  5. Login button (solid color, NOT gradient — use #2563EB blue or #0F766E teal)
  6. Error message area (red text below button)
- NO links to consumer registration or forgot password
- NO consumer Navbar or Footer rendered

#### Admin Layout (`AdminLayout`)

**Structure:**
```
+--sidebar--+--------content-area--------+
|  logo     |  top-bar                   |
|  ------   |  ------------------------  |
|  nav item |                            |
|  nav item |  [page content renders     |
|  nav item |   here via <Outlet />]     |
|  nav item |                            |
|           |                            |
|  ------   |                            |
|  logout   |                            |
+-----------+----------------------------+
```

**Sidebar Specs:**
- Width: 240px fixed on desktop
- Background: #1E293B (slate-800) — dark, professional
- Logo area: "ChikuProp" text + "Admin" badge, padding 24px
- Nav items: icon (20px) + label, padding 12px 24px, font-size 14px, color #94A3B8 (slate-400)
- Active nav item: background #334155 (slate-700), color #FFFFFF, left border 3px solid #3B82F6 (blue-500)
- Hover: background #334155 (slate-700)
- Logout button: at bottom of sidebar, separated by divider, red icon + text
- Sidebar nav items:
  1. Dashboard (icon: grid/chart) -> `/admin/dashboard`
  2. Users (icon: people) -> `/admin/users`
  3. Properties (icon: building) -> `/admin/properties`
  4. Grievances (icon: message-circle) -> `/admin/grievances`
  5. --- divider ---
  6. Logout (icon: log-out)

**Top Bar Specs:**
- Height: 64px
- Background: #FFFFFF
- Border-bottom: 1px solid #E2E8F0 (slate-200)
- Content: page title (left), admin name + avatar circle (right)

**Content Area:**
- Background: #F8FAFC (slate-50) — light gray
- Padding: 24px (desktop), 16px (mobile)
- Scrollable independently from sidebar

**Mobile Behavior (<768px):**
- Sidebar hidden by default
- Hamburger icon in top-bar (left side) toggles sidebar as overlay
- Sidebar slides in from left with backdrop overlay
- Clicking outside sidebar or on a nav item closes it

#### Admin Dashboard (`/admin/dashboard`)

| Section | Order | Reasoning |
|---------|-------|-----------|
| Page title | 1 | "Dashboard" in top bar — automatic from layout |
| Stat cards grid | 2 | Primary overview — admins check health metrics first |

**Stat Cards:**
- 5 cards in a flexible grid: 3+2 row pattern on desktop, 2+2+1 on tablet, 1 column on mobile
- Each card: white background, border-radius 8px, padding 24px, subtle shadow
  - Top row: icon (in a colored circle background) + label text
  - Bottom row: large number (32px, bold) + optional secondary text (e.g., "412 active / 38 paused")
- Card color coding by icon circle background:
  - Total Users: blue (#3B82F6)
  - Total Listings: purple (#8B5CF6)
  - Active vs Paused: green (#10B981)
  - Total Views: amber (#F59E0B)
  - Total Leads: pink (#EC4899)

#### Admin User Management (`/admin/users`)

| Section | Order | Reasoning |
|---------|-------|-----------|
| Page title + total count | 1 | Context: "Users (1,234)" |
| Search bar | 2 | First action is usually finding a specific user |
| Data table | 3 | Core content |
| Pagination | 4 | Navigate through pages |

**Table Design:**
- Clean, borderless rows with alternating subtle background (#F8FAFC / #FFFFFF)
- Row hover: background #EFF6FF (light blue tint)
- Columns:
  1. Name (bold)
  2. Email
  3. Phone
  4. Role (badge: "user" in gray, "admin" in blue)
  5. Joined (formatted date)
  6. Status (badge: "Active" in green, "Blocked" in red)
  7. Actions (Block/Unblock button)

**Action Button Styling:**
- Block: small button, red outline, text "Block"
- Unblock: small button, green outline, text "Unblock"
- On click: confirmation modal appears

**Confirmation Modal:**
- "Are you sure you want to block {userName}?"
- "This will prevent them from accessing the platform."
- Two buttons: "Cancel" (gray) and "Block User" (red filled)
- Same modal pattern for unblock but with green "Unblock User" button

**Search Bar:**
- Full-width above table
- Placeholder: "Search by name or email..."
- Search triggers on Enter key or after 500ms debounce
- Clears with X button inside the input

**Pagination:**
- Bottom of table, right-aligned
- "Showing 1-10 of 234" text (left)
- Page buttons: Prev, 1, 2, 3, ..., 24, Next (right)
- 10 users per page

#### Admin Property Moderation (`/admin/properties`)

| Section | Order | Reasoning |
|---------|-------|-----------|
| Page title + total count | 1 | "Properties (567)" |
| Filter bar | 2 | Status filter is the primary moderation workflow |
| Data table | 3 | Core content |
| Pagination | 4 | Navigate through pages |

**Filter Bar:**
- Status dropdown: All, Active, Paused, Expired, Flagged, Rejected
- Default: "All"
- Count badges next to each filter option showing how many properties in each status

**Table Columns:**
1. Title (truncated to 40 chars, linked to property detail on consumer site in new tab)
2. Vendor (name)
3. City
4. Type (Sale/Rent badge)
5. Status (colored badge — green: active, yellow: paused, gray: expired, orange: flagged, red: rejected)
6. Plan (Free/Paid badge)
7. Created (date)
8. Actions (dropdown menu)

**Actions Dropdown (per row):**
- "Approve" (set status to active) — green text
- "Reject" (set status to rejected) — red text
- "Flag" (set status to flagged) — orange text
- "Remove" (permanent delete) — red text, bold
- Remove triggers a confirmation modal: "Permanently delete '{title}'? This cannot be undone." with "Cancel" and "Delete" buttons

**Status Badges:**
- Active: background #DCFCE7, text #166534
- Paused: background #FEF9C3, text #854D0E
- Expired: background #F3F4F6, text #374151
- Flagged: background #FED7AA, text #9A3412
- Rejected: background #FEE2E2, text #991B1B

#### Admin Grievance Tracking (`/admin/grievances`)

| Section | Order | Reasoning |
|---------|-------|-----------|
| Page title + count | 1 | "Grievances (23)" |
| Status filter tabs | 2 | Tabs: All, Pending, In Progress, Resolved |
| Data table | 3 | Core content |
| Pagination | 4 | Navigate |

**Table Columns:**
1. Subject
2. User (name + email)
3. Status (colored badge, same pattern as property statuses)
4. Submitted (date)
5. Actions (status update dropdown)

**Status Update:**
- Inline dropdown in the actions column
- Options: Pending, In Progress, Resolved
- Selecting a new status immediately updates via API (optimistic UI)
- Toast notification confirms: "Grievance status updated to In Progress"

**Dependency Note:** This page only renders if the Grievance model and API exist. If not available, show a placeholder: "Grievance tracking will be available once the grievance submission system is built."

---

## 4. Navigation & Flow Logic

### 4A. Consumer Navigation Updates

**Navbar Dropdown (logged-in user) — Updated Items:**
Current dropdown:
- My Profile (coming soon)
- My Listings
- Logout

Updated dropdown:
- Dashboard (links to `/dashboard`)
- My Listings (existing, links to `/my-listings`)
- Vendor Dashboard (links to `/vendor/dashboard`) — show ONLY if user has any properties
- My Profile (coming soon)
- --- divider ---
- Logout

**Reasoning for conditional "Vendor Dashboard" link:** Since there is no formal "vendor" role, any user who has posted a property is a de facto vendor. Showing "Vendor Dashboard" to users with zero properties would create confusion. The API can return a flag `hasProperties: true/false` on the user profile, or the frontend can check from a cached property count.

**Alternative (simpler) approach:** Always show both "Dashboard" and "Vendor Dashboard" to logged-in users. The Vendor Dashboard page itself handles the empty state ("You haven't listed any properties yet. Post your first property to see stats here."). This avoids an extra API call in Navbar and is simpler to implement. **Recommended: use this approach.**

### 4B. Admin Navigation — Fully Separate

**Entry Point:** Admin navigates directly to `/admin/login`. There is NO link to the admin panel from the consumer website. This is intentional — the admin panel is a separate tool.

**Post-Login Flow:**
- `/admin/login` -> authenticate -> check role -> redirect to `/admin/dashboard`
- All `/admin/*` routes (except `/admin/login`) render inside `AdminLayout` (sidebar + content)
- If a non-admin user somehow reaches `/admin/dashboard`, the `AdminProtectedRoute` redirects to `/admin/login`

**Sidebar is the primary navigation:**
- Dashboard, Users, Properties, Grievances, Logout
- Active item highlighted
- No breadcrumbs needed for Phase 5 (all pages are top-level)

### 4C. Route Tree Restructuring (App.jsx)

Current App.jsx wraps ALL routes in Navbar + Footer. This must change:

```
<BrowserRouter>
  <AuthProvider>
    <ToastProvider>
      <Routes>
        {/* Consumer routes — with Navbar + Footer */}
        <Route element={<ConsumerLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/buy" element={<BuyPage />} />
          ... all existing routes ...
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<BuyerDashboard />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/leads" element={<VendorLeads />} />
            ... existing protected routes ...
          </Route>
        </Route>

        {/* Admin routes — NO Navbar/Footer */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/grievances" element={<AdminGrievances />} />
          </Route>
        </Route>
      </Routes>
    </ToastProvider>
  </AuthProvider>
</BrowserRouter>
```

**Key point:** `ConsumerLayout` is a new wrapper component that renders `<Navbar />`, `<Outlet />`, `<GrievanceWidget />`, `<Footer />`. This replaces the current direct rendering in App.jsx.

---

## 5. Information Architecture

### 5A. Consumer Site — Updated Sitemap

```
/ (Landing)
/buy (BuyPage)
/rent (RentPage)
/property/:id (PropertyDetail)
/login (LoginPage)
/register (RegisterPage)
/add-property (AddPropertyPage)
/advertise (AdvertisePage)
/grievances (GrievancesPage)
/my-listings (MyListingsPage) [protected]
/edit-property/:id (EditPropertyPage) [protected]
/dashboard (BuyerDashboard) [protected] -- NEW
/vendor/dashboard (VendorDashboard) [protected] -- NEW
/vendor/leads (VendorLeads) [protected] -- NEW
```

### 5B. Admin Panel — Sitemap

```
/admin/login (AdminLogin)
/admin/dashboard (AdminDashboard) [admin-protected]
/admin/users (AdminUsers) [admin-protected]
/admin/properties (AdminProperties) [admin-protected]
/admin/grievances (AdminGrievances) [admin-protected]
```

### 5C. Data Flow per Page

| Page | API Calls | Data Displayed |
|------|-----------|----------------|
| BuyerDashboard | `GET /api/saved`, `GET /api/recently-viewed`, `GET /api/leads/my` | PropertyCards in 3 sections |
| VendorDashboard | `GET /api/dashboard/vendor` | 4 stat numbers |
| VendorLeads | `GET /api/leads/vendor?page=&limit=` | Table/cards of lead entries |
| PropertyCard (heart) | `GET /api/saved/check/:id` on mount, `POST /api/saved/:id` on click | Heart filled/outline state |
| AdminDashboard | `GET /api/admin/stats` | 5 stat numbers |
| AdminUsers | `GET /api/admin/users?search=&page=&limit=` | User table |
| AdminProperties | `GET /api/admin/properties?status=&page=&limit=` | Property table |
| AdminGrievances | `GET /api/admin/grievances?status=&page=&limit=` | Grievance table |

### 5D. Saved Status Batch Loading Strategy

When BuyPage or RentPage loads a list of properties, we need to know which ones are saved by the current user. Two approaches:

**Option A — Batch check:** After property list loads, call `POST /api/saved/check-batch` with `{ propertyIds: [...] }` to get `{ savedIds: [...] }`. One API call.

**Option B — Include in property response:** Backend enriches property list response with `isSaved: true/false` per property when a user is authenticated.

**Recommendation: Option A** — cleaner separation of concerns. The property list API remains unchanged. A new batch-check endpoint is lightweight and specific to the saved feature.

If Option A is too complex for Phase 5, fall back to checking individually per card (N API calls), which is acceptable for small page sizes (10-12 cards).

---

## 6. Trust & Clarity Recommendations

### Consumer Side

1. **Save confirmation feedback:** Always show a toast ("Property saved" / "Removed from saved") after heart toggle. Users need confirmation that their action registered.

2. **Empty state encouragement:** Empty sections on dashboards should guide users to action, not just say "nothing here." Use a soft illustration or icon + message + CTA button.

3. **Vendor lead privacy:** On the Vendor Leads page, show buyer name and email (already public via lead creation). Do NOT show buyer's phone number unless the buyer explicitly opted in. This builds trust with buyers who unlock contacts.

4. **Stats accuracy indicator:** On Vendor Dashboard, include a small "Last updated" timestamp or "Stats refresh every few minutes" note. Vendors will compare numbers across sessions — they need to trust the data.

5. **Consistent PropertyCard:** Reuse the exact same PropertyCard component on BuyerDashboard sections. Do NOT create a simplified version. Consistency in card appearance builds recognition and trust.

### Admin Side

6. **Destructive action protection:** Every destructive action (block user, delete property) must show a confirmation modal with clear language about the impact. Red buttons for destructive actions. No single-click destructive operations.

7. **Audit trail visibility:** When an admin blocks a user or rejects a property, the table should update immediately (optimistic UI) with a success toast. If the API fails, revert the UI and show an error toast.

8. **Role safety:** If a logged-in non-admin user navigates to `/admin/dashboard`, redirect to `/admin/login` with a neutral message — not "Access denied" (which reveals the URL is valid). Use: "Please log in to continue."

9. **No consumer cross-contamination:** The admin panel must never load consumer CSS variables (pink-purple). Admin pages should have their own CSS scope (e.g., `.admin-*` prefix for all admin CSS classes, or a separate CSS file with admin-specific variables).

---

## 7. Mobile UX Considerations

### Consumer Dashboards

**Vendor Dashboard (mobile):**
- Stat cards stack to single column
- Quick action buttons become full-width stacked
- Page padding reduces to 16px

**Vendor Leads (mobile):**
- Table converts to card list at <768px breakpoint
- Each lead rendered as a card: buyer info top, property title middle, date bottom
- Pagination controls: simplified to Prev/Next buttons (no page numbers)

**Buyer Dashboard (mobile):**
- Each section's PropertyCard grid becomes single-column
- Show max 2 cards per section on mobile (instead of 4) with "View All" link
- Section headings slightly smaller (h3 instead of h2)

**Heart Icon (mobile):**
- Touch target must be minimum 44x44px (even if the icon is smaller)
- Heart button area should have extra padding for fat-finger safety
- Position stays top-right of image — no change from desktop

### Admin Panel (mobile)

**Priority:** Functional, not optimized. Admin panel is a desktop-first tool.

**Sidebar:** Collapses completely, accessible via hamburger icon. Slides in as overlay with dark backdrop.

**Tables:** On screens <768px, tables become horizontally scrollable (not responsive cards). This preserves data density. Admin needs to see columns side by side, not restructured.

**Alternative for very small screens (<480px):** Convert admin tables to card layout similar to Vendor Leads. But this is lower priority — real-world admin usage on phones is rare.

**Stat cards:** Stack to 2x2 + 1 on mobile.

---

## 8. Accessibility Notes

### Consumer Pages

1. **Heart icon button:** Must use `<button>` element, not `<div>` or `<span>`. Include `aria-label` that reflects state: `aria-label="Save property"` when unsaved, `aria-label="Remove from saved"` when saved. Add `aria-pressed` attribute.

2. **Stat cards on dashboards:** Each stat card should use semantic markup — `<article>` or `<div role="group">` with `aria-label` describing the stat (e.g., `aria-label="Total Listings: 12"`).

3. **Dashboard sections:** Use `<section>` elements with proper `<h2>` headings for each dashboard section (Saved, Recent, Contacted). This helps screen readers navigate between sections.

4. **Empty states:** Empty state messages should be in a `<p>` tag (not just a decorative div) so screen readers announce them.

5. **Loading states:** Use `aria-live="polite"` on the container where loading states appear, so screen readers announce when content loads.

### Admin Pages

6. **Sidebar navigation:** Use `<nav>` element with `aria-label="Admin navigation"`. Active item should have `aria-current="page"`.

7. **Data tables:** Use proper `<table>`, `<thead>`, `<th>`, `<tbody>`, `<tr>`, `<td>` elements. Add `scope="col"` to `<th>` elements. Add `aria-label` to the table describing its purpose.

8. **Action buttons in tables:** Each action button must have `aria-label` that includes the target (e.g., `aria-label="Block user John Doe"`), not just "Block".

9. **Confirmation modals:** Must trap focus when open, return focus to the trigger button when closed. Use `role="alertdialog"` and `aria-describedby` pointing to the warning message.

10. **Status badges:** Color is not the only indicator — status text is always shown alongside the color. This satisfies WCAG color contrast requirements.

11. **Keyboard navigation:** All interactive elements must be reachable via Tab key. Admin sidebar items navigable with arrow keys.

---

## 9. Risks & Gaps

### RISK 1 — PropertyCard Heart Icon Conflicts with Existing Badges
**Description:** The PropertyCard currently has `property-card__type` (top-left) and `property-card__featured` (top-right). Adding a heart icon to top-right conflicts with the Featured badge position.
**Impact:** Visual overlap or awkward positioning on featured properties.
**Mitigation:** Move Featured badge to `top: 44px; right: 12px` (below heart) or to `top: 12px; left: auto` (after the type badge). Heart icon always owns the top-right corner for consistency.

### RISK 2 — Batch Saved-Status Check Performance
**Description:** When BuyPage loads 12 properties, we need to know which are saved. N individual API calls is slow; a batch endpoint is cleaner but is an extra API to build.
**Impact:** Slow page loads or delayed heart state rendering (heart flickers from outline to filled after API response).
**Mitigation:** Build the batch check endpoint. Show hearts in a neutral/disabled state during loading (gray outline), then transition to correct state. Avoid showing wrong state.

### RISK 3 — No Vendor Role in User Model
**Description:** There is no "vendor" role. Any user can post a property. The Vendor Dashboard link in Navbar would appear for all logged-in users.
**Impact:** Non-vendors clicking "Vendor Dashboard" see empty stats, which is confusing.
**Mitigation:** Show the Vendor Dashboard link to all users but handle the empty state gracefully: "You haven't listed any properties yet. Post your first property to see stats here." with a CTA to `/add-property`. This doubles as a nudge to list properties.

### RISK 4 — Admin CSS Leaking into Consumer (or vice versa)
**Description:** Both systems share index.css global variables. Admin pages might accidentally inherit pink-purple styles from `:root`.
**Impact:** Admin panel looks inconsistent or accidentally branded.
**Mitigation:** Admin pages should define their own CSS variables scoped under a `.admin-root` class wrapping the AdminLayout. Admin CSS files should override global variables within this scope. Consumer CSS remains untouched.

### RISK 5 — Grievance Model Dependency for M4
**Description:** The admin Grievance Tracking page requires a Grievance model and API that does not currently exist.
**Impact:** M4 cannot be built without backend work beyond Phase 5 scope.
**Mitigation:** Either build a minimal Grievance model in Phase 5 (recommended by Product Owner), or show a placeholder page in the admin sidebar with "Coming soon" messaging. The sidebar item should still exist so admins see it is planned.

### GAP — No "View All" Destination Pages
The Buyer Dashboard shows "View All" links for each section (Saved, Recently Viewed, Contacted). These links need destination pages. Options:
- Link to a full-page view of that section (e.g., `/dashboard/saved`, `/dashboard/recent`, `/dashboard/contacted`)
- Or anchor-link to an expanded version on the same page
- **Recommendation:** For Phase 5, "View All" simply expands the section to show all items on the same page (no separate route). This avoids creating 3 additional page components. Can add dedicated pages in a future phase.

### GAP — No Admin Creation Flow
There is no UI or API to create admin users. For Phase 5, the first admin must be seeded directly in MongoDB. This is acceptable but should be documented for the developer.

---

## 10. Notes for Software Architect

1. **Route tree restructuring is critical.** The current App.jsx renders Navbar/Footer around ALL routes. Phase 5 requires a `ConsumerLayout` wrapper and a separate `AdminLayout` wrapper. Plan the route tree in App.jsx carefully — this is a structural change that affects every existing page. Use React Router's layout route pattern with `<Outlet />`.

2. **Admin CSS isolation.** Define an admin design token set (colors, typography, spacing) completely independent of the consumer `:root` variables. Use a `.admin-root` scoping class or a separate CSS variable namespace (e.g., `--admin-bg`, `--admin-sidebar-bg`, `--admin-text`). The admin panel should be visually self-contained.

3. **Admin auth flow reuses existing infrastructure.** Same `POST /api/auth/login` endpoint, same JWT token, same AuthContext. The only difference is a frontend role check after login. `AdminProtectedRoute` component checks `user.role === "admin"`.

4. **New service files needed:**
   - `savedService.js` — save, unsave, getSaved, checkSaved, batchCheckSaved
   - `recentlyViewedService.js` — recordView, getRecentlyViewed
   - `dashboardService.js` — getVendorStats, getMyLeads
   - `adminService.js` — getStats, getUsers, blockUser, getProperties, updatePropertyStatus, deleteProperty, getGrievances, updateGrievanceStatus

5. **New component folders:**
   - `components/admin/` — AdminLayout, AdminSidebar, AdminTopBar, AdminProtectedRoute, AdminStatCard, AdminDataTable, StatusBadge, ConfirmModal
   - `components/dashboard/` — StatCard (consumer-styled), DashboardSection (title + grid + View All)

6. **Batch saved-status check** is important for performance. Design the endpoint `POST /api/saved/check-batch` accepting `{ propertyIds: [id1, id2, ...] }` returning `{ savedIds: [id1, id3] }`.

## Notes for Frontend Developer

1. **Consumer dashboard pages follow existing patterns.** Look at Landing.jsx for the section-based layout pattern (section heading + grid of PropertyCards). Buyer Dashboard is essentially three of those sections on one page. Follow the same CSS patterns: `.section`, `.section-title`, `.container`, and property-card grid layout.

2. **Heart icon implementation priority:**
   - Add heart `<button>` inside `.property-card__image` div
   - Use `react-icons` — `FiHeart` (outline) and `FaHeart` (filled, from `react-icons/fa`)
   - CSS class toggle: `.property-card__heart` and `.property-card__heart--saved`
   - Handle `onClick` with `e.stopPropagation(); e.preventDefault();`
   - If user not logged in, use `navigate('/login', { state: { from: location } })` for redirect-back

3. **Admin panel is a fresh UI system.** Do NOT import consumer CSS files or reuse consumer component styles. Build admin components from scratch with their own CSS files. The only shared code should be: AuthContext, ToastContext, api.js (axios instance), and utility functions.

4. **Admin table component should be generic.** Build one `AdminDataTable` component that accepts columns config and data array. Reuse it for Users, Properties, and Grievances tables. This avoids duplicating table markup and styling three times.

5. **Admin color palette (CSS variables to define in admin scope):**
   ```css
   .admin-root {
     --admin-sidebar-bg: #1E293B;
     --admin-sidebar-text: #94A3B8;
     --admin-sidebar-active: #334155;
     --admin-sidebar-accent: #3B82F6;
     --admin-topbar-bg: #FFFFFF;
     --admin-content-bg: #F8FAFC;
     --admin-text-primary: #0F172A;
     --admin-text-secondary: #64748B;
     --admin-border: #E2E8F0;
     --admin-radius: 8px;
     --admin-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
     --admin-blue: #3B82F6;
     --admin-green: #10B981;
     --admin-red: #EF4444;
     --admin-amber: #F59E0B;
     --admin-font: 'Inter', system-ui, -apple-system, sans-serif;
   }
   ```

6. **Responsive breakpoints:**
   - Consumer dashboards: follow existing breakpoints (900px, 768px, 480px)
   - Admin panel: 1024px (sidebar collapses), 768px (tables scroll horizontally)

7. **Loading states for all pages:**
   - Consumer pages: use existing `<Loader />` component (centered spinner)
   - Admin pages: use a skeleton loader pattern (gray animated rectangles where data will appear). Build a simple `AdminSkeleton` component for stat cards and table rows.

8. **Empty state illustrations:** Keep them simple — an icon (from react-icons, 48px, gray) + text message + optional CTA button. Do NOT add SVG illustrations or images for empty states in Phase 5.

9. **Navbar dropdown update:** Add "Dashboard" and "Vendor Dashboard" links to the existing dropdown in Navbar.jsx. Place "Dashboard" as the first item in the dropdown (most common action for logged-in users).

10. **GrievanceWidget and ChatBot visibility:** These floating widgets should appear on consumer pages only, NOT on admin pages. Since admin pages use AdminLayout (not ConsumerLayout), these widgets naturally will not render — but verify this during implementation.