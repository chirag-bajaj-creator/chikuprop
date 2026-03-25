# UX_DESIGNER Output — Phase 3: Vendor Flow (Property Listing)
**Agent:** UX_DESIGNER
**Status:** Complete
**Date:** 2026-03-21

---

## UX Goal Summary

### User Outcomes
- Any visitor can explore the Add Property form without friction (no login wall)
- Users complete property listing quickly with a guided, step-by-step experience
- Returning users manage their listings efficiently from a clear dashboard
- The login-at-submit transition feels seamless — no data loss, no confusion

### Business Outcomes
- Maximize listing conversion by removing upfront login friction
- Increase registered users through the "invest effort first, then sign up" pattern
- Give vendors confidence to list by making the process transparent and guided
- Retain vendors through a functional, clear My Listings dashboard

---

## Primary User Journeys

### Journey 1: First-Time Lister (Not Logged In)
- **User type:** Visitor / unregistered user
- **Primary goal:** List a property on ChikuProp
- **Entry point:** "List Property" button in Navbar OR vendor CTA on Landing page
- **Action path:**
  1. Lands on `/add-property`
  2. Sees welcoming header: "List Your Property for Free"
  3. Fills out multi-step form (5 steps)
  4. Clicks "Post Property" on final step
  5. Sees a brief transition message: "Almost there! Sign in to publish your listing."
  6. Form data saved to localStorage automatically
  7. Redirected to `/login?redirect=/add-property`
  8. Logs in (or registers, then logs in)
  9. Redirected back to `/add-property`
  10. Sees info banner: "Your property details have been restored. Review and submit."
  11. Form is pre-filled from localStorage, user lands on Step 5 (Review)
  12. Clicks "Post Property" again
  13. Property created, redirected to `/my-listings` with success toast
  14. localStorage `pendingProperty` cleared
- **Conversion goal:** Property listed, user registered

### Journey 2: Returning Lister (Logged In)
- **User type:** Logged-in user
- **Primary goal:** List another property
- **Entry point:** "List Property" in Navbar or "List Your First Property" on empty My Listings
- **Action path:**
  1. Lands on `/add-property`
  2. Contact phone and email are pre-filled from profile
  3. Fills out multi-step form
  4. Clicks "Post Property"
  5. Property created, redirected to `/my-listings` with success toast
- **Conversion goal:** Property listed

### Journey 3: Listing Manager
- **User type:** Logged-in user with existing listings
- **Primary goal:** View, edit, pause, or delete listings
- **Entry point:** "My Listings" in user dropdown menu
- **Action path:**
  1. Lands on `/my-listings`
  2. Sees card grid of their listings with status, price, stats
  3. Takes action: Edit / Pause / Delete
- **Conversion goal:** Vendor retained, listings maintained

---

## Page / Feature Structure

### 1. Add Property Page (`/add-property`)

**Decision: Multi-Step Wizard (5 Steps)**

**Justification:** The form has 15+ fields. A single long form is overwhelming on mobile and increases abandonment. A wizard breaks it into digestible chunks, gives a sense of progress, and lets users focus on one category at a time. Each step has 3-4 fields maximum, which is psychologically manageable.

**Step Indicator:** A horizontal progress bar at the top showing all 5 steps with labels. Current step is highlighted with the gradient accent. Completed steps show a checkmark. Users can click on completed steps to navigate back (but not forward past their current progress).

#### Step 1: Basic Details
- **Fields:**
  - Listing Type (Sale / Rent) — large toggle buttons, not a dropdown
  - Property Type (Flat / House / Plot / Commercial) — icon-based selection cards
  - Title (text input, required, max 100 chars)
  - Description (textarea, required, max 1000 chars, with character counter)
- **Why first:** These define everything that follows. Property type determines which fields appear in Step 3.

#### Step 2: Location & Pricing
- **Fields:**
  - Price (number input with INR prefix label, required)
  - City (dropdown of supported cities, required)
  - Area / Locality (text input, required)
  - State (dropdown, required)
  - Pincode (text input, 6 digits, optional)
- **Why second:** Location and price are the next most critical decision factors. Users think about "what" then "where + how much."

#### Step 3: Specifications (Conditional)
- **Fields (shown for flat/house only):**
  - Bedrooms (number selector: 1, 2, 3, 4, 5+)
  - Bathrooms (number selector: 1, 2, 3, 4+)
  - Furnishing (Furnished / Semi-Furnished / Unfurnished) — toggle buttons
- **Fields (shown for all types):**
  - Area in sq.ft. (number input)
  - Amenities (multi-select checkboxes: Parking, Gym, Swimming Pool, Garden, Security, Elevator, Power Backup, Water Supply, Club House, Playground)
