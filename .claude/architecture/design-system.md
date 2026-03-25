# Design System — Modern & Minimal, Deep Red + Cream

## Color Palette
- **Primary:** Deep Red `#8B1A1A` (buttons, headers, links, active states)
- **Primary Dark:** `#5C1010` (hover states, gradient start)
- **Primary Light:** `#B83A3A` (lighter accents, gradient end)
- **Secondary/Background:** Cream `#FFF8F0` (page backgrounds)
- **Neutral Dark:** `#2D2D2D` (headings, body text)
- **Neutral Medium:** `#6B7280` (secondary text, labels)
- **Neutral Light:** `#F3F4F6` (borders, dividers, input backgrounds)
- **White:** `#FFFFFF` (card backgrounds, modals)
- **Success:** `#16A34A` (verified badges, success messages)
- **Warning:** `#F59E0B` (paid listing badges)
- **Error:** `#DC2626` (form errors, alerts)

## Gradients (Bold — used prominently)
- **Hero:** `linear-gradient(135deg, #8B1A1A 0%, #B83A3A 50%, #D4544A 100%)` — landing hero, page headers
- **Button:** `linear-gradient(135deg, #8B1A1A 0%, #A52A2A 100%)` — primary CTA buttons
- **Card Hover:** `linear-gradient(180deg, rgba(139,26,26,0.05) 0%, rgba(139,26,26,0.15) 100%)` — subtle hover effect
- **Dashboard Header:** `linear-gradient(90deg, #5C1010 0%, #8B1A1A 100%)` — dashboard top bars
- **Vendor CTA:** `linear-gradient(135deg, #8B1A1A 0%, #D4544A 100%)` — vendor call-to-action sections

## Typography
- **Font:** Inter (Google Fonts, clean sans-serif)
- **Headings:** Inter 700 (bold)
- **Body:** Inter 400 (regular)
- **Small/Labels:** Inter 500 (medium)
- **Sizes:** h1: 36px, h2: 28px, h3: 22px, body: 16px, small: 14px, label: 12px

## Border Radius (Rounded corners)
- **Cards:** 12px
- **Buttons:** 8px
- **Inputs:** 8px
- **Modals:** 16px
- **Property Images:** 12px (top corners only in vertical cards)
- **Avatars:** 50% (circle)

## Property Card Design
- **Grid View (Vertical):** Image top (16:10 ratio), details below — title, price, location, type, bed/bath icons, views
- **List View (Horizontal):** Image left (40% width), details right — includes description snippet
- **Toggle:** Grid/List toggle button, top-right of listing pages
- **Shadow:** `0 2px 8px rgba(0,0,0,0.08)` → hover: `0 4px 16px rgba(0,0,0,0.12)`
- **Background:** White `#FFFFFF` cards on cream `#FFF8F0` page

## Component Styles
- **Navbar:** White bg, deep red logo, cream hover, gradient underline on active link
- **Hero Section:** Full-width gradient bg, white text, centered search bar
- **Search Bar:** White bg, rounded, slight shadow, deep red gradient search button
- **Filter Sidebar:** Cream bg, deep red active filter chips
- **CTA Buttons:** Gradient bg, white text, rounded, slight shadow
- **Secondary Buttons:** White bg, deep red border, deep red text
- **Contact Unlock Button:** Bold gradient, large, prominent — most important button on the site
- **Dashboard Sidebar:** Dark deep red gradient, white text, cream active state
- **Stats Cards:** White bg, deep red icon/number, cream subtle border
