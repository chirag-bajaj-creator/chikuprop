Got it. **That is the correct approach.**

You do **not** want me to dump a giant technical blueprint right now.
You want me to **explain the whole product clearly**, so **you can make the actual implementation plan yourself with Claude Code**.

That means my job now is:

* **clarify the product architecture**
* **explain what exactly exists in the app**
* **tell you what modules/pages/features are actually needed**
* **give you a clean system map**
* **so you can translate it into Claude Code prompts / implementation plan**

✅ That is the right move.

---

# What You Actually Have Built (Conceptually)

Your app is a:

# **Role-Based Real Estate Lead Generation Platform**

Not just a property listing website.

It has **3 main actors**:

* **Purchaser** → people who want to buy
* **Tenant** → people who want to rent
* **Vendor** → people who post properties

And the website’s main purpose is:

1. Vendor posts property
2. Purchaser/Tenant searches and views property
3. They open property details
4. Contact is hidden at first
5. After login, contact is revealed
6. System records that lead
7. Vendor sees that someone contacted

That is the **core engine** of the product.

---

# 1. The Product in One Line

If you want the **clearest definition**, use this:

> **A role-based real estate marketplace where Vendors list properties (free or paid), Purchasers and Tenants discover them, unlock contact details after login, and the platform tracks leads for Vendors.**

That’s the full product in one line.

---

# 2. The Website is Divided into 5 Big Parts

Instead of thinking page by page first, think in **5 major blocks**.

---

## PART 1 — Public Discovery Area

This is what normal visitors see before login.

This includes:

* Landing page
* Purchaser property listing page
* Tenant property listing page
* Property detail page
* Vendor intro page
* Wanted properties page
* Services page

### Purpose:

This area helps users:

* discover properties
* search/filter
* open details
* understand vendor listing options

---

## PART 2 — Authentication + Role System

This is where the user becomes a real account.

Includes:

* Login
* Register
* Role assignment

Roles:

* Purchaser
* Tenant
* Vendor

### Purpose:

This part is required because:

* contact details should not be fully visible without login
* dashboards should be separated
* Vendor should not see Purchaser dashboard
* Purchaser should not access Vendor dashboard

This is your **RBAC layer**.

---

## PART 3 — Vendor Listing System

This is the “seller side” of the platform.

Includes:

* Vendor intro page
* Post Property page
* Free vs Paid listing
* My Listings
* Edit listing
* Listing status (active/paused/expired)

### Purpose:

This is how properties enter the system.

This is the **supply side** of the marketplace.

---

## PART 4 — Property Interaction / Lead Generation

This is the **most important part** of the app.

Flow:

* Purchaser/Tenant opens listing
* clicks property card
* property detail page opens
* sees masked phone/email
* clicks reveal/contact
* login required
* after login → same property page
* full contact shown
* lead recorded
* vendor gets notified

### Purpose:

This is where the website creates value.

Without this, it’s just a property catalog.

This is the **core business logic**.

---

## PART 5 — Role-Based Dashboards

Once users interact, each role gets its own private area.

### Vendor dashboard

* total listings
* views
* leads
* contact unlocks
* my listings
* lead management

### Purchaser dashboard

* saved properties
* recently viewed
* contacted properties

### Tenant dashboard

* saved rentals
* recently viewed rentals
* contacted rentals

### Purpose:

This gives continuity after discovery and keeps the system professional.

---

# 3. The Core User Journeys (This Is What Matters Most)

Forget code for a second.
Your whole app is really just **3 main journeys**.

---

# Journey A — Vendor Journey

This is the Vendor flow.

### Steps:

1. Vendor visits website
2. Opens **Vendor** page
3. Understands free vs paid listing
4. Clicks **Post Property**
5. Logs in / registers as Vendor (if not logged in)
6. Fills property form
7. Chooses:

   * Free listing
   * Paid listing
8. Uploads images/video
9. Submits property
10. Property becomes visible in:

* Purchaser page (if sale)
* Tenant page (if rental)

11. Later Vendor sees leads in dashboard

### This means:

Vendor side requires:

* Vendor page
* Post property page
* Vendor dashboard
* My listings page
* Leads page

---

# Journey B — Purchaser Journey

This is for buying.

### Steps:

1. Purchaser lands on homepage
2. Searches city + property type + buy
3. Goes to **Purchaser listing page**
4. Applies filters
5. Opens a property
6. Lands on **Property detail page**
7. Sees masked contact
8. Clicks reveal/contact
9. If not logged in → login
10. Returns to same property page
11. Full contact visible
12. System logs lead
13. Purchaser may save property / revisit later

### This means:

Purchaser side needs:

