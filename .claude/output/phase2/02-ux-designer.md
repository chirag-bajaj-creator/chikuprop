# Phase 2: Auth Pages & Context — UX DESIGNER Output
**Agent:** UX_DESIGNER
**Status:** Complete
**Date:** 2026-03-21

---

## Design System Tokens (from existing index.css)

| Token | Value |
|---|---|
| Font | Inter, weights 400/500/600/700/800 |
| Primary | #9333EA |
| Primary Dark | #6B21A8 |
| Accent | #EC4899 |
| Error | #EF4444 |
| Success | #10B981 |
| Warning | #F59E0B |
| Neutral Dark | #1E1B2E |
| Neutral Medium | #64617B |
| Neutral Light | #F0EDF5 |
| Gradient Button | linear-gradient(135deg, #9333EA 0%, #EC4899 100%) |
| Gradient Subtle | linear-gradient(135deg, #F5F0FF 0%, #FDF2F8 100%) |
| Radius Input | 8px |
| Radius Card | 14px |
| Shadow Card | 0 1px 4px rgba(107,33,168,0.06), 0 2px 12px rgba(107,33,168,0.04) |

---

## Register Page (`/register`)

### Layout
- Full-viewport centered layout, subtle gradient background
- White card: 480px max-width, 40px 36px padding, 14px radius, card shadow
- Mobile: card goes full-width, no shadow

### Card Contents (top to bottom)
1. **Logo** — "ChikuProp" (Chiku in dark, Prop in gradient text), 28px
2. **Heading** — "Create your account", 22px/700
3. **Subheading** — "Join thousands finding their dream property", 14px/400
4. **Role Selector** — Two-button segmented toggle, 50/50 width. Active = gradient bg. Labels: "I want to buy/rent" | "I want to list/sell"
5. **Form Fields** (16px gap):
   - Full Name (text input)
   - Email (email input)
   - Phone (+91 fixed prefix box | 10-digit input)
   - Password (input + eye toggle + strength bar below: red Weak → amber Fair → purple Good → green Strong)
   - Confirm Password (input + eye toggle, no strength bar)
6. **Submit Button** — Full width, gradient, "CREATE ACCOUNT" / "Creating account..." with spinner
7. **Auth Link** — "Already have an account? Login"

### Input Styling
- Label: 13px/600/uppercase, letter-spacing 0.5px
- Input: 12px 14px padding, 2px neutral-light border, 8px radius
- Focus: purple border + 3px purple shadow ring
- Error: red border + 3px red shadow ring + 12px error text below

### Validation
- All fields validate on blur
- Errors clear when user starts typing
- Phone: 10 digits, numeric only
- Password: min 6 chars, strength updates on keystroke
- Confirm: matches password (validates on blur + on password change)

### Responsive
- Mobile (375px): full-width card, no shadow, strength label below bar
- Tablet (768px): 480px centered card with shadow
- Desktop (1024px+): centered card, min-height calc(100vh - 70px)

---

## Login Page (`/login`)

### Layout
Same AuthFormCard wrapper as Register.

### Card Contents
1. **Logo** — same as Register
2. **Heading** — "Welcome back", 22px/700
3. **Subheading** — "Sign in to continue your property search", 14px/400
4. **Error Banner** (conditional) — light red bg, 4px solid red left border, 14px error text. Slides in 200ms.
5. **Email** field
6. **Password** field (with eye toggle, no strength bar)
7. **Forgot Password** — right-aligned, greyed out span: "Forgot password? (Coming soon)", 13px, 0.5 opacity, not clickable
8. **Submit Button** — "SIGN IN" / "Signing in..." with spinner
9. **Auth Link** — "New to ChikuProp? Register"

### Responsive
Identical to Register page behavior.

---

## Navbar Update

### Logged-Out State
- "Login" — text link style, 15px/600/uppercase, neutral-medium, hover: primary
- "Register" — gradient button (btn-primary), 13px, 8px 20px padding
- 16px gap between them
- "List Property" nav link hidden

### Logged-In State
- User name (first name only) + avatar circle (38px, gradient bg, white initial, 15px/700)
- Click avatar → dropdown (220px, 14px radius, card shadow):
  - User info header (name 14px/700, email 12px/medium, with divider below)
  - "My Profile (Coming soon)" — disabled, 0.5 opacity
  - Divider
  - "Logout" — red text, light red hover bg
- "List Property" visible for vendor/admin, hidden for buyer
- Click-outside closes dropdown

### No Flash Strategy
- While auth loading: show invisible placeholder (48px width) in navbar-actions
- Once resolved: render correct state

### Mobile
- Logged out: show Register button only (hide Login text)
- Logged in: show avatar only (hide first name), dropdown anchored right

---

## ProtectedRoute

- Loading → existing Loader component, full viewport height, centered
- Not authenticated → invisible, immediate redirect
- Authenticated → transparent wrapper, renders children

---

## New Components

| Component | Location |
|---|---|
| AuthFormCard | components/auth/ — white card wrapper with logo, heading, subheading |
| FormField | components/auth/ — label + input + error |
| PhoneInput | components/auth/ — +91 prefix composite |
| PasswordField | components/auth/ — input + eye toggle + optional strength |
| PasswordStrengthBar | components/auth/ — colored bar + label |
| RoleSelector | components/auth/ — segmented toggle |
| SubmitButton | components/auth/ — gradient + loading spinner |
| ErrorBanner | components/auth/ — left-accent error banner |
| UserMenu | components/common/ — avatar + dropdown |
| ProtectedRoute | components/auth/ — route guard |

---

## Accessibility
- All inputs have `<label>` with `htmlFor`
- Role selector: `role="radiogroup"` with `aria-checked`
- Password toggle: `aria-label="Show/Hide password"`
- Error messages: `role="alert"`, linked via `aria-describedby`
- Strength bar: `aria-live="polite"`
- Dropdown: `aria-haspopup="true"`, `aria-expanded`, keyboard nav (Enter/Space/Escape/Arrows)
- Min tap target: 44x44px
- Color never sole indicator — always paired with text
