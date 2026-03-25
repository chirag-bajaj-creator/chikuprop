# BACKEND_DEVELOPER Output — Phase 3: Vendor Flow
**Agent:** BACKEND_DEVELOPER
**Status:** Complete
**Date:** 2026-03-21

---

## Files Created (5)

| File | Purpose |
|------|---------|
| `server/middleware/multerUpload.js` | Multer memory storage config — image filter (jpg/png/webp, 5MB, max 10), video filter (mp4, 50MB), handleMulterError wrapper |
| `server/routes/uploadRoutes.js` | POST /api/upload/images and POST /api/upload/video — both protected |
| `server/controllers/uploadController.js` | Cloudinary upload_stream for images (batch) and video (single), folder "chikuprop/properties" |
| `server/utils/constants.js` | ALLOWED_AMENITIES and PROTECTED_FIELDS arrays |
| `server/utils/sanitize.js` | stripHtml utility extracted for reuse |

## Files Modified (3)

| File | Changes |
|------|---------|
| `server/server.js` | Added uploadRoutes import + `app.use("/api/upload", uploadRoutes)` |
| `server/routes/propertyRoutes.js` | Added 5 new routes: POST /, GET /my (before /:id), PUT /:id, DELETE /:id, PATCH /:id/status — all protected |
| `server/controllers/propertyController.js` | Added 5 functions: createProperty, getMyProperties, updateProperty, deleteProperty, togglePropertyStatus |

## API Endpoints Implemented

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/upload/images | Required | Upload up to 10 images to Cloudinary |
| POST | /api/upload/video | Required | Upload 1 video to Cloudinary |
| POST | /api/properties | Required | Create a new property listing |
| GET | /api/properties/my | Required | Get logged-in user's listings |
| PUT | /api/properties/:id | Required + Owner | Update a property |
| DELETE | /api/properties/:id | Required + Owner | Delete a property |
| PATCH | /api/properties/:id/status | Required + Owner | Toggle active/paused |

## Key Implementation Details

- **Validation:** Full server-side validation on create — required fields, enums, regex for phone/email/pincode, conditional fields for flat/house vs plot/commercial, amenities checked against allowed list
- **Sanitization:** All string inputs stripped of HTML tags via stripHtml utility
- **Ownership:** PUT, DELETE, PATCH all verify `vendorId === req.user._id`, return 403 if not owner
- **Protected fields:** vendorId, status, planType, viewCount, contactUnlockCount are stripped from update body
- **Route order:** GET /my registered before GET /:id to prevent Express treating "my" as an ID
- **Response format:** `{ success: true, data: {} }` / `{ success: false, error: "message" }` throughout
- **Status codes:** Create returns 201, all others return 200, proper 400/401/403/404/500 for errors

## Notes for Frontend Developer
- Upload endpoints expect `multipart/form-data` with field name `images` (array) or `video` (single)
- Create/Update endpoints expect `application/json`
- Error responses always use `.error` field (not `.message`)
- GET /my returns subset of fields (no description, video, amenities, contact info) — optimized for card display
- Create returns only `_id, vendorId, title, status, createdAt` — redirect to My Listings for full data
