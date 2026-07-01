# HonnetKE - Frontend Plan

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

1. `variables.css` - design tokens
2. `reset.css` - CSS reset
3. `global.css` - base typography, buttons, badges, form inputs, utilities

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
- **Layout**: Two-column - left visual panel + right form
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

### 8. Landlord Dashboard

- **Folder**: `frontend/landlord/` (dashboard.html)
- **Status**: 🔨 Building

### 9. Create Listing Page (Landlord)

- **Folder**: `frontend/landlord/` (create-listing.html)
- **Status**: 🔨 Building

### 10. Manage Listings Page (Landlord)

- **Folder**: `frontend/landlord/` (manage-listings.html)
- **Status**: 🔨 Building

### 11. Bookings Page (Landlord)

- **Folder**: `frontend/landlord/` (bookings.html)
- **Status**: 🔨 Building

### 12. Analytics Page (Landlord)

- **Folder**: `frontend/landlord/` (analytics.html)
- **Status**: 🔨 Building

### 13. Student Profile Page

- **Folder**: `frontend/students/` (profile.html)
- **Features**: Profile header card, personal info form, university/campus details, notification preferences, change password, deactivation with confirmation modal
- **Status**: ✅ Complete

### 14. Landlord Profile Page

- **Folder**: `frontend/landlord/` (profile.html)
- **Features**: Profile header card with verified badge, personal info + business name, contact preferences (WhatsApp/Call/SMS toggles), portfolio stats, change password, deactivation modal
- **Status**: ✅ Complete

### 15. Admin Profile Page

- **Folder**: `frontend/admin/` (profile.html)
- **Features**: Profile header card with purple admin badge, personal info, 2FA toggle, notification preferences, activity stats, admin-only note (no self-deactivation)
- **Status**: ✅ Complete

### 16. Agent Dashboard

- **Folder**: `frontend/agents/` (planned)
- **Status**: 📋 Not started

### 14. Admin Console

- **Folder**: `frontend/admin/`
- **Sub-pages**:
  - 14a. Admin Dashboard (`dashboard.html`) - 🔨 Building
  - 14b. Manage Listings (`manage-listings.html`) - 🔨 Building
  - 14c. Manage Users (`manage-users.html`) - 🔨 Building
  - 14d. Flagged Listings (`flagged-listings.html`) - 🔨 Building
  - 14e. Duplicate Queue (`duplicate-queue.html`) - 🔨 Building
- **Status**: 🔨 Building

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
- **Top**: Search bar with filters (Location, Price, Property Type, Gender, Room Type) - same filter set as landing page hero
- **Left sidebar**: Collapsible filter panel (mobile: slides in from left as overlay)
- **Right**: Results grid of listing cards (image, title, location, price, property type badge, gender badge, "View Details" button)
- **Pagination**: Bottom of results
- **Empty state**: Hornet illustration + "No hostels match your filters"

#### S3. Listing Detail Page (`listing.html`)

- **Status**: Building
- **Layout**: Full-width with two-column content below gallery
- **Top**: Large image gallery/carousel (5 images, thumbnail navigation below)
- **Left column**: Property details - title, location, price, description, amenities grid, room type, gender preference
- **Right column**: Contact card - verified provider info with WhatsApp · Call · SMS buttons (external redirect, no in-app messaging)
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

#### S6. Student Profile Page (`profile.html`)

- **Status**: ✅ Complete
- **Layout**: Full-width page with stacked profile cards
- **Profile Header Card**: Large avatar (initials), name, email, role badge (blue "Student"), verified badge, join date
- **Stats Row**: 4 stats - Searches, Favourites, Reviews, Days Active
- **Personal Info Form**: Full name (editable), email (read-only), phone, university, campus
- **Account Settings Card**:
  - Change Password: Current/New/Confirm password fields
  - Notification Preferences: Email alerts, SMS alerts, push notifications (toggle switches)
- **Danger Zone Card**: Red-bordered card with "Deactivate Account" button → confirmation modal

