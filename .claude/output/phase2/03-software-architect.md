# Phase 2: Auth Pages & Context — SOFTWARE ARCHITECT Output
**Agent:** SOFTWARE_ARCHITECT
**Status:** Complete
**Date:** 2026-03-21

---

## API Contracts (Backend — Already Exists)

### POST `/api/auth/signup`
**Request:** `{ name, email, password, phone?, role? }`
**Success (201):** `{ success: true, data: { _id, name, email, phone, role, avatar, token } }`
**Errors:** 400 (missing fields, email taken), 500 (server error)

### POST `/api/auth/login`
**Request:** `{ email, password }`
**Success (200):** Same shape as signup
**Errors:** 400 (missing fields), 401 (invalid credentials), 500

### GET `/api/auth/me` (Protected)
**Header:** `Authorization: Bearer <token>`
**Success (200):** `{ success: true, data: { _id, name, email, phone, role, avatar } }` (no token)
**Errors:** 401 (no token, invalid token, user not found)

---

## Data Flow

### App Startup (Rehydration)
```
AuthProvider mounts → check localStorage("chikuprop_token")
  → found → call /auth/me → 200 → set user, loading=false
                            → 401 → clear token, user=null, loading=false
  → not found → loading=false, user remains null
```

### Login/Register Flow
```
Page form → authService.loginUser/registerUser → api.js (Axios) → backend
  → success → AuthContext stores token in localStorage + sets user state
  → failure → error thrown → page catches in try-catch → shows error
```

### Logout Flow
```
AuthContext.logout() → remove token from localStorage → user=null, token=null → navigate("/")
```

### Interceptor Flow
```
Request: attach Bearer token from localStorage to every request
Response 401 (non-auth routes): clear token → hard redirect to /login
```

---

## File Structure

```
client/src/
  services/
    api.js                  ← MODIFY (add interceptors)
    authService.js          ← NEW
  context/
    AuthContext.jsx          ← NEW
  components/
    auth/
      ProtectedRoute.jsx    ← NEW
    common/
      Navbar.jsx            ← MODIFY
  pages/
    LoginPage.jsx + .css    ← NEW
    RegisterPage.jsx + .css ← NEW
  App.jsx                   ← MODIFY
```

---

## AuthContext State & API

```javascript
// State
user:    object | null    // { _id, name, email, phone, role, avatar }
token:   string | null
loading: boolean

// Context value
{ user, token, loading, login, register, logout, isAuthenticated }

// Methods (all use useCallback)
login(email, password)              // async, throws on failure
register({name, email, password, phone, role})  // async, throws on failure
logout()                            // sync, clears state + navigates
```

---

## ProtectedRoute Logic

```
Props: roles? (string[])
loading → <Loader />
!user → <Navigate to="/login" state={{ from: location }} replace />
roles && !roles.includes(user.role) → <Navigate to="/" replace />
else → <Outlet />
```

---

## Implementation Sequence

1. api.js interceptors (foundation)
2. authService.js (API functions)
3. AuthContext.jsx (state management)
4. ProtectedRoute.jsx (route guard)
5. LoginPage.jsx + CSS
6. RegisterPage.jsx + CSS
7. App.jsx route updates
8. Navbar.jsx auth UI

---

## Error Handling Strategy

| Layer | Behavior |
|---|---|
| authService | No catch — lets errors propagate |
| AuthContext login/register | No catch — throws to caller |
| AuthContext mount (checkAuth) | Catches silently — clears invalid token |
| LoginPage/RegisterPage | try-catch — extracts `error.response?.data?.error` or fallback message |
| Axios 401 interceptor | Global safety net — clears token, hard redirects (skips auth endpoints) |

---

## Security Notes

- Token in localStorage (XSS risk accepted for Phase 2, httpOnly cookie in Phase 5+)
- Passwords only in component state while form mounted, never persisted
- confirmPassword never sent to API
- Frontend role checks are UX only — backend must enforce independently
- 401 interceptor skips /auth/login and /auth/signup to prevent redirect loops
- `window.location.href` used in interceptor (outside React tree, ensures clean state reset)

---

## Edge Cases Handled

| Case | Solution |
|---|---|
| Double-submit | loading state disables button |
| Expired token on refresh | /me returns 401, token cleared silently |
| User deleted while session active | /me returns 401, same handling |
| Visit /login when authenticated | Redirect to / immediately |
| Browser back after logout | ProtectedRoute re-evaluates, redirects |
| Multiple tabs | Tab B's next API call triggers 401 interceptor |
| Slow network on mount | loading=true until resolved, Loader shown |
| StrictMode double-mount | cancelled flag in useEffect cleanup |
| Registration with taken email | Backend 400, error shown in form |
| Network failure | !error.response detected, friendly message shown |
