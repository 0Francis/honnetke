# HonnetKE — Frontend Plan

> Master plan for all HonnetKE frontend pages.
> Every frontend page references this document for design tokens, structure, and conventions.

## Global Design System

### Brand Tokens

| Token         | Value                                |
| ------------- | ------------------------------------ |
| Primary       | `#E8900A` (Deep Amber)               |
| Primary Hover | `#D07D08`                            |
| Secondary     | `#1E1E1E` (Dark Charcoal)            |
| Accent        | `#FFF8EC` (Warm Cream)               |
| Success       | `#2D9B5A` (Soft Green)               |
| Error         | `#D94040` (Warm Red)                 |
| Heading Font  | Plus Jakarta Sans (Google Fonts CDN) |
| Body Font     | Inter (Google Fonts CDN)             |

### Shared CSS Files

All pages import these from `frontend/landingpage/css/`:

1. `variables.css` — design tokens
2. `reset.css` — CSS reset
3. `global.css` — base typography, buttons, badges, form inputs, utilities

Each page then adds its own page-specific stylesheet.

### Shared UI Components

- **Navbar**: Charcoal bg, sticky, glassmorphism on scroll, hamburger on mobile. Same HTML across all guest/public pages.
- **Footer**: Charcoal bg, 3-column layout (logo + tagline, quick links, contact info). Present on guest and student pages.

---

## Page Index

### 1. Landing Page (Guest)

- **Folder**: `frontend/landingpage/`
- **Files**: `landingpage.html`, `css/landing.css`, `js/landing.js`
- **Sections**: Navbar → Hero (search bar) → Featured Hostels (6 cards) → Contact "Buzz Us" → Footer
- **Status**: ✅ Complete

### 2. Sign Up Page

- **Folder**: `frontend/signuppage/`
- **Files**: `signup.html`, `css/signup.css`, `js/signup.js`
- **Layout**: Two-column — left visual panel + right form
- **Role-specific fields**:
  - Student: University / Campus
  - Landlord: Business / Property Name (optional)
  - Agent: Agency Name + License Number (optional)
- **After submit**: Redirect to OTP verification
- **Status**: 🔨 Building

### 3. OTP Verification Page

- **Folder**: `frontend/signuppage/`
- **Files**: `otp.html` (styles in `signup.css`, logic in `signup.js`)
- **Layout**: Centered card, 6-digit input, resend countdown
- **Status**: 🔨 Building

### 4. Login Page

- **Folder**: `frontend/loginpage/`
- **Files**: `login.html`, `css/login.css`, `js/login.js`
- **Layout**: Two-column mirror of Sign Up
- **Features**: Forgot password modal on same page
- **After login**: Role-based dashboard redirect
- **Status**: 🔨 Building

### 5. Hostels Page (Guest/Student)
- **Folder**: `frontend/students/` (hostels.html)
- **Status**: 🔨 Building

### 6. Listing Detail Page (Student)
- **Folder**: `frontend/students/` (listing.html)
- **Status**: 🔨 Building

### 7. Student Dashboard
- **Folder**: `frontend/students/` (dashboard.html)
- **Status**: 🔨 Building

### 8. Landlord/Agent Dashboard

- **Folder**: `frontend/providerdashboard/` (planned)
- **Status**: 📋 Not started

### 9. Admin Console

- **Folder**: `frontend/adminconsole/` (planned)
- **Status**: 📋 Not started

---

## Student Frontend Plan

> All student pages live inside `frontend/students/`.
> They share a common Student Navbar (different from the guest navbar) and Footer.
> All pages import the shared CSS from `frontend/landingpage/css/` then add `css/students.css`.

### Student Navbar (All Student Pages)

Charcoal bg, sticky, glassmorphism on scroll. Different from guest navbar:

- **Left**: HonnetKE logo (links to student dashboard)
- **Center**: Dashboard · Hostels · Favourites
- **Right**: Notification bell icon + user avatar dropdown (Profile / Logout)
- **Mobile**: Hamburger → full-screen overlay with same links

### Student Pages

#### S1. Student Dashboard (`dashboard.html`)