### Student File Structure

```
frontend/students/
├── dashboard.html
├── hostels.html
├── listing.html
├── favourites.html
├── history.html
├── profile.html             ← NEW - student profile page
├── css/
│   └── students.css         ← all student page styles (incl. profile section)
├── js/
│   └── students.js          ← all student page logic (incl. profile handlers)
└── assets/
    └── images/              ← student-specific images
```

### Shared Components (in every student page)

1. **Student Navbar** - charcoal bg, student-specific links, user avatar, notification bell
2. **Footer** - same as landing page footer (3-column: brand, quick links, contact)
3. **Listing Card** - reusable card component (same design as landing page cards)
4. **Toast Notification** - for welcome message and action confirmations

---

## Landlord Frontend Plan

> All landlord pages live inside `frontend/landlord/`.
> They share a common Landlord Navbar (different from the guest and student navbars) and Footer.
> All pages import the shared CSS from `frontend/landingpage/css/` then add `css/landlord.css`.

### Landlord Navbar (All Landlord Pages)

Charcoal bg, sticky, glassmorphism on scroll. Different from guest and student navbars:

- **Left**: HonnetKE logo (links to landlord dashboard)
- **Center**: Dashboard · My Listings · Create Listing · Bookings · Analytics
- **Right**: Notification bell icon + user avatar dropdown (Profile / Logout)
- **Mobile**: Hamburger → full-screen overlay with same links

### Landlord Pages

#### L1. Landlord Dashboard (`dashboard.html`)

- **Status**: Building
- **Layout**: Full-width page with footer
- **Welcome section**: Greeting heading + subtitle
- **Stats Overview Section**: 4 stat cards in a row
  - Total Listings (count)
  - Active Listings (count, green accent)
  - Pending Review (count, amber accent)
  - Total Bookings (count)
- **Quick Actions Section**: 3 action cards in a row
  - Create New Listing (amber, prominent, links to create-listing.html)
  - Manage Listings (links to manage-listings.html)
  - View Analytics (links to analytics.html)
- **Recent Bookings Section**: Table of latest booking requests (student name, listing, date, status badge, confirm/decline buttons) + "View All Bookings" link

#### L2. Create Listing Page (`create-listing.html`)

- **Status**: Building
- **Layout**: Full-width centered form with stepper progress indicator
- **Step 1 - Basic Info**: Title, Description (textarea), Property Type (dropdown: Hostel/Apartment/Bedsitter/Single Room), Price (KES), Gender Preference (Male/Female/Mixed), Room Type (Single/Ensuite/Shared)
- **Step 2 - Location**: County, Area, Nearest Campus, Full Address
- **Step 3 - Amenities**: Checkbox grid (WiFi, Water, Security, Parking, Electricity, Kitchen, Laundry, Study Area, CCTV, Furnished)
- **Step 4 - Images**: Drag-and-drop upload area, thumbnail preview grid, primary image selection (Cloudinary integration placeholder)
- **Step 5 - Review & Submit**: Read-only summary of all fields, edit buttons per section, submit button
- **After submit**: Toast notification → redirect to manage-listings.html

#### L3. Manage Listings Page (`manage-listings.html`)

- **Status**: Building
- **Layout**: Full-width with filter bar + listing cards grid
- **Filter bar**: Status filter pills (All / Active / Pending / Inactive / Blocked)
- **Listing cards grid**: Each card shows property image, title, location, price, status badge (color-coded), action dropdown (Edit / Deactivate / Reactivate / Delete)
- **Delete confirmation modal**: Warning message + confirm/cancel buttons
- **Deactivate confirmation modal**: Reason field + confirm/cancel buttons
- **Empty state**: "No listings yet - create your first listing!" + CTA button

#### L4. Bookings Page (`bookings.html`)