- **Conditional logic:** If Property Type is "plot" or "commercial" (selected in Step 1), bedrooms, bathrooms, and furnishing fields are hidden entirely. The step header adjusts: "Property Specifications" vs "Plot Details" vs "Commercial Space Details."
- **Why third:** Specs follow naturally after type and location are established.
- **Edge case:** If property type is "plot" and this step only has 2 fields (area + amenities), the step still appears but is shorter. Do NOT skip it — consistency in the wizard flow matters more than saving one click.

#### Step 4: Photos & Video
- **Fields:**
  - Images (drag-and-drop zone + click-to-browse, max 10, jpg/png/webp, 5MB each)
  - Video (single file upload, mp4 only, max 50MB, optional)
- **Image upload interaction:**
  - Drop zone shows dashed border with "Drag photos here or click to browse" text
  - Each image uploads immediately on selection (not on form submit)
  - Uploading images show a progress bar overlay on their thumbnail
  - Successfully uploaded images appear as thumbnail grid (2 columns on mobile, 4 on desktop)
  - Each thumbnail has an "X" remove button in the top-right corner
  - Counter shows "3/10 photos uploaded"
  - Failed uploads show red border with retry button
  - First uploaded image is marked as "Cover Photo" with a badge; user can click any other image to set it as cover
- **Video upload interaction:**
  - Single file area: "Upload a video walkthrough (optional)"
  - Shows filename + progress bar while uploading
  - After upload: shows filename with remove button
  - No video preview necessary in MVP (saves complexity)
- **Why fourth:** Media is optional and takes effort. Placing it after text fields means users have already invested and are less likely to abandon.

#### Step 5: Contact & Review
- **Fields:**
  - Contact Phone (text input, required, pre-filled from user profile if logged in)
  - Contact Email (email input, required, pre-filled from user profile if logged in)
- **Review section below contact fields:**
  - Summary card showing all entered data organized by step
  - Each section has an "Edit" link that navigates back to that step
  - Images shown as small thumbnail row
- **Submit button:** "Post Property" — full-width, gradient style (btn-primary)
- **Why last:** Contact info is personal. Asking for it last (after investment) increases willingness to share. The review gives confidence before submission.

#### Navigation Between Steps
- "Next" button (right-aligned, btn-primary style) advances to the next step
- "Back" button (left-aligned, btn-secondary style, text-only feel) goes to previous step
- Step 1 has no Back button
- Step 5 has "Post Property" instead of "Next"
- "Next" performs field validation for the current step before advancing
- Validation errors appear inline below each field (matching existing `field-error` pattern)
- Users can click completed step indicators to jump back

#### Login-at-Submit Flow (Detailed)
1. User clicks "Post Property" on Step 5
2. **If logged in:** Form submits via API. On success, redirect to `/my-listings` with toast "Property listed successfully!"
3. **If NOT logged in:**
   a. A brief transition overlay appears (not a modal — a full-section message within the form area):
      - Heading: "One last step — sign in to publish"
      - Subtext: "Your property details are saved. Sign in or create an account to publish your listing."
      - Two buttons: "Sign In" (btn-primary) | "Create Account" (btn-secondary)
      - Small reassurance text below: "Your listing details will be waiting for you after sign-in."
   b. All form data is serialized to `localStorage` under key `pendingProperty`, including uploaded image/video URLs (since they are already on Cloudinary)
   c. The current step number (5) is also saved so user returns to the review step
   d. Clicking "Sign In" navigates to `/login?redirect=/add-property`
   e. Clicking "Create Account" navigates to `/register?redirect=/add-property`
4. **After login/register, returning to `/add-property`:**
   a. Page checks localStorage for `pendingProperty`
   b. If found: Form is pre-filled with all saved data
   c. An info banner appears at the top: "Your property details have been restored. Review and submit."
   d. User is placed on Step 5 (Review) so they can verify and submit
   e. Contact phone/email are updated from user profile if they were empty
   f. User clicks "Post Property" — this time it submits successfully
   g. On success: `pendingProperty` cleared from localStorage, redirect to `/my-listings`

#### Page Header
- Background: `var(--gradient-subtle)` (matching LoginPage background)
- Title: "List Your Property"
- Subtitle: "Reach thousands of buyers and tenants across India — for free"
- Below subtitle: step progress indicator

---

### 2. My Listings Dashboard (`/my-listings`)

**Auth Required:** Yes. Unauthenticated users redirected to `/login?redirect=/my-listings`.

**Layout Decision: Card Grid (not table)**

**Justification:** Cards match the existing PropertyCard pattern on BuyPage. Tables are harder to make responsive and feel administrative rather than consumer-friendly.

#### Page Sections (in order)

**Section 1: Page Header**
- Title: "My Listings"
- Subtitle showing count: "You have 3 active listings"
- "List New Property" button (btn-primary, right-aligned on desktop, full-width on mobile)