* Purchaser listing page
* Property detail page
* Login/Register
* Purchaser dashboard

---

# Journey C — Tenant Journey

This is for renting.

### Steps:

1. Tenant lands on homepage
2. Searches city + property type + rent
3. Goes to **Tenant listing page**
4. Applies rental filters
5. Opens a property
6. Lands on **Property detail page**
7. Sees masked contact
8. Clicks reveal/contact
9. If not logged in → login
10. Returns to same property page
11. Full contact visible
12. Lead recorded
13. Tenant may save property / revisit later

### This means:

Tenant side needs:

* Tenant listing page
* Property detail page
* Login/Register
* Tenant dashboard

---

# 4. The Single Most Important Logic in the Whole App

If Claude Code builds only one thing correctly, it must be this:

# **Contact Unlock Logic**

Because this is the **main business event**.

---

## Before login

On property detail page:

Show:

* masked phone: `98XXXXXX45`
* masked email: `ab****@gmail.com`

Buttons:

* Login to View Contact
* Contact Vendor

---

## After login

When Purchaser/Tenant logs in and returns:

Show:

* full phone
* full email
* call button
* WhatsApp button

---

## At the same moment (backend must do this)

Create a **lead record**:

* which property was opened
* which vendor owns it
* which user unlocked contact
* whether that user is Purchaser or Tenant
* date/time
* event type = contact unlock

This is the **heart of the app**.

---

# 5. The Product is NOT a Full Transaction Platform

This is important.

You already understood this correctly.

After the user gets the phone number:

* they call outside the app
* WhatsApp outside the app
* site visit outside the app
* negotiation outside the app

So your platform is:

## **A discovery + lead generation platform**

NOT

## **An end-to-end real estate transaction platform**

This simplifies the whole architecture.

---

# 6. What Pages Actually Exist (Final Clean Structure)

Now I’ll explain the final page structure in a way you can convert into Claude prompts.

---

## PUBLIC PAGES

These pages are accessible without login.

### 1. Landing Page

Purpose:

* introduce product
* search properties
* show featured items
* show cities/services/wanted properties

---

### 2. Purchaser Listing Page

Purpose:

* show all sale properties
* search/filter/sort
* open property cards

---

### 3. Tenant Listing Page

Purpose:

* show all rental properties
* rental filters
* open property cards

---

### 4. Property Detail Page

Purpose:

* full property details
* media
* vendor info
* masked contact
* unlock contact flow

---

### 5. Vendor Page

Purpose:

* explain why Vendors should list
* free vs paid listing
* CTA to post property

---

### 6. Wanted Properties Page

Purpose:

* show buyer/rental requirements
* users can post what they are looking for

---

### 7. Services Page

Purpose:

* show shifting, loan, legal, interior, etc.

---

## AUTH PAGES

### 8. Login Page

Purpose:

* authenticate user before contact unlock or dashboard access

### 9. Register Page

Purpose:

* create account as Purchaser / Tenant / Vendor

---

## VENDOR PAGES

### 10. Post Property Page

Purpose:

* create listing
* choose free/paid
* upload media
* submit property

---

### 11. Vendor Dashboard

Purpose:

* summary of listings, views, leads

---

### 12. Vendor My Listings

Purpose:

* manage all posted properties

---

### 13. Vendor Leads Page

Purpose:

* see who unlocked contact for which property

---

## PURCHASER PAGES

### 14. Purchaser Dashboard

Purpose:

* saved properties
* contacted properties
* recently viewed

---

## TENANT PAGES

### 15. Tenant Dashboard

Purpose:

* saved rentals
* contacted rentals
* recently viewed rentals

---

## SHARED USER PAGES

### 16. Profile Page

Purpose:

* update account details

### 17. Notifications Page

Purpose:

* alerts for leads / updates / saved properties

---

# 7. The App Has 3 Kinds of Data

This is how you should think before Claude Code.

---

## Data Type 1 — Users

Users are accounts.

A user can be:

* Purchaser
* Tenant
* Vendor

They need:

* name
* phone
* email
* password
* role

---

## Data Type 2 — Properties

Properties are the core listings.

They need:

* vendor owner
* sale or rent
* property type
* price
* location
* media
* amenities
* contact info
* listing type (free/paid)

---

## Data Type 3 — Interactions

These are actions users perform.

Examples:

* saved property
* recently viewed
* contact unlocked
* wanted property posted
* feedback submitted

This is what makes the platform “smart”.

---

# 8. The Real Backend is Just 6 Core Systems

When you ask Claude Code, think in **backend systems**, not random APIs.

---

## System 1 — Auth System

Handles:

* register
* login
* JWT
* role storage
* password hashing