- **Status**: Building
- **Layout**: Full-width with filter tabs + bookings table/cards
- **Filter tabs**: All / Pending / Confirmed / Declined / Cancelled
- **Bookings table**: Student name, listing title, request date, request note preview, status badge, action buttons (Confirm / Decline for pending bookings)
- **Response modal**: Text area for provider response note when confirming or declining
- **Empty state**: "No booking requests yet"

#### L5. Analytics Page (`analytics.html`)

- **Status**: Building
- **Layout**: Full-width with overview cards + chart + per-listing table
- **Overview cards**: 3 stat cards - Views This Week, Total Views (All Time), Most Viewed Listing
- **Weekly views chart**: CSS-based bar chart showing weekly view counts (last 8 weeks)
- **Per-listing performance table**: Listing name, views this week, total views, status badge
- **Note**: Analytics stored as weekly aggregates per the database schema, purged after 30 days

#### L6. Landlord Profile Page (`profile.html`)

- **Status**: ✅ Complete
- **Layout**: Full-width page with stacked profile cards
- **Profile Header Card**: Large avatar (initials, amber gradient), name, email, role badge (amber "Landlord"), verified badge, join date
- **Portfolio Stats Row**: 4 stats - Total Listings, Active Listings, Total Bookings, Profile Views
- **Personal Info Form**: Full name (editable), email (read-only), phone, business/property name
- **Contact Preferences Card**: Toggle switches for WhatsApp, Phone Calls, SMS
- **Account Settings Card**:
  - Change Password: Current/New/Confirm password fields
  - Notification Preferences: Booking alerts, listing updates, analytics reports (toggle switches)
- **Danger Zone Card**: Red-bordered card with "Deactivate Account" button → confirmation modal

### Landlord File Structure

```
frontend/landlord/
├── dashboard.html
├── create-listing.html
├── manage-listings.html
├── bookings.html
├── analytics.html
├── profile.html             ← NEW - landlord profile page
├── css/
│   └── landlord.css         ← all landlord page styles (incl. profile section)
└── js/
    └── landlord.js          ← all landlord page logic (incl. profile handlers)
```

### Shared Components (in every landlord page)

1. **Landlord Navbar** - charcoal bg, landlord-specific links, user avatar, notification bell
2. **Footer** - same as landing page footer (3-column: brand, quick links, contact)
3. **Stat Card** - reusable overview card with icon, value, label
4. **Status Badge** - color-coded badge for listing/booking status (pending=amber, active/confirmed=green, inactive/declined=gray, blocked/cancelled=red)
5. **Toast Notification** - for action confirmations and success/error feedback
6. **Confirmation Modal** - reusable modal for delete/deactivate/booking actions

### Integration Points

- **Login**: Login page redirects landlords to `../landlord/dashboard.html` based on role
- **Signup**: Signup page already includes Landlord role; landlord-specific field is Business/Property Name (optional)
- **Shared CSS**: All pages import `variables.css`, `reset.css`, `global.css` from `../landingpage/css/`
- **Logout**: Navbar logout links back to `../loginpage/login.html`
- **Footer**: Contact link references `../landingpage/landingpage.html#contact`
- **Demo images**: Listing cards use images from `../landingpage/assets/images/`
- **Admin flow**: When a landlord creates a listing, status defaults to `pending` - admin reviews via admin console (see Admin Frontend Plan below)

---

## Admin Frontend Plan

> All admin pages live inside `frontend/admin/`.
> Admin accounts are created directly in the database - there is no admin signup page.
> All pages import the shared CSS from `frontend/landingpage/css/` then add `css/admin.css`.
> Auth guard: `requireAuth(['admin'])` on every page.

### Admin Navbar (All Admin Pages)

Charcoal bg, sticky, glassmorphism on scroll. Distinct from guest/student/landlord navbars:

- **Left**: HonnetKE logo (links to admin dashboard) + purple "ADMIN" badge
- **Center**: Dashboard · Listings · Users · Flagged · Duplicates
- **Right**: Notification bell icon + user avatar dropdown (Profile / Logout)
- **Mobile**: Hamburger → full-screen overlay with same links

