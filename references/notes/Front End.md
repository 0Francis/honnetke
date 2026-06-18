# HonnetKE — Frontend Plan

> Master plan for all HonnetKE frontend pages.
> Every frontend page references this document for design tokens, structure, and conventions.

## Global Design System

### Brand Tokens

| Token          | Value                                   |
|----------------|-----------------------------------------|
| Primary        | `#E8900A` (Deep Amber)                  |
| Primary Hover  | `#D07D08`                               |
| Secondary      | `#1E1E1E` (Dark Charcoal)              |
| Accent         | `#FFF8EC` (Warm Cream)                  |
| Success        | `#2D9B5A` (Soft Green)                  |
| Error          | `#D94040` (Warm Red)                    |
| Heading Font   | Plus Jakarta Sans (Google Fonts CDN)    |
| Body Font      | Inter (Google Fonts CDN)                |

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
- **Folder**: `frontend/hostelspage/` (planned)
- **Status**: 📋 Not started

### 6. Listing Detail Page (Student)
- **Folder**: `frontend/listingdetail/` (planned)
- **Status**: 📋 Not started

### 7. Student Dashboard
- **Folder**: `frontend/studentdashboard/` (planned)
- **Status**: 📋 Not started

### 8. Landlord/Agent Dashboard
- **Folder**: `frontend/providerdashboard/` (planned)
- **Status**: 📋 Not started

### 9. Admin Console
- **Folder**: `frontend/adminconsole/` (planned)
- **Status**: 📋 Not started

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