- **Status**: Building
- **Layout**: Full-width page with footer
- **Welcome toast**: Shown on login via JS (toast notification, not permanent element)
- **Quick Actions Section**: 3 action cards in a row
  - Search Hostels (amber, prominent, links to hostels.html)
  - View Favourites (links to favourites.html)
  - View History (links to history.html)
- **Recent Activity Section**: Horizontal scroll of recently viewed listing cards (thumbnail, title, location, price) + "View All" link
- **Featured Hostels Section**: 3-card grid of featured listing cards + "View All Hostels" link

#### S2. Hostels / Search Page (`hostels.html`)

- **Status**: Building
- **Layout**: Full-width with sidebar + results grid
- **Top**: Search bar with filters (Location, Price, Property Type, Gender, Room Type) — same filter set as landing page hero
- **Left sidebar**: Collapsible filter panel (mobile: slides in from left as overlay)
- **Right**: Results grid of listing cards (image, title, location, price, property type badge, gender badge, "View Details" button)
- **Pagination**: Bottom of results
- **Empty state**: Hornet illustration + "No hostels match your filters"

#### S3. Listing Detail Page (`listing.html`)

- **Status**: Building
- **Layout**: Full-width with two-column content below gallery
- **Top**: Large image gallery/carousel (5 images, thumbnail navigation below)
- **Left column**: Property details — title, location, price, description, amenities grid, room type, gender preference
- **Right column**: Contact card — verified provider info with WhatsApp · Call · SMS buttons (external redirect, no in-app messaging)
- **Below**: Similar Listings section (3-card grid)
- **Report**: Small "Report Listing" link at bottom → opens modal/popup

#### S4. Favourites Page (`favourites.html`)

- **Status**: Building
- **Layout**: Full-width grid page
- **Title**: "Your Hive Saves"
- **Content**: Grid of saved listing cards (image, title, location, price, remove-from-favourites heart icon)
- **Empty state**: Hornet illustration + "No saves yet, start exploring!" + CTA button to hostels page

#### S5. Visited History Page (`history.html`)

- **Status**:Building
- **Layout**: Full-width list page
- **Title**: "Your Visited Hostels"
- **Content**: List view of visited properties (thumbnail, title, location, date visited)
- **Empty state**: "No visits logged yet" + CTA button to hostels page

### Student File Structure

```
frontend/students/
├── dashboard.html
├── hostels.html
├── listing.html
├── favourites.html
├── history.html
├── css/
│   └── students.css         ← all student page styles
├── js/
│   └── students.js          ← all student page logic
└── assets/
    └── images/              ← student-specific images
```

### Shared Components (in every student page)

1. **Student Navbar** — charcoal bg, student-specific links, user avatar, notification bell
2. **Footer** — same as landing page footer (3-column: brand, quick links, contact)
3. **Listing Card** — reusable card component (same design as landing page cards)
4. **Toast Notification** — for welcome message and action confirmations

---

## File Structure

```
frontend/
├── landingpage/
│   ├── landingpage.html
│   ├── css/
│   │   ├── variables.css       ← shared design tokens
│   │   ├── reset.css           ← shared CSS reset
│   │   ├── global.css          ← shared base styles + utilities
│   │   └── landing.css         ← landing page specific
│   ├── js/
│   │   └── landing.js
│   └── assets/images/
│
├── signuppage/
│   ├── signup.html
│   ├── otp.html
│   ├── css/
│   │   └── signup.css
│   └── js/
│       └── signup.js
│
├── loginpage/
│   ├── login.html
│   ├── css/
│   │   └── login.css
│   └── js/
│       └── login.js
│
└── (future pages...)
```

## Key Conventions

- All pages use `variables.css` tokens — never hard-code colors, fonts, or spacing.
- Navigation links use relative paths between page folders.
- JavaScript follows the same module pattern: `DOMContentLoaded` wrapper, clear section comments.
- Mobile-first responsive breakpoints: 480px, 768px, 1024px.
- Accessibility: skip links, ARIA labels, keyboard navigation, focus-visible outlines.