### Admin Pages

#### A1. Admin Dashboard (`dashboard.html`)

- **Status**: Building
- **Layout**: Full-width page with footer
- **Welcome toast**: Shown once per session via JS
- **Stats Overview Section**: 6 stat cards (3×2 grid)
  - Total Users (purple)
  - Total Listings (blue)
  - Active Listings (green)
  - Pending Approvals (amber)
  - Flagged Listings - 3+ reports (red)
  - System Errors - last 24h (teal)
- **Quick Actions Section**: 4 action cards
  - Review Pending Listings (amber gradient, primary CTA)
  - Manage Users
  - View Flagged
  - Duplicate Queue
- **Recent Reports Section**: Data table showing last 5 reports (student, listing, reason, date, status badge, resolve button)
- **System Health Section**: 2 health cards - Traffic today, Errors in last 24h

#### A2. Manage Listings (`manage-listings.html`)

- **Status**: Building
- **Layout**: Full-width with filter bar + data table
- **Filter tabs**: All / Pending / Active / Inactive / Blocked (pill tabs)
- **Data table columns**: ID, Title, Provider, Location, Price (KES), Status Badge, Submitted Date, Actions
- **Actions**:
  - Pending listings: Approve (green) + Decline (red outline)
  - Active listings: Suspend (gray outline)
  - Inactive/Blocked: No actions (text label)
- **Decline modal**: Text area for decline reason + confirm/cancel
- **Suspend modal**: Warning message + confirm/cancel
- **Approve modal**: Confirmation + confirm/cancel

#### A3. Manage Users (`manage-users.html`)

- **Status**: Building
- **Layout**: Full-width with filter bar + search + data table
- **Filter tabs**: All / Students / Landlords / Agents (role filter)
- **Search bar**: Search by name or email
- **Data table columns**: ID, Full Name, Email, Phone, Role Badge, Status Badge, Joined Date, Warnings (count), Actions
- **Actions**:
  - Active users: Suspend + Warn + Delete
  - Suspended users: Reactivate + Delete
- **Suspend modal**: Warning + confirm/cancel
- **Warn modal**: Text area for reason + confirm/cancel
- **Delete modal**: Danger warning (permanent) + confirm/cancel

#### A4. Flagged Listings (`flagged-listings.html`)

- **Status**: Building
- **Layout**: Full-width with stats bar + data table with expandable rows
- **Stats bar**: Compact stat row - Total Flagged, Pending Review, Resolved This Week
- **Data table columns**: Expand icon, Listing, Provider, Report Count (badge - red pulse if 5+), Top Reason, Latest Report Date, Status, Actions
- **Expandable rows**: Click a row to expand and see all individual report entries (student name, reason, date) - styled as bordered cards
- **Actions**: Resolve (opens modal) + Block listing
- **Resolve modal**: Text area for resolution note + confirm/cancel

#### A5. Duplicate Listing Queue (`duplicate-queue.html`)

- **Status**: Building
- **Layout**: Full-width with stacked comparison cards
- **Duplicate group cards**: Each group shows:
  - Header: Similarity % badge (red if 90%+, amber if 70-89%) + matched fields text
  - Side-by-side comparison: Original listing vs Flagged duplicate (title, location, price, provider, date)
  - VS divider between the two
  - Action buttons: Keep Both (green) / Remove Duplicate (red outline) / Merge (blue outline)
- **Animated dismissal**: Cards fade out and slide up on action
- **Empty state**: When all resolved - "All Clear! 🐝 - No duplicate listings detected - the hive is clean!"
- **Note**: Backend duplicate-detection endpoint is not yet implemented. UI shows demo data and is ready for integration.

#### A6. Admin Profile Page (`profile.html`)

