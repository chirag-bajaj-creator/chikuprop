# Phase 2: Auth Pages & Context — PRODUCT OWNER Output
**Agent:** PRODUCT_OWNER
**Status:** Complete
**Date:** 2026-03-21

---

## Feature Specifications

### Feature 1: Register Page (`/register`) — P0

**User Story:** As a new user (buyer or vendor), I want to create an account by providing my name, email, phone, password, and role, so I can access personalized features.

**Acceptance Criteria:**
1. Page accessible at `/register`
2. Form fields: Full Name, Email, Phone (+91 prefix, 10 digits), Password, Confirm Password, Role (buyer/vendor toggle)
3. Full Name required, 2-50 characters
4. Email required, standard format, shown lowercase
5. Phone validates Indian mobile: exactly 10 digits, starts with 6/7/8/9. +91 prefix stripped
6. Password required, min 6 chars. Strength indicator: weak/medium/strong
7. Confirm Password must match — inline mismatch error before submit
8. Role defaults to "buyer". Can select "vendor". No "admin" option
9. All validation errors inline beneath respective field
10. Submit shows loading spinner, button disabled to prevent double-submit
11. On success: token stored as `chikuprop_token` in localStorage, user in AuthContext, redirect to `/`
12. On API error: error message displayed in visible error banner
13. "Already have an account? Login" link to `/login`
14. If already authenticated, visiting `/register` redirects to `/`

**Scope Notes:**
- No email verification or OTP in Phase 2
- No Google/social login
- Phone optional on backend but validate format if provided
- Role "admin" never selectable (backend enforces)

**Dependencies:** AuthContext (F3), authService (F5)

---

### Feature 2: Login Page (`/login`) — P0

**User Story:** As a returning user, I want to log in with email and password to access my saved properties or manage my listings.

**Acceptance Criteria:**
1. Page accessible at `/login`
2. Form fields: Email, Password
3. Email required, validates format
4. Password required, min 1 character
5. Submit shows loading spinner, button disabled
6. On success: token stored as `chikuprop_token`, user in AuthContext, redirect to `/`
7. On 401: "Invalid email or password" — never reveals if email exists
8. On network error: "Something went wrong. Please try again."
9. "New to ChikuProp? Register" link to `/register`
10. If already authenticated, visiting `/login` redirects to `/`
11. Password show/hide toggle (eye icon)

**Scope Notes:**
- No "Forgot Password" flow — greyed out "Coming soon" placeholder
- No "Remember Me" — JWT already lasts 7 days
- Login API returns full user object including role

**Dependencies:** AuthContext (F3), authService (F5)

---

### Feature 3: AuthContext — P0

**User Story:** As the application, I need centralized auth state so any component can know login status without prop-drilling.

**Acceptance Criteria:**
1. `AuthProvider` wraps app inside `BrowserRouter`
2. Context exposes: `user`, `token`, `loading`, `login()`, `register()`, `logout()`
3. On mount: if `chikuprop_token` exists, call `GET /auth/me` to validate and populate user
4. While `/me` in-flight, `loading` is true — components show loader
5. If `/me` returns 401, clear localStorage silently, set user null
6. `login()` calls POST /auth/login, stores token, sets user. Returns promise
7. `register()` calls POST /auth/signup, stores token, sets user. Returns promise
8. `logout()` removes token, sets user null, redirects to `/`
9. Context never stores password — only _id, name, email, phone, role, avatar
10. `useAuth()` custom hook provides shorthand access

**Scope Notes:**
- File: `client/src/context/AuthContext.jsx`
- No direct API calls in context — calls authService functions
- Token in localStorage as plain string (httpOnly cookie migration in Phase 5+)

**Dependencies:** authService (F5), existing api.js

---

### Feature 4: ProtectedRoute — P0

**User Story:** As the application, I need to prevent unauthenticated users from accessing protected pages.

**Acceptance Criteria:**
1. Component at `client/src/components/auth/ProtectedRoute.jsx`
2. Reads `user` and `loading` from `useAuth()`
3. Loading → renders Loader component
4. No user → `Navigate to="/login" replace` with `state={{ from: location }}`
5. User exists → renders child route (Outlet)
6. Preserves original URL for redirect-back after login
7. Optional `roles` prop — if user role not in array, redirects to `/`

**Scope Notes:**
- In Phase 2, only `/vendor` is protected. More in Phase 3+
- Roles guard is forward-looking but trivial to implement now

**Dependencies:** AuthContext (F3), Loader component (exists)

---

### Feature 5: Auth API Service Layer & Token Interceptor — P0

**User Story:** As a developer, I need dedicated auth service and Axios interceptor for centralized auth API calls.

**Acceptance Criteria:**
1. File `client/src/services/authService.js` with: `loginUser`, `registerUser`, `getCurrentUser`
2. `loginUser` calls POST /auth/login, returns response data
3. `registerUser` calls POST /auth/signup, returns response data
4. `getCurrentUser` calls GET /auth/me, returns response data
5. All use existing API Axios instance from api.js
6. Request interceptor: attach `Authorization: Bearer <token>` from localStorage
7. Response interceptor: handle 401 globally — clear token, redirect to /login (skip for login/signup endpoints)
8. No auth API calls directly from components

**Dependencies:** Existing api.js

---

### Feature 6: Navbar Update — P1

**User Story:** As a user, I want the navbar to reflect my login state.

**Acceptance Criteria:**
1. Logged out: show "Login" button/link to `/login`
2. Logged out: show "Register" button to `/register`
3. Logged in: hide Login and Register
4. Logged in: show user first name + avatar (initial placeholder if no image)
5. Logged in: dropdown with "My Profile (coming soon)" disabled + "Logout"
6. Logout calls `logout()`, clears state, redirects to `/`
7. Vendor role: "List Property" link visible. Buyer: hidden
8. No flash between states on reload (wait for loading to resolve)
9. Mobile responsive dropdown
10. Click-outside closes dropdown

**Dependencies:** AuthContext (F3), ProtectedRoute (F4)

---

## Prioritized Backlog

| Order | Feature | Priority |
|-------|---------|----------|
| 1 | F5: Auth Service Layer & Interceptor | P0 |
| 2 | F3: AuthContext | P0 |
| 3 | F1: Register Page | P0 |
| 4 | F2: Login Page | P0 |
| 5 | F4: ProtectedRoute | P0 |
| 6 | F6: Navbar Update | P1 |

## Dependency Map

```
F5 (Service Layer) → F3 (AuthContext) → F1 (Register) + F2 (Login) + F4 (ProtectedRoute) → F6 (Navbar)
```

## Implementation Notes

- **For Frontend Dev:** Indian phone regex: `/^[6-9]\d{9}$/`. localStorage key: `chikuprop_token`. Backend response shape: `{ success, data: { _id, name, email, phone, role, avatar, token } }`
- **For QA:** Test matrix: buyer reg, vendor reg, duplicate email, invalid phone, weak password, login valid/invalid, token expiry, ProtectedRoute redirect, role access, Navbar transitions, mobile at 375/768/1024px
- **For Security:** localStorage XSS risk accepted for Phase 2. httpOnly cookie migration planned for Phase 5+
