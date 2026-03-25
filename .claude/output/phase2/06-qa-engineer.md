# Phase 2: Auth Pages & Context — QA ENGINEER Output
**Agent:** QA_ENGINEER
**Status:** Complete
**Date:** 2026-03-21
**Total Test Cases:** 72

---

## Pre-Test Observations

| ID | Issue | Severity |
|----|-------|----------|
| OBS-1 | Login network error fallback says "Login failed. Please try again." — AC requires "Something went wrong" | Minor |
| OBS-2 | Register fallback says "Registration failed. Please try again." — not matching specific AC text | Minor |
| OBS-4 | Password strength bar uses inline styles — violates frontend rules | Code quality |
| OBS-8 | Global 401 interceptor uses `window.location.href` (full page reload) instead of React Router navigation | Design choice |

---

## Test Cases Summary

### Login Page (18 tests)
- L-01 to L-11: Core flow (render, validate, submit, token storage, context, redirect, redirect-back)
- L-12 to L-13: Error handling (401 message, network error)
- L-14: Error clears on input change
- L-15: Register link navigation
- L-16: Already-authenticated redirect
- L-17 to L-18: Double-submit prevention, loading state reset

### Register Page (35 tests)
- R-01 to R-04: Render, fields present, role toggle default/switch
- R-05 to R-13: Field validations (name, email, phone Indian format 6-9 start)
- R-14: +91 prefix display
- R-15 to R-21: Password validation + strength indicator (Weak/Fair/Good/Strong)
- R-22 to R-23: Confirm password match/mismatch
- R-24 to R-26: Show/hide toggle, error clearing, loading spinner
- R-27 to R-29: Success flow (token, context, redirect)
- R-30 to R-35: Server/network errors, login link, authenticated redirect, multiple errors

### AuthContext (8 tests)
- AC-01 to AC-03: Rehydration (valid/invalid/no token)
- AC-04 to AC-06: login/register/logout state updates
- AC-07: StrictMode cleanup (cancelled flag)
- AC-08: useAuth outside AuthProvider throws error

### ProtectedRoute (7 tests)
- PR-01: Loader while loading
- PR-02: Redirect to /login if no user
- PR-03: Preserves original URL in state
- PR-04 to PR-06: Role access (vendor OK, admin OK, buyer denied)
- PR-07: No roles prop allows any authenticated user

### Navbar (14 tests)
- N-01 to N-02: Logged out/in states
- N-03 to N-05: Dropdown open/close/route-change
- N-06: My Profile disabled
- N-07: Logout works
- N-08 to N-10: List Property visibility by role (vendor/admin/buyer)
- N-11: No flash on reload
- N-12 to N-14: Active link, avatar initial, first name only

### API Layer & Routing (7 tests)
- API-01 to API-02: Bearer token attachment/absence
- API-03 to API-05: 401 interceptor (non-auth triggers, auth routes excluded)
- API-06 to API-07: Routes exist, AuthProvider wraps all

---

## Edge Cases (15 tests)

| ID | Case | Expected |
|----|------|----------|
| E-01 | Double-click submit | Only 1 API request (button disabled) |
| E-02 | Token deleted in another tab | Next API call triggers 401 → redirect |
| E-03 | Malformed token in localStorage | /me fails, token cleared silently |
| E-04 | Email with leading/trailing spaces | Not trimmed before submit — potential issue |
| E-05 | Paste 11+ digits in phone | maxLength=10 truncates; regex catches overflow |
| E-06 | Letters typed in phone field | Caught at submit by regex, not prevented on input |
| E-07 | Password of only spaces | Passes length check, scores Weak. No explicit rejection |
| E-08 | XSS in name field | React escapes in JSX. Verify backend sanitizes too |
| E-09 | Very long name/email (500+ chars) | No maxLength on inputs. Backend must enforce |
| E-10 | Back button after login | Stays on / (replace: true used) |
| E-11 | Back button after register | Same as E-10 |
| E-12 | Concurrent login and rehydration | Race condition possible, low likelihood |
| E-13 | localStorage disabled/full | No try-catch around localStorage — app could crash |
| E-14 | Register with role "admin" via API | Backend must reject |
| E-15 | Keyboard accessibility for dropdown | No onKeyDown handlers — a11y gap |

---

## Responsive Tests (6 tests)

| ID | Viewport | Test |
|----|----------|------|
| RES-01 | 768px | Navbar links hidden |
| RES-02 | 768px | Username hidden, avatar only |
| RES-03 | 768px | Register button hidden for logged-out |
| RES-04 | 480px | Login card padding reduces |
| RES-05 | 480px | Register card padding reduces, role font smaller |
| RES-06 | 360px | Dropdown doesn't overflow viewport |

---

## Device/Browser Matrix

| Browser | Priority |
|---------|----------|
| Chrome Latest | P0 |
| Firefox Latest | P0 |
| Safari Latest | P1 |
| Edge Latest | P1 |
| Samsung Internet | P2 |

| Viewport | Priority |
|----------|----------|
| Desktop 1920x1080 | P0 |
| Laptop 1366x768 | P1 |
| Tablet 768px | P1 |
| Mobile 480px | P0 |
| Mobile 360px | P1 |

---

## Sign-off Criteria

### Must-Pass (P0 Blockers)
- All Login tests L-01 to L-12, L-16
- All Register validations R-01 to R-13, R-17 to R-23, R-27 to R-29
- AuthContext AC-01 to AC-06
- ProtectedRoute PR-01 to PR-06
- Navbar N-01 to N-11
- API tests API-01 to API-05
- Back button E-10, E-11

### Should-Pass (P1)
- L-13: Network error message (needs code fix per OBS-1)
- R-30, R-31: Server/network errors on register
- All responsive RES-01 to RES-06
- E-04: Email trimming
- E-13: localStorage error handling

### Nice-to-Pass (P2)
- E-06: Phone non-numeric prevention
- E-07: Spaces-only password rejection
- E-09: maxLength on name/email
- E-15: Keyboard accessibility for dropdown

---

## Known Issues to Track
1. Network error fallback text mismatch (OBS-1) — needs code change
2. Inline styles on strength bar (OBS-4) — code quality
3. No localStorage try-catch (E-13) — crash risk if disabled
4. Global 401 uses window.location.href (OBS-8) — destroys React state
5. No phone input filter (E-06) — letters typeable
6. No mobile hamburger menu (RES-01) — Buy/Rent links unreachable on mobile