- **Status**: ✅ Complete
- **Layout**: Full-width page with stacked profile cards
- **Profile Header Card**: Large avatar (initials, purple gradient), name, email, role badge (purple "Admin"), join date
- **Admin Activity Stats Row**: 3 stats - Users Managed, Listings Reviewed, Reports Resolved
- **Personal Info Form**: Full name (editable), email (read-only), phone
- **Account Settings Card**:
  - Change Password: Current/New/Confirm password fields
  - Security: Two-Factor Authentication toggle (with toast feedback)
  - Notification Preferences: New reports, pending listings, system alerts (toggle switches)
- **Administrator Note Card**: Purple-bordered card explaining admin accounts cannot be self-deactivated

### Admin File Structure

```
frontend/admin/
├── coming-soon.html        ← original placeholder (kept)
├── dashboard.html
├── manage-listings.html
├── manage-users.html
├── flagged-listings.html
├── duplicate-queue.html
├── profile.html            ← NEW - admin profile page
├── css/
│   └── admin.css           ← all admin page styles (incl. profile section)
└── js/
    └── admin.js            ← all admin page logic (incl. profile handlers)
```

### Shared Components (in every admin page)

1. **Admin Navbar** - charcoal bg, admin-specific links, purple ADMIN badge, user avatar, notification bell
2. **Footer** - same as landing page footer (3-column: brand, quick links, contact)
3. **Stat Card** - reusable overview card with colored left border, icon, value, label
4. **Data Table** - full-width with striped hover, sortable columns, action buttons
5. **Status Badge** - color-coded badge (pending=amber, active/resolved=green, inactive/declined=gray, blocked/suspended/cancelled=red)
6. **Role Badge** - color-coded role indicator (student=blue, landlord=amber, agent=purple)
7. **Toast Notification** - for action confirmations and success/error/warning feedback
8. **Confirmation Modal** - reusable modal with icon, title, description, optional textarea, confirm/cancel buttons
9. **Filter Tabs** - pill-style filter buttons for status/role filtering
10. **Expandable Row** - table row that expands to show nested detail content
11. **Duplicate Comparison Card** - side-by-side listing comparison with similarity scoring

### Integration Points

- **Login**: Login page redirects admins to `../admin/dashboard.html` based on role (updated from coming-soon.html)
- **Auth Guard**: All pages use `requireAuth(['admin'])` - redirects to login if not admin
- **Backend API**: Consumes `/api/admin/*` endpoints (currently 501 Not Implemented - UI uses demo data)
- **Shared CSS**: All pages import `variables.css`, `reset.css`, `global.css` from `../landingpage/css/`
- **Logout**: Navbar logout links back to `../loginpage/login.html`
- **Footer**: Contact link references `../landingpage/landingpage.html#contact`

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
├── students/
│   ├── dashboard.html
│   ├── hostels.html
│   ├── listing.html
│   ├── favourites.html
│   ├── history.html
│   ├── profile.html
│   ├── css/
│   │   └── students.css
│   └── js/
│       └── students.js
│
├── landlord/
│   ├── dashboard.html
│   ├── create-listing.html
│   ├── manage-listings.html
│   ├── bookings.html
│   ├── analytics.html
│   ├── profile.html
│   ├── css/
│   │   └── landlord.css
│   └── js/
│       └── landlord.js
│
├── agents/                      ← planned
│
├── admin/
│   ├── coming-soon.html
│   ├── dashboard.html
│   ├── manage-listings.html
│   ├── manage-users.html
│   ├── flagged-listings.html
│   ├── duplicate-queue.html
│   ├── profile.html
│   ├── css/
│   │   └── admin.css
│   └── js/
│       └── admin.js
│
└── shared/
    └── js/
        ├── api.js
        └── auth.js
```

## Key Conventions

- All pages use `variables.css` tokens - never hard-code colors, fonts, or spacing.
- Navigation links use relative paths between page folders.
- JavaScript follows the same module pattern: `DOMContentLoaded` wrapper, clear section comments.
- Mobile-first responsive breakpoints: 480px, 768px, 1024px.
- Accessibility: skip links, ARIA labels, keyboard navigation, focus-visible outlines.
