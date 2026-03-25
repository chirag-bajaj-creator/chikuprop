# Phase 3 Security Review Report

**Reviewer:** SECURITY_REVIEWER agent
**Date:** 2026-03-21
**Scope:** All Phase 3 (Vendor Flow) code — backend and frontend

---

## Issues Found & Fixed

### 1. ReDoS via User-Controlled Regex in Search/Filter
**Severity:** HIGH
**File:** `server/controllers/propertyController.js`
**Description:** The `search` and `city` query parameters were passed directly into MongoDB `$regex` without escaping. An attacker could craft a regex payload like `(a+)+$` to cause catastrophic backtracking and hang the server (Regular Expression Denial of Service).
**Fix:** Added `escapeRegex()` utility in `server/utils/sanitize.js` that escapes all special regex characters. Applied it to `search` and `city` query params before using them in `$regex`.

### 2. Open Redirect via `?redirect=` Parameter
**Severity:** MEDIUM
**Files:** `client/src/pages/LoginPage.jsx`, `client/src/pages/RegisterPage.jsx`, `client/src/services/api.js`, `client/src/components/auth/ProtectedRoute.jsx`
**Description:** The `?redirect=` query parameter was used directly in navigation without validation. An attacker could craft a URL like `/login?redirect=https://evil.com` or `/login?redirect=//evil.com` to redirect users to a phishing site after login.
**Fix:** Added validation that redirect values must start with `/` and must NOT start with `//` (which browsers interpret as protocol-relative URLs). Invalid redirects fall back to `/`.

### 3. Weak HTML Sanitizer Bypass
**Severity:** MEDIUM
**File:** `server/utils/sanitize.js`
**Description:** The single-pass `stripHtml` regex (`/<[^>]*>/g`) can be bypassed with nested tags like `<<script>script>alert(1)<</script>/script>`. After one pass, the inner tags are removed but the outer fragments reassemble into a valid tag.
**Fix:** Changed to multi-pass approach that keeps stripping until no more tags are found.

### 4. Arbitrary URL Storage (Image/Video Injection)
**Severity:** MEDIUM
**File:** `server/controllers/propertyController.js`
**Description:** The `images` and `video` fields in createProperty and updateProperty accepted any URL string. An attacker could store `javascript:` URIs, data URIs with embedded scripts, or URLs to tracking/phishing resources. When rendered in `<img src=...>`, some of these could lead to XSS or information leakage.
**Fix:** Added `isValidCloudinaryUrl()` validator in `server/utils/sanitize.js` that checks URLs are HTTPS and from `*.cloudinary.com`. Applied to both create and update endpoints.

### 5. Uncapped Pagination Limit (DoS Vector)
**Severity:** LOW
**File:** `server/controllers/propertyController.js`
**Description:** The `limit` query parameter had no upper bound. A request with `?limit=999999` would attempt to return all documents, potentially causing memory exhaustion and slow responses.
**Fix:** Capped `limit` to max 50, min 1, defaulting to 12. Also added `Math.floor` and `Math.max(1, ...)` for `page` to handle NaN/negative values.

### 6. Error Message Leaking Server Internals
**Severity:** LOW
**File:** `server/controllers/propertyController.js`
**Description:** `getProperties`, `getPropertyById`, and `unlockContact` returned `error.message` directly to the client. This could expose MongoDB query details, connection strings, or internal stack information.
**Fix:** Replaced raw `error.message` with generic user-friendly error messages.

### 7. Incomplete Protected Fields List
**Severity:** LOW
**File:** `server/utils/constants.js`
**Description:** The `PROTECTED_FIELDS` array (stripped from `req.body` during updates) was missing `createdAt`, `updatedAt`, `_id`, and `__v`. An attacker could attempt to forge these values in an update request.
**Fix:** Added `createdAt`, `updatedAt`, `_id`, and `__v` to the protected fields list.

### 8. localStorage Pending Data Expiration
**Severity:** LOW
**File:** `client/src/pages/AddPropertyPage.jsx`
**Description:** The `pendingProperty` localStorage data had no expiration. Stale form data could persist indefinitely and be unexpectedly loaded weeks later.
**Fix:** Added 24-hour expiration check using the existing `savedAt` timestamp.

---

## Items Reviewed — No Issues Found

### Auth & Authorization
- All protected routes (`POST`, `PUT`, `DELETE`, `PATCH`) correctly use the `protect` middleware.
- Ownership checks (`vendorId.toString() === req.user._id.toString()`) are present on update, delete, and toggle status.
- EditPropertyPage also verifies ownership on the frontend.
- Upload routes are protected — no unauthenticated uploads possible.

### File Upload Security
- Multer uses memory storage (no disk path traversal risk).
- MIME type filtering is in place (jpeg/png/webp for images, mp4 for video).
- File size limits are enforced (5MB images, 50MB video).
- File count is limited (10 images max).
- Multer errors are caught and returned as JSON (no crashes).

### XSS Prevention
- `stripHtml` is applied to title, description, and location fields on create and update.
- React automatically escapes JSX expressions, preventing XSS in rendered content.
- Image URLs are now validated as Cloudinary URLs (no `javascript:` or `data:` URIs).

### CSRF/CORS
- API uses Bearer token auth (not cookies), which is inherently CSRF-resistant.
- No cookie-based sessions are used.

### Data Exposure
- createProperty response returns only minimal fields (`_id`, `vendorId`, `title`, `status`, `createdAt`).
- getMyProperties uses `.select()` to limit returned fields.
- updateProperty response uses `.select("_id title status updatedAt")`.
- Contact info requires authenticated `unlockContact` endpoint.

### Cloudinary Security
- Upload credentials are in environment variables (not exposed to frontend).
- Uploads go through the backend — frontend never touches Cloudinary credentials.
- Upload folder is fixed (`chikuprop/properties`), not user-controlled.

### Error Handling
- All async route handlers use try-catch.
- Frontend components show loading and error states.
- useEffect cleanups are present where needed.

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | -- |
| High | 1 | Fixed |
| Medium | 3 | Fixed |
| Low | 4 | Fixed |

**Total issues found: 8 | All fixed.**

### Files Modified
- `server/utils/sanitize.js` — strengthened stripHtml, added escapeRegex and isValidCloudinaryUrl
- `server/utils/constants.js` — expanded PROTECTED_FIELDS
- `server/controllers/propertyController.js` — regex escaping, URL validation, pagination cap, error messages
- `client/src/pages/LoginPage.jsx` — open redirect prevention
- `client/src/pages/RegisterPage.jsx` — open redirect prevention
- `client/src/services/api.js` — safe redirect in 401 interceptor
- `client/src/components/auth/ProtectedRoute.jsx` — safe redirect path
- `client/src/pages/AddPropertyPage.jsx` — pending data expiration