**Section 2: Stats Summary Bar**
- Horizontal row of 3 stat cards:
  - Total Listings (count)
  - Total Views (sum of viewCount across all listings)
  - Total Contact Unlocks (sum of contactUnlockCount)
- Style: small cards with icon + number + label, background `var(--secondary)`
- On mobile: horizontal scroll or 3-column compact grid

**Section 3: Listing Cards Grid**
- 2 columns on desktop, 1 column on mobile
- Sort: newest first (by createdAt)

**Each Listing Card shows:**
- **Left/Top:** First image as thumbnail (or placeholder gradient if no images)
- **Right/Body:**
  - Title (truncated to 1 line)
  - Price (formatted in Indian format: 25,00,000 or 25 Lac)
  - Location: "Area, City"
  - Property type + listing type badge: "Flat for Sale" / "House for Rent"
  - Status badge: "Active" (green) or "Paused" (amber)
  - Stats row: "Views: 42 | Contacts: 5"
  - Date: "Listed on 15 Mar 2026"
- **Action buttons (bottom of card):**
  - "Edit" — btn-secondary style, navigates to `/edit-property/:id`
  - "Pause" / "Activate" — toggle button, outline style
  - "Delete" — text button, red color (`var(--error)`), no background

**Empty State (no listings):**
- Centered content, CSS-only house illustration
- Heading: "You haven't listed any properties yet"
- Subtext: "It only takes a few minutes to list your first property."
- CTA: "List Your First Property" (btn-primary, links to `/add-property`)

**Loading State:** Skeleton cards (3 placeholder cards with pulsing animation)
**Error State:** Reuse existing ErrorState component with retry button

---

### 3. Edit Property Page (`/edit-property/:id`)

**Auth Required:** Yes. Must verify ownership on both frontend and backend.

**How it differs from Add Property:**
- Same multi-step wizard layout and field structure
- Page title: "Edit Property" instead of "List Your Property"
- All fields pre-filled from fetched property data
- Images section shows existing uploaded images (removable + can add more up to 10)
- No login-at-submit flow needed (user is already authenticated)
- Submit button text: "Save Changes" instead of "Post Property"
- "Cancel" link navigates back to `/my-listings` with unsaved-changes confirmation
- Status field is NOT editable here (separate toggle on dashboard)
- On success: redirect to `/my-listings` with toast "Property updated successfully"

**Pre-fill behavior:**
- On mount, fetch property by ID via API. Show Loader while fetching.
- If not found or not owner: show error with link back to My Listings
- All steps unlocked since data exists for all fields

---

### 4. Navigation Updates

#### Navbar Changes
- Update "List Property" link from `/vendor` to `/add-property`
- Add subtle visual differentiation: use `var(--accent)` color for "List Property" text
- Add "My Listings" to user dropdown (below "My Profile", active/clickable)

#### Mobile Navigation
- Floating action button (FAB) on mobile: bottom-right, 56px circular, gradient background, "+" icon
- Navigates to `/add-property`, hidden when already on that page
- Only visible at max-width: 768px

#### Cross-page Navigation Map
| From | To | Trigger |
|---|---|---|
| Any page (Navbar) | /add-property | "List Property" link |
| Landing page CTA | /add-property | "List Your Property" button |
| /add-property (not logged in) | /login?redirect=/add-property | "Sign In" button |
| /add-property (not logged in) | /register?redirect=/add-property | "Create Account" button |
| /login (after auth) | /add-property | redirect param |
| /add-property (logged in) | /my-listings | Auto-redirect on success |
| User dropdown | /my-listings | "My Listings" link |
| /my-listings | /add-property | "List New Property" button |
| /my-listings | /edit-property/:id | "Edit" button on card |
| /edit-property/:id | /my-listings | Save or Cancel |

---

### 5. Delete Confirmation Flow

**Design: Modal overlay**

**Modal structure:**
- Backdrop: semi-transparent dark overlay
- Modal card: centered, max-width 400px, white, `var(--radius-modal)`, `var(--shadow-card-hover)`
- Warning icon: red-tinted circle with exclamation mark (CSS-only)
- Heading: "Delete Property?"
- Property title shown for clarity
- Warning text: "This action cannot be undone. Your listing will be permanently removed."
- Buttons: "Cancel" (btn-secondary) | "Delete" (red background)
- While deleting: spinner on Delete button
- Close via backdrop click or Escape key
- After success: card removed with fade-out, toast "Property deleted successfully"
- On error: message inside modal

---

## Navigation / Flow Logic

### Entry Points
- Homepage vendor CTA and Navbar link
- Mobile floating action button
- My Listings "List New Property" button and empty state CTA
- Direct URL `/add-property` (publicly accessible)

### Exit Points
- After listing/edit: redirect to `/my-listings`
- Cancel edit: back to `/my-listings`
- Abandon form: browser back (no draft saving in MVP)

