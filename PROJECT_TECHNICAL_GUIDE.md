# HonnetKE - Technical Guide

> Kenya's student hostel discovery platform. Built with Express + Prisma + PostgreSQL on the backend and vanilla JS multi-page architecture on the frontend.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. [Authentication & Security](#6-authentication--security)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Property Lifecycle](#8-property-lifecycle)
9. [Booking Lifecycle](#9-booking-lifecycle)
10. [Development Setup](#10-development-setup)
11. [Deployment Notes](#11-deployment-notes)

---

## 1. Architecture Overview

```
Browser (vanilla JS pages)
    |
    | fetch() with Bearer token
    v
Express API (helmet + CORS + rate limiting)
    |
    | Prisma Client
    v
PostgreSQL
    |
    +-- Cloudinary (image storage)
    +-- Nodemailer (OTP / verification emails)
```

- **Backend**: Express.js REST API with Prisma ORM and PostgreSQL.
- **Frontend**: Vanilla JS multi-page app. No build step. Pages are static HTML with shared JS modules.
- **Auth**: JWT-based with OTP email verification for signup and login.
- **Images**: Cloudinary via multer-storage-cloudinary.

---

## 2. Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Runtime      | Node.js 18+                                     |
| Framework    | Express 4.19                                    |
| ORM          | Prisma 5.22 (@prisma/client 5.16)              |
| Database     | PostgreSQL                                      |
| Auth         | jsonwebtoken + bcryptjs + OTP (nodemailer)      |
| Security     | helmet, express-rate-limit, express-validator   |
| Images       | cloudinary + multer + multer-storage-cloudinary |
| Frontend     | Vanilla HTML/CSS/JS (no framework)              |
| CSS          | Custom design system (variables.css + reset.css)|
| Dev server   | VS Code Live Server (port 5500)                 |

---

## 3. Project Structure

```
honnetke/
  backend/
    prisma/
      schema.prisma        # Database models + enums
      seed.js              # Dev seed data (disposable)
    src/
      app.js               # Express app (middleware, routes)
      server.js            # HTTP server entry point
      config/
        cloudinary.js      # Cloudinary + multer config
      controllers/
        auth.controller.js
        properties.controller.js
        bookings.controller.js
        favourites.controller.js
        reports.controller.js
        admin.controller.js
        analytics.controller.js
        notifications.controller.js
        me.controller.js
        listings.controller.js   # Legacy alias (redirects to properties)
      middleware/
        auth.middleware.js       # JWT verification
        role.middleware.js       # Role-based access control
        error.middleware.js      # Centralized error handler
        traffic.middleware.js    # Daily visit counter
      routes/
        auth.routes.js
        properties.routes.js
        bookings.routes.js
        favourites.routes.js
        reports.routes.js
        admin.routes.js
        analytics.routes.js
        notifications.routes.js
        me.routes.js
        listings.routes.js       # Legacy alias
      utils/
        mailer.js                # Nodemailer email sending
        otp.js                   # OTP generation + verification
    .env                         # Environment variables
    package.json

  frontend/
    shared/
      js/
        api.js                   # Fetch wrapper (get/post/patch/del)
        auth.js                  # Auth guard, token management
        property.js              # Shared property card + badge helpers
    landingpage/
      landingpage.html
      js/landing.js
      css/landing.css, variables.css, reset.css, global.css
    students/
      hostels.html               # Browse/search properties
      listing.html               # Property detail + booking + report
      dashboard.html             # Student dashboard
      favourites.html            # Saved properties
      history.html               # Visit history
      profile.html               # Student profile
      js/students.js             # All student page logic
      css/students.css
    landlord/
      dashboard.html
      create-listing.html        # Multi-step property creation
      manage-listings.html       # Manage own properties
      bookings.html              # Booking lifecycle management
      analytics.html             # Performance analytics
      profile.html
      js/landlord.js             # All landlord page logic
      css/landlord.css
    admin/
      dashboard.html             # Platform stats + recent reports
      manage-listings.html       # Approve/reject/suspend properties
      manage-users.html          # User management
      flagged-listings.html      # Reports grouped by property
      duplicate-queue.html       # Duplicate detection UI
      profile.html
      js/admin.js                # All admin page logic
      css/admin.css
    loginpage/
      login.html, js/login.js, css/login.css
    signuppage/
      signup.html, otp.html
      js/signup.js, js/otp.js
      css/signup.css
```

---

## 4. Database Schema

### User Tables (4 separate tables, not unified)

| Model    | PK          | Unique Fields        | Notes                          |
|----------|-------------|----------------------|--------------------------------|
| Student  | studentId   | email, phoneNumber   | Has favourites, bookings, reports |
| Landlord | landlordId  | email, phoneNumber   | Has properties                  |
| Agent    | agentId     | email, phoneNumber   | Has properties                  |
| Admin    | adminId     | email, phoneNumber   | Approves properties, resolves reports |

All user tables share: `fullName`, `passwordHash`, `status` (active/suspended), `isVerified`, `createdAt`.

### Core Enums

**PropertyStatus**: `draft` -> `pending_approval` -> `active` -> `fully_occupied` | `suspended` | `rejected` | `archived`

**PropertyType**: `hostel_room`, `shared_room`, `studio`, `bedsitter`, `sq`, `one_bedroom`, `two_bedroom`, `three_bedroom`, `suite`, `apartment`, `maisonette`, `other`

**GenderPreference**: `male`, `female`, `mixed`

**RoomType**: `single`, `ensuite`, `shared`

**BookingStatus**: `pending` -> `accepted` -> `visited` -> `completed` | `rejected` | `cancelled`

**ReportReason**: `spam`, `fraud`, `wrong_information`, `already_occupied`, `inappropriate`, `other`

**ReportStatus**: `pending`, `resolved`, `dismissed`

**NotificationType**: `property_review`, `booking_update`, `visit_invitation`, `warning`, `suspension`, `announcement`, `report`, `system`

**OtpPurpose**: `verify`, `login`, `reset`

### Key Models

- **Property**: Core entity with capacity/occupied tracking, location data, images relation, approval workflow.
- **PropertyImage**: Cloudinary URLs with `isPrimary` and `sortOrder` for ordering.
- **Booking**: Includes visit invitation fields (visitDate, visitTime, meetingPoint, visitNotes, mapLink).
- **Favourite**: Unique constraint on (studentId, propertyId).
- **ViewHistory**: Unique constraint on (studentId, propertyId) - upserted on each view.
- **Analytics**: Weekly aggregate views per property (unique on propertyId + weekStart).
- **Warning**: Polymorphic - can target student, landlord, or agent.
- **Notification**: Polymorphic - targets any user role, optionally linked to a booking.
- **Otp**: Hashed codes with expiry and consumption tracking.

---

## 5. API Reference

Base URL: `http://localhost:5000/api`

### Authentication (`/api/auth`)

| Method | Endpoint           | Auth | Description                     |
|--------|--------------------|------|---------------------------------|
| POST   | /register          | No   | Register new user (any role)    |
| POST   | /verify-otp        | No   | Verify OTP code                 |
| POST   | /resend-otp        | No   | Resend OTP                      |
| POST   | /login             | No   | Login (sends OTP)               |
| POST   | /forgot-password   | No   | Request password reset OTP      |
| POST   | /reset-password    | No   | Reset password with OTP         |
| POST   | /logout            | Yes  | Logout (invalidate token)       |

### Properties (`/api/properties`)

| Method | Endpoint                    | Auth              | Description                     |
|--------|-----------------------------|-------------------|---------------------------------|
| GET    | /                           | Optional (guest)  | List/search properties with filters |
| GET    | /:id                        | Optional (guest)  | Get property detail             |
| POST   | /                           | landlord/agent    | Create property (draft)         |
| PATCH  | /:id                        | landlord/agent    | Update property                 |
| DELETE | /:id                        | landlord/agent    | Delete property                 |
| PATCH  | /:id/archive                | landlord/agent    | Archive property                |
| PATCH  | /:id/submit                 | landlord/agent    | Submit for approval             |
| POST   | /:id/images                 | landlord/agent    | Upload images (max 10)          |
| PATCH  | /:id/images/reorder         | landlord/agent    | Reorder images                  |
| PATCH  | /:id/images/:imageId/primary| landlord/agent    | Set primary image               |
| DELETE | /:id/images/:imageId        | landlord/agent    | Delete image                    |

**Query parameters for GET /**: `search`, `propertyType`, `minPrice`, `maxPrice`, `genderPreference`, `roomType`, `county`, `area`, `nearestCampus`, `availability` (available/few_slots/full), `status`, `sort`, `page`, `limit`.

### Bookings (`/api/bookings`)

| Method | Endpoint           | Auth                    | Description                     |
|--------|--------------------|-------------------------|---------------------------------|
| GET    | /                  | Any authenticated       | List bookings (role-filtered)   |
| POST   | /                  | student                 | Create booking request          |
| PATCH  | /:id               | landlord/agent/student  | Update booking status           |
| PATCH  | /:id/visit         | landlord/agent          | Send visit invitation           |

### Favourites (`/api/favourites`)

| Method | Endpoint    | Auth    | Description                     |
|--------|-------------|---------|---------------------------------|
| GET    | /           | student | List favourites                 |
| POST   | /           | student | Add favourite                   |
| DELETE | /:propertyId| student | Remove favourite                |

### Reports (`/api/reports`)

| Method | Endpoint | Auth    | Description                     |
|--------|----------|---------|---------------------------------|
| POST   | /        | student | Report a property               |
| GET    | /        | student | List own reports                |

### Admin (`/api/admin`)

| Method | Endpoint                      | Description                     |
|--------|-------------------------------|---------------------------------|
| GET    | /stats                        | Platform statistics             |
| GET    | /users                        | All users across roles          |
| GET    | /properties                   | Pending properties              |
| PATCH  | /properties/:id/approve       | Approve property                |
| PATCH  | /properties/:id/reject        | Reject/suspend property         |
| GET    | /reports                      | All reports                     |
| PATCH  | /reports/:id/resolve          | Resolve report                  |
| POST   | /warnings                     | Issue warning                   |
| PATCH  | /accounts/:id/suspend         | Suspend user account            |
| PATCH  | /accounts/:id/reactivate      | Reactivate user account         |
| GET    | /errors                       | Error logs                      |
| GET    | /traffic                      | Traffic logs                    |

### Analytics (`/api/analytics`)

| Method | Endpoint           | Auth              | Description                     |
|--------|--------------------|-------------------|---------------------------------|
| GET    | /                  | landlord/agent    | Analytics for own properties    |
| GET    | /:propertyId       | landlord/agent    | Analytics for specific property |

### Notifications (`/api/notifications`)

| Method | Endpoint     | Auth              | Description                     |
|--------|--------------|-------------------|---------------------------------|
| GET    | /            | Any authenticated | List notifications              |
| PATCH  | /:id/read    | Any authenticated | Mark as read                    |

### Me (`/api/me`)

| Method | Endpoint | Auth              | Description                     |
|--------|----------|-------------------|---------------------------------|
| GET    | /        | Any authenticated | Current user profile            |

---

## 6. Authentication & Security

### Auth Flow

1. **Registration**: User submits email, password, role -> server creates account (unverified) -> sends OTP via email.
2. **OTP Verification**: User submits OTP code -> server verifies -> marks account verified.
3. **Login**: User submits email + password -> server validates -> sends OTP -> user verifies OTP -> server issues JWT.
4. **JWT**: Stored in `localStorage` as `honnetke_token`. Sent as `Authorization: Bearer <token>` header.
5. **Token payload**: `{ id, role, email }` with 7-day expiry.

### Security Middleware

- **helmet**: Sets security headers (CSP, XSS protection, etc.).
- **CORS**: Whitelist-based (configurable via `FRONTEND_URL` env var).
- **Rate limiting**: 
  - General API: 300 requests / 15 min per IP.
  - Auth endpoints: 20 requests / 15 min per IP.
- **express-validator**: Input validation on property creation, registration, booking creation.
- **Role-based access**: `allowRoles()` middleware restricts endpoints by user role.
- **Password hashing**: bcryptjs with salt rounds 10.
- **OTP hashing**: OTP codes are hashed before storage, verified with bcrypt.

### Role-to-ID Helper

Centralized in `properties.controller.js` and `bookings.controller.js`:
```js
function getProviderId(user) {
  if (user.role === 'landlord') return { landlordId: user.id };
  if (user.role === 'agent') return { agentId: user.id };
  return {};
}
```

---

## 7. Frontend Architecture

### Shared JS Modules

- **`api.js`**: Wrapper around `fetch()`. Exposes `window.HonnetKE.api` with `get()`, `post()`, `patch()`, `del()` methods. Automatically adds `Authorization` header from localStorage.
- **`auth.js`**: Exposes `window.HonnetKE.auth` with `requireAuth(roles)`, `getToken()`, `getUser()`, `logout()`. Redirects to login page if unauthenticated.
- **`property.js`**: Shared helpers for property card rendering (`cardHtml()`), status badges (`statusBadge()`), and card navigation binding (`bindCardNavigation()`). Uses `data-property-id` attribute consistently.

### Page-Specific JS

- **`students.js`**: Handles browse, detail, booking, report, favourites, history, dashboard.
- **`landlord.js`**: Handles multi-step form, image upload, manage listings, bookings lifecycle, analytics, profile.
- **`admin.js`**: Handles dashboard stats, property approval/rejection, reports, user management, duplicate queue, profile.

### Design System

- **`variables.css`**: CSS custom properties for colors, spacing, typography, shadows.
- **`reset.css`**: Modern CSS reset.
- **`global.css`**: Shared components (buttons, cards, forms, navbar, footer).
- Each portal has its own CSS file for page-specific styles.

### Data Attributes

- `data-property-id`: Used on property cards for navigation and favourite toggling.
- `data-action`: Used on buttons to identify action types (approve, reject, suspend, resolve, etc.).
- `data-filter`: Used on filter tabs for table filtering.
- `data-page`: Set on `<body>` to identify the current page in JS.
- `data-status`: Used on table rows for status-based filtering.

---

## 8. Property Lifecycle

```
[Create] -> draft
    |
    | submit
    v
pending_approval
    |
    +-- admin approves --> active
    |                       |
    |                       | all slots filled
    |                       +--> fully_occupied
    |                       |     |
    |                       |     | slots free up
    |                       |     +--> active (auto)
    |
    +-- admin rejects ----> rejected
    |
    +-- admin suspends ---> suspended
    |
    +-- owner archives ---> archived
```

- **Availability**: Derived from `capacity` vs `occupied` fields.
  - `occupied < capacity` -> "Available"
  - `occupied > 0 && occupied < capacity` -> "Few Slots Left"
  - `occupied >= capacity` -> "Full"
- Only `active` and `fully_occupied` properties appear in public search.
- `draft` and `pending_approval` are visible only to the property owner and admins.

---

## 9. Booking Lifecycle

```
[Student creates booking] -> pending
    |
    +-- provider accepts --> accepted
    |                          |
    |                          | provider sends visit invitation
    |                          +--> visited
    |                                   |
    |                                   | provider marks completed
    |                                   +--> completed
    |
    +-- provider rejects ----> rejected
    |
    +-- student cancels -----> cancelled
    |
    +-- student cancels -----> cancelled (from any non-terminal state)
```

- Visit invitation fields: `visitDate`, `visitTime`, `meetingPoint`, `visitNotes`, `mapLink`.
- Notifications are sent on status changes and visit invitations.

---

## 10. Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Cloudinary account (for image uploads)
- Gmail/app password (for OTP emails)

### Backend

```bash
cd backend
npm install

# Configure environment
cp .env.example .env  # Edit with your values

# Database
npx prisma migrate dev --name init
npm run db:seed

# Start dev server
npm run dev
```

### Environment Variables

```
DATABASE_URL=postgresql://user:pass@localhost:5432/honnetke
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5500

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend

No build step required. Use VS Code Live Server or any static file server:

```bash
# Option 1: VS Code Live Server extension (recommended)
# Right-click frontend/index.html -> Open with Live Server

# Option 2: npx serve
cd frontend
npx serve -p 5500
```

### Seeded Admin Accounts

The seed script creates two admin accounts:
- `francis.wainaina@strathmore.edu`
- `shana.githu@strathmore.edu`

Passwords are in the seed file. These accounts are recreated on every `prisma migrate reset`.

### Useful Commands

```bash
# Database
npm run db:migrate     # Create + apply migration
npm run db:generate    # Regenerate Prisma client
npm run db:studio      # Open Prisma Studio (GUI)
npm run db:push        # Push schema without migration
npm run db:seed        # Run seed script

# Reset database (dev only - destroys all data)
npx prisma migrate reset
```

---

## 11. Deployment Notes

### Backend

- Set `NODE_ENV=production`
- Set `FRONTEND_URL` to the production frontend URL
- Run `npx prisma migrate deploy` to apply migrations
- Use a process manager (PM2, systemd) to keep the server running
- Configure a reverse proxy (nginx) for HTTPS

### Frontend

- Static files - deploy to any CDN or static host (Netlify, Vercel, GitHub Pages)
- Update the API base URL in `frontend/shared/js/api.js` if the backend is hosted elsewhere
- No build step needed

### Writing Standards

- **No Unicode em dashes**: Use regular hyphens (`-`) everywhere in code, comments, and UI text.
- **No mock data**: All data is fetched from the API. No hardcoded placeholder content in production.
- **Accessibility**: Skip links, ARIA labels, keyboard navigation, semantic HTML throughout.

---

*Generated as part of the HonnetKE platform rebuild. Last updated: June 2026.*
