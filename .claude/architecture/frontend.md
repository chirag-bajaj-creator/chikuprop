# Frontend Architecture — React

## 4 UI Zones, 17 Pages

### Zone 1 — Discovery UI (Public, no login needed)
1. **Landing Page** — hero with search bar, featured properties, city cards, services preview
2. **Purchaser Listing Page** — property cards grid/list, filters (city, type, price, bedrooms), sort, pagination
3. **Tenant Listing Page** — same layout as purchaser but filtered for rentals
4. **Property Detail Page** — full details, image gallery, amenities, map, masked contact, unlock button
5. **Vendor Info Page** — why list with us, free vs paid comparison, CTA to post property
6. **Wanted Properties Page** — browse and post property requirements
7. **Services Page** — shifting, loans, legal, interior services

### Zone 2 — Conversion UI (Business-critical)
8. **Login Page** — email + password, redirect back to same property after login
9. **Register Page** — name, email, phone, password, role selection (purchaser/tenant/vendor)

**Contact unlock flow (inside Property Detail Page):**
- Before login: masked phone `98XXXXXX45`, masked email `ab****@gmail.com`, "Login to View Contact" button
- After login: full phone, full email, call button, WhatsApp button
- Backend creates lead record at unlock moment

### Zone 3 — Vendor UI (Vendor role only)
10. **Post Property Page** — multi-step form, image/video upload via Cloudinary, free/paid selection
11. **Vendor Dashboard** — stats cards (listings, views, leads, unlocks)
12. **My Listings Page** — cards/table of all listings, status toggle (active/paused), edit button
13. **Leads Page** — who unlocked contact, for which property, when

### Zone 4 — Dashboard UI (Role-specific)
14. **Purchaser Dashboard** — saved properties, recently viewed, contacted properties
15. **Tenant Dashboard** — saved rentals, recently viewed, contacted rentals
16. **Profile Page** — update name, phone, email, password, profile picture
17. **Notifications Page** — lead alerts, saved property updates

## Reusable Components (Build once, use everywhere)
- **PropertyCard** — Purchaser page, Tenant page, Saved, Recent, Search results
- **SearchBar** — Landing, Purchaser, Tenant pages
- **Loader** — every page that fetches data
- **ErrorState** — every page that fetches data
- **ContactUnlock** — the core business component (masked → login → reveal)
- **ViewToggle** — grid view (vertical cards) / list view (horizontal cards) toggle

## Folder Structure
```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── common/         (Navbar, Footer, PropertyCard, SearchBar, Loader, ErrorState, ViewToggle)
│   │   ├── property/       (PropertyGrid, PropertyFilters, PropertyGallery, ContactUnlock)
│   │   ├── vendor/         (PostPropertyForm, ListingCard, LeadCard, StatsCard)
│   │   └── dashboard/      (DashboardLayout, SavedList, RecentList)
│   ├── pages/              (17 page components)
│   ├── context/            (AuthContext, PropertyContext)
│   ├── hooks/              (useAuth, useProperties, useLeads)
│   ├── services/           (api.js — axios instance, auth, property, lead API calls)
│   ├── utils/              (maskContact, formatPrice, validators)
│   └── App.jsx             (routes, protected routes, layout)
```

## Key Rules
- Handle loading and error states in every component
- Clean up useEffect subscriptions (return cleanup function)
- Use try-catch in all API calls
- Validate user input before sending to backend
- No dangerouslySetInnerHTML
- One responsibility per component
