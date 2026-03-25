# Phase 4 — Lead Flow (Core Business Logic)

## What was built

### Backend

**New files:**
- `server/models/Lead.js` — Lead schema with userId+propertyId unique compound index, vendorId index for fast vendor lead lookups
- `server/controllers/leadController.js` — 3 endpoints: unlockContact, checkUnlockStatus, getVendorLeads
- `server/routes/leadRoutes.js` — POST /unlock/:propertyId, GET /check/:propertyId, GET /vendor
- `server/utils/maskContact.js` — maskPhone() and maskEmail() utilities

**Modified files:**
- `server/server.js` — Added lead routes at /api/leads
- `server/controllers/propertyController.js` — getPropertyById now returns maskedPhone/maskedEmail instead of full contactPhone/contactEmail. Removed old unlockContact (replaced by lead-based one). Added maskContact import.
- `server/routes/propertyRoutes.js` — Removed old GET /:id/contact route

### Frontend

**New files:**
- `client/src/services/leadService.js` — unlockContact, checkUnlockStatus, getVendorLeads API calls
- `client/src/components/property/ContactUnlock.jsx` — Core business component with 3 states
- `client/src/components/property/ContactUnlock.css` — Styling for all 3 states

**Modified files:**
- `client/src/pages/PropertyDetail.jsx` — Replaced hardcoded contact aside with ContactUnlock component. Removed client-side masking (now done on backend).

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/leads/unlock/:propertyId | Required | Unlock contact — creates Lead, returns full contact |
| GET | /api/leads/check/:propertyId | Required | Check if user already unlocked a property |
| GET | /api/leads/vendor | Required | Get all leads for vendor's properties (paginated) |

## Contact Flow

1. **Not logged in:** Backend returns maskedPhone + maskedEmail. Frontend shows masked contact + "Login to View Contact" button (redirects to /login with return URL)
2. **Logged in, not unlocked:** Frontend checks unlock status on mount. Shows masked contact + "View Contact Details" button
3. **Unlock clicked:** POST /api/leads/unlock/:propertyId creates Lead record, increments contactUnlockCount, returns full contact
4. **Already unlocked:** Returns full contact without creating duplicate (unique index protection + race condition handling)
5. **Vendor viewing own property:** Returns full contact without creating a lead

## Lead Model Schema

```
Lead {
  propertyId: ObjectId (ref Property, required)
  vendorId: ObjectId (ref User, required)
  userId: ObjectId (ref User, required)
  userRole: String (enum: user/admin, default: user)
  eventType: String (default: contact_unlock)
  timestamps: true
}
Indexes: { userId+propertyId: unique }, { vendorId+createdAt: -1 }
```

## Key decisions
- Contact info is masked on the backend (not frontend) — prevents leaking through network tab
- Duplicate leads prevented by MongoDB unique compound index + graceful handling of race condition (11000 error)
- Vendors can see their own property contacts without creating a lead
- checkUnlockStatus runs on component mount to restore unlocked state after page refresh
- getVendorLeads is ready for Phase 5 (Vendor Dashboard)