---

## System 2 — Property System

Handles:

* create property
* edit property
* delete property
* fetch property list
* fetch property detail
* search/filter/sort

---

## System 3 — Lead System

Handles:

* unlock contact
* create lead record
* increment contact count
* vendor notifications

---

## System 4 — User Activity System

Handles:

* recently viewed
* favorites/saved properties
* contacted properties history

---

## System 5 — Vendor Management System

Handles:

* my listings
* listing stats
* lead dashboard
* free/paid listing status

---

## System 6 — Extra Marketplace System

Handles:

* wanted properties
* services
* feedback (optional)

---

# 9. The Frontend is Really Just 4 UI Zones

To simplify your planning:

---

## Zone 1 — Discovery UI

* landing
* purchaser page
* tenant page
* cards
* filters
* search

---

## Zone 2 — Conversion UI

* property detail
* masked contact
* login modal/page
* unlock contact

---

## Zone 3 — Vendor UI

* vendor page
* post property
* listings
* leads

---

## Zone 4 — Dashboard UI

* purchaser dashboard
* tenant dashboard
* vendor dashboard
* profile
* notifications

---

# 10. The Most Important Pages for Claude Code First

If you want Claude Code to build in the right order, **do not start with everything**.

First ask it to build **these in sequence**:

---

## Phase 1 — Core Public Flow

1. Landing page
2. Purchaser listing page
3. Tenant listing page
4. Reusable property card
5. Property detail page

---

## Phase 2 — Auth

6. Register page
7. Login page
8. JWT auth
9. Role-based route protection

---

## Phase 3 — Vendor Flow

10. Vendor page
11. Post property page
12. Save property to DB
13. Show properties on listing pages

---

## Phase 4 — Lead Flow

14. Masked contact on property page
15. Unlock contact API
16. Lead creation
17. Vendor dashboard lead count
18. Vendor leads page

---

## Phase 5 — Dashboards

19. Vendor dashboard
20. Purchaser dashboard
21. Tenant dashboard

---

## Phase 6 — Extra Pages

22. Wanted properties
23. Services
24. Profile / notifications

---

# 11. What You Should Tell Claude Code (Important)

You should not ask Claude Code:

❌ “Build my real estate app”

That is too vague.

Instead, ask in **modules**.

---

## Good prompt style:

* “Build the landing page and reusable property card first.”
* “Now build purchaser listing page with filters and property cards.”
* “Now build property detail page with masked contact details.”
* “Now implement JWT auth with role-based access.”
* “Now implement vendor post property flow.”
* “Now implement contact unlock API that creates a lead.”
* “Now build vendor dashboard showing leads and listing stats.”

That is the correct way.

---

# 12. Your Best Mental Model (Most Important)

If you remember only one thing, remember this:

# Your app has only 3 major engines:

### Engine 1 — Property Supply

Vendor posts property

### Engine 2 — Property Discovery

Purchaser/Tenant finds and opens property

### Engine 3 — Lead Conversion

User unlocks contact → Vendor gets lead

That’s it.

Everything else is support around these 3 engines.

---

# 13. My Honest Recommendation for You

Since you want to use **Claude Code** for the implementation plan:

## I should help you in this exact way next:

### I can give you:

1. **A perfect master prompt for Claude Code**
2. **Then break it into phase-by-phase prompts**
3. **Then give you folder structure + API contract prompts**
4. **Then give you database schema prompts**
5. **Then deployment prompts**

That would be the **best possible next step** for your workflow.

---

# 14. Best Next Step (What You Actually Need From Me)

The most useful thing for you now is:

## 👉 A **Claude Code Master Prompt**

that explains:

* product scope
* pages
* roles
* backend modules
* database models
* RBAC
* lead unlock flow
* deployment stack

So Claude can generate the project correctly.

---

# Final Simple Summary

## What you currently have:

### Product type:

* Role-based real estate lead generation platform

### Roles:

* Purchaser
* Tenant
* Vendor

### Core flows:

* Vendor posts property
* Purchaser/Tenant finds property
* Opens property details
* Contact hidden until login
* After login contact unlocks
* Lead created
* Vendor sees lead

### Major areas:

* Public discovery pages
* Auth + RBAC
* Vendor listing system
* Property interaction / lead system
* Role-based dashboards

---

# Best Next Message You Should Send Me

Reply with:

# **“Give me the Claude Code master prompt for the full project”**

And I will give you:

* **one strong master prompt**
* **clean architecture**
* **stack**
* **pages**
* **models**
* **APIs**
* **RBAC**
* **lead flow**
* **deployment-ready instructions**

That will be the **best next thing** for your actual implementation workflow.