### Primary Conversion Funnel
```
Navbar/Landing CTA -> /add-property -> Fill 5 steps -> Post Property
  -> (if not logged in) -> Save to localStorage -> /login -> /add-property (restored) -> Post Property
  -> (if logged in) -> API submit -> /my-listings (success toast)
```

---

## Information Architecture Notes

### Content Grouping (Add Property Form)
Fields grouped by cognitive category:
1. **Identity** — What is this property? (type, title, description)
2. **Value & Place** — Cost and location (price, city, area, state, pincode)
3. **Details** — Features (rooms, area, amenities)
4. **Proof** — Visual evidence (photos, video)
5. **Contact** — Seller info (phone, email) + final review

### Priority of Information (My Listings Cards)
1. Visual identity (thumbnail)
2. Title + price
3. Status badge
4. Performance metrics (views, contacts)
5. Actions (edit, pause, delete)

---

## Trust / Clarity Recommendations

### Trust-Building Elements
1. **"Free" messaging** — Reinforce in header and CTA. Indian users are price-sensitive.
2. **Progress indicator** — Reduces anxiety about form length.
3. **Data preservation promise** — "Your listing details will be waiting for you after sign-in."
4. **Review step** — Builds confidence before submission.
5. **Immediate feedback** — Upload progress, validation, toast notifications.

### Friction Points to Remove
1. No login wall (already decided)
2. Minimal required fields (pincode, amenities, video, images are optional)
3. Pre-fill contact info from profile for logged-in users
4. Listing type defaults to "Sale" (most common in Indian market)

### Drop-Off Risk Points
1. **Step 4 (Media)** — Users may not have photos ready. Show: "You can add photos later by editing your listing."
2. **Login redirect** — "One last step" framing positions login as natural, not an interruption.
3. **Delete** — Modal with property title prevents accidental deletion.

---

## Mobile UX Considerations

- All inputs: minimum 44px touch target height
- Step indicator: numbers-only on mobile, labels on desktop
- Form fields: single-column on all viewports
- Image thumbnails: 2-column grid on mobile
- Next/Back buttons: full-width on mobile, stacked vertically
- Property type selection: large tappable cards, not radio buttons
- Bedroom/bathroom: tappable number buttons in a row
- Amenities: full-row tap areas
- Image drop zone text: "Tap to add photos" on mobile
- "Post Property" sticky at bottom on mobile Step 5
- Delete modal buttons: stack vertically on mobile

---

## Accessibility Notes

- All inputs have `<label>` with `htmlFor`
- Errors linked via `aria-describedby`
- Step indicators: `aria-current="step"`
- Modal: `role="dialog"`, `aria-modal="true"`, focus trap, focus return
- No auto-advance steps
- Keyboard-navigable throughout
- WCAG AA contrast ratios
- Error messages use color AND text
- Focus-visible outlines on all interactive elements

---

## Risks / UX Gaps

### Critical Dependencies
1. **LoginPage and RegisterPage must support `?redirect=` query param.** Currently only read from `location.state`. This is blocking.
2. **Toast notification system needed.** None exists in the codebase. Recommend simple ToastContext + ToastContainer.

### Assumptions
1. Cloudinary uploads happen per-image immediately (orphan cleanup out of scope)
2. localStorage is reliable for same-browser/device continuity
3. Indian price formatting handled by a utility function
4. Amenities list is hardcoded for MVP

### Areas Requiring Testing
1. Login redirect round-trip (localStorage save/restore edge cases)
2. Image upload on slow Indian mobile networks (3G/4G)
3. Form wizard on 320px-wide devices

---

## Recommended Next Agents
1. **SOFTWARE_ARCHITECT** — API contracts, data flow, component architecture, state management
2. **SEO_CONTENT_STRATEGIST** — Page titles, meta descriptions, structured data
3. **CONVERSION_GROWTH_STRATEGIST** — Login-at-submit messaging, CTA copy, funnel optimization

---

## Notes for Next Agent

### For SOFTWARE_ARCHITECT
1. LoginPage and RegisterPage need `?redirect=` query param support (blocking prerequisite).
2. localStorage key: `pendingProperty`. Store full form state as JSON including step number and media URLs.
3. Add Property and Edit Property should share a `PropertyForm` component.
4. Image uploads happen independently of form submission (Cloudinary URLs stored in form state).
5. Build a simple toast notification system (ToastContext + ToastContainer, auto-dismiss 4s).

### For FRONTEND_DEVELOPER
1. All API calls go through `propertyService.js`, not directly in components.
2. Reuse Loader, ErrorState, form-group pattern from existing pages.
3. Wizard form state: single `useState` object for easy localStorage serialization.
4. Conditional fields: simple check on `formData.propertyType` in Step 3 render.
5. Test the full login redirect round-trip end-to-end — highest-risk interaction in this phase.