# Phase 2: Auth Pages & Context — SECURITY REVIEWER Output
**Agent:** SECURITY_REVIEWER
**Status:** Complete
**Date:** 2026-03-21
**Clearance:** Approved with Conditions

---

## Summary: 1 Critical, 2 High, 5 Medium, 7 Low

---

## Findings

### SEC-001 | High | JWT in localStorage (XSS theft risk)
- **Category:** OWASP A07 - XSS / A05 - Security Misconfiguration
- **Affected:** api.js:12, AuthContext.jsx:10,19,33,53,61,68
- **Risk:** Any XSS vulnerability allows `localStorage.getItem("chikuprop_token")` → full account takeover
- **Fix:** Migrate to httpOnly cookies with Secure + SameSite=Strict flags

### SEC-002 | CRITICAL | No rate limiting on auth endpoints
- **Category:** OWASP A07 - Identification and Authentication Failures
- **Affected:** server/routes/authRoutes.js:6-7, server/server.js
- **Risk:** Unlimited brute-force attacks, mass fake account creation
- **Fix:** Install `express-rate-limit` — 5 login attempts/15min/IP, 3 signups/hour/IP

### SEC-003 | Medium | Internal error messages leaked to client
- **Category:** OWASP A04 - Insecure Design
- **Affected:** server/controllers/authController.js:51,89
- **Risk:** Raw `error.message` exposes DB connection strings, Mongoose internals
- **Fix:** Return generic "An internal error occurred" in production, log actual error server-side

### SEC-004 | Medium | No server-side phone validation
- **Category:** OWASP A03 - Injection
- **Affected:** server/controllers/authController.js:11,28-29, server/models/User.js:27-30
- **Risk:** Dirty data, potential NoSQL injection if phone used in queries
- **Fix:** Add `match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"]` to User schema

### SEC-005 | Low | Weak password policy (6 chars, no complexity)
- **Category:** OWASP A07
- **Affected:** server/models/User.js:24
- **Fix:** Enforce min 8 chars, at least 1 uppercase, 1 digit, 1 special character

### SEC-006 | Medium | JWT expiry too long (7 days), no refresh tokens
- **Category:** OWASP A07
- **Affected:** server/controllers/authController.js:5
- **Fix:** Reduce to 15-30 min access token + implement refresh token flow

### SEC-007 | High | No server-side token revocation (client-only logout)
- **Category:** OWASP A07
- **Affected:** AuthContext.jsx:67-72 (only clears localStorage)
- **Risk:** Stolen tokens remain valid for 7 days even after logout
- **Fix:** Implement token blacklist (Redis/MongoDB) + POST /api/auth/logout endpoint

### SEC-008 | Medium | No CSRF protection
- **Category:** OWASP A01
- **Affected:** server/server.js
- **Risk:** Low now (Bearer tokens), but architectural risk if migrating to cookies
- **Fix:** Add CSRF validation when switching to httpOnly cookies

### SEC-009 | Medium | No account lockout after failed logins
- **Category:** OWASP A07
- **Affected:** server/controllers/authController.js:56-91
- **Fix:** Add failedLoginAttempts + lockUntil fields, lock after 5 failures for 15 min

### SEC-010 | Low | Role accepted from client (mitigated)
- **Category:** OWASP A01
- **Affected:** server/controllers/authController.js:23
- **Status:** Server validates — only "buyer"/"vendor" allowed. Adequately handled. Document as security-critical check.

### SEC-011 | Medium | No NoSQL injection sanitization
- **Category:** OWASP A03
- **Affected:** server/controllers/authController.js:17,64
- **Risk:** `{ "email": { "$gt": "" } }` could bypass auth
- **Fix:** Install `express-mongo-sanitize` or validate email/password are strings

### SEC-012 | Low | No explicit body size limit
- **Category:** OWASP A05
- **Affected:** server/server.js:18
- **Fix:** Use `express.json({ limit: '10kb' })`

### SEC-013 | Low | Email enumeration via signup error
- **Category:** OWASP A07
- **Affected:** server/controllers/authController.js:19
- **Fix:** Return generic message instead of "Email already registered"

### SEC-014 | Low | Inline styles in RegisterPage strength bar
- **Category:** Code quality violation
- **Affected:** RegisterPage.jsx:205-211
- **Fix:** Use CSS classes or custom properties instead

### SEC-015 | Low | PII over-exposure in API responses
- **Category:** OWASP A04
- **Affected:** server/controllers/authController.js:35-45,76-86
- **Fix:** Only return fields the client needs for the immediate operation

---

## Positive Findings
1. Password hashing — bcrypt with salt 12, `select: false` on password field
2. Login error — generic "Invalid email or password" prevents enumeration
3. Role escalation prevention — server enforces allowedRole whitelist
4. CORS configured — restricted to client URL
5. useEffect cleanup — cancelled flag pattern in AuthContext
6. ProtectedRoute — checks both auth and role
7. No password logging anywhere
8. JWT secret from environment variable
9. Consistent response format

---

## Release Blocking (Must fix before production)
- **SEC-002:** Add rate limiting on auth routes (Critical)
- **SEC-011:** Add NoSQL injection protection (Medium → auth bypass risk)
- **SEC-003:** Stop leaking error.message to clients (Medium)

## Strongly Recommended Before Production
- SEC-001: Migrate tokens to httpOnly cookies
- SEC-007: Server-side token revocation
- SEC-004: Server-side phone validation
- SEC-006: Reduce JWT expiry + refresh tokens
- SEC-009: Account lockout mechanism
