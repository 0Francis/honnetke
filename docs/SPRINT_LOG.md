# HonnetKE - Sprint Log

> Append a new sprint block at the end after each sprint review.
> This file feeds directly into **Chapter 5.2 - Implementation Challenges and Adjustments / Deviations from Proposal**.

---

## Sprint 0 - Setup & Scaffolding

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Establish the project foundation - backend scaffold, database, Git workflow, and docs structure.

### Committed
- [x] Initialize backend project (package.json, folder structure, dependencies)
- [x] Configure `.env` and `.env.example`
- [x] Create PostgreSQL database and run full schema (all 13 tables)
- [ ] Set up Git branching convention (`main` / `dev` / `feature/*`)
- [x] Create `docs/` tracking files
- [x] Create `appendices/` folder
- [x] Partner: frontend folder structure, design tokens, CSS reset

### Completed
- [x] Backend project initialized with Express, Prisma, all dependencies
- [x] `.env` configured with DATABASE_URL, JWT_SECRET, Cloudinary, mail credentials
- [x] PostgreSQL schema applied - 13 models, all enums, migrations + seed
- [x] Docs structure created (PRODUCT_BACKLOG, SPRINT_LOG, TECH_STACK, TEST_CASES, APPENDICES_INDEX)
- [x] Frontend folder structure with shared CSS/JS, all page directories

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:** _(e.g. tech stack changes, scope adjustments)_

---

## Sprint 1 - Authentication

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Full auth system for all roles - register, OTP verify, login with JWT, logout, role middleware.

### Committed
- [x] US-01 Student register endpoint
- [x] US-02 Landlord register endpoint
- [x] US-03 Agent register endpoint
- [x] US-04 OTP verification endpoint
- [x] US-05 Login endpoint (all roles) + JWT generation
- [x] US-06 Role-based redirect logic (JWT payload role field)
- [x] US-07 Forgot password endpoint
- [x] US-08 Logout
- [x] Auth middleware (protect routes)
- [x] Role-based access control middleware
- [x] Partner: Landing page static HTML/CSS

### Completed
- [x] Register endpoint - bcrypt hashing, OTP via nodemailer, role-specific table insertion
- [x] Verify OTP endpoint - bcrypt code comparison, account activation, JWT issuance
- [x] Login endpoint - 2FA with emailed OTP, JWT only after verification
- [x] Forgot/reset password - reset OTP flow
- [x] Resend OTP endpoint
- [x] JWT auth middleware + role-based access control
- [x] Frontend: login, signup, OTP pages all wired to real API

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 2 - Listings Core

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Full listings CRUD with Cloudinary image upload. Admin is notified on new listing submission.

### Committed
- [x] US-09 Landlord create listing (`POST /listings` → status: pending)
- [x] US-10 Agent create listing
- [x] US-11 Image upload to Cloudinary (`POST /listings/:id/images`)
- [x] US-12 Edit listing (`PATCH /listings/:id`)
- [x] US-13 Deactivate listing
- [x] US-14 Reactivate listing
- [x] US-15 Delete listing
- [ ] US-16 Agent organise listings
- [x] Trigger notification to admin on new listing
- [x] Partner: US-FE-01 Landing page

### Completed
- [x] Full listings CRUD with ownership checks (landlordId/agentId match)
- [x] Cloudinary upload - multer-storage-cloudinary, 10 images max, 5MB each, auto-resize 1200×800
- [x] Admin notification on new listing creation
- [x] Frontend: create-listing, manage-listings, edit mode all wired to API

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 3 - Search & Discovery

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Public search/filter endpoint, listing detail, pagination. Partner delivers auth pages and hostels page.

### Committed
- [x] US-17 Featured listings endpoint (`GET /listings?limit=6`)
- [x] US-18 Search & filter endpoint (`GET /listings` with query params)
- [x] US-19 Guest redirect logic (optional protect middleware)
- [x] US-20 Listing detail endpoint (`GET /listings/:id`)
- [x] US-21 Pagination on listing results
- [x] Partner: US-FE-02 Sign Up page
- [x] Partner: US-FE-03 Login page
- [x] Partner: US-FE-04 OTP Verification page
- [x] Partner: US-FE-05 Hostels page
- [x] Partner: US-FE-06 Listing Detail page

### Completed
- [x] getListings with full query filters (q, area, county, campus, type, gender, room, price range, status)
- [x] getListingById with images, amenities, view count increment, active-status enforcement
- [x] Pagination with page/limit/total/pages metadata
- [x] Frontend: landing page featured listings, student dashboard, listing detail page all wired

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 4 - Student Features

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Full student interaction set - favourites, bookings, contact, reports, student dashboard data.

### Committed
- [x] US-22 Save listing to favourites (`POST /favourites`)
- [x] US-23 Remove from favourites (`DELETE /favourites/:id`)
- [x] US-24 Submit booking request (`POST /bookings`)
- [x] US-25 Contact provider (external redirect - WhatsApp/call/SMS, no backend logic)
- [x] US-26 Report listing (`POST /reports`)
- [x] US-27 Student dashboard data endpoint
- [x] Partner: US-FE-07 Student Dashboard
- [ ] Partner: US-FE-08 Favourites page
- [ ] Partner: US-FE-09 Visited History page

### Completed
- [x] Favourites controller - add, remove, list with listing includes
- [x] Bookings controller - create with duplicate check, provider notification
- [x] Reports controller - create with listing validation, admin notification
- [x] Frontend: student dashboard, listing detail (booking modal + report modal), favourite toggle wired

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 5 - Provider Features

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Landlord/Agent booking management, analytics, notifications.

### Committed
- [x] US-28 View bookings for my listings (`GET /bookings`)
- [x] US-29 Confirm / decline / cancel booking (`PATCH /bookings/:id`)
- [x] US-30 Weekly analytics endpoint (`GET /analytics/:listing_id`)
- [ ] US-31 Mark notification as read (`PATCH /notifications/:id/read`)
- [x] Analytics middleware (increment view count on listing detail view)
- [x] Partner: US-FE-10 Landlord/Agent Dashboard

### Completed
- [x] getBookings - role-based filtering (landlord/agent sees own listings' bookings, student sees own, admin sees all)
- [x] updateBookingStatus - permission checks, status transition validation, notifications
- [x] getAnalytics - per-listing view counts and weekly breakdown
- [x] getOverviewAnalytics - aggregated stats across provider's listings
- [x] Frontend: landlord dashboard, bookings page (confirm/decline buttons), analytics page all wired

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 6 - Admin Features

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Full admin moderation - listing review, reports, account management, system logs.

### Committed
- [x] US-32 Admin notification on new listing (triggered from Sprint 2, confirmed working here)
- [x] US-33 Get pending listings (`GET /admin/listings?status=pending`)
- [x] US-34 Approve listing (`PATCH /admin/listings/:id/approve`)
- [x] US-35 Decline listing (`PATCH /admin/listings/:id/decline`)
- [x] US-36 Review reports (`GET /admin/reports`)
- [x] US-37 Issue warning (`POST /admin/warnings`)
- [x] US-38 Suspend account (`PATCH /admin/accounts/:id/suspend`)
- [x] US-39 Reactivate account (`PATCH /admin/accounts/:id/reactivate`)
- [x] US-40 View error logs (`GET /admin/errors`)
- [x] US-41 View traffic logs (`GET /admin/traffic`)
- [x] Partner: US-FE-11 Admin Dashboard

### Completed
- [x] All 10 admin endpoints implemented in `admin.controller.js` with real Prisma logic
- [x] Added `GET /admin/stats` (dashboard overview counts) and `GET /admin/users` (cross-role user list with warning counts)
- [x] Approve sets status→active + approvedBy/approvedAt + notifies provider; decline sets status→blocked + declineReason + notifies provider
- [x] Report resolution + warnings + suspend/reactivate all notify the affected user
- [x] Admin frontend (`frontend/admin/js/admin.js`) rewritten to be fully data-driven - live fetch + render + real API actions on dashboard, manage-listings, manage-users, flagged-listings
- [x] Verified end-to-end against live DB: stats, users, listings, approve, notifications all return real data

### Carry-over
- Duplicate-queue page has no backend (no duplicate-detection model) - left as local-only UI

### Retrospective
- **Went well:** Routes were already scaffolded, so controller logic dropped in cleanly. Schema already had approvedBy/declineReason/resolution fields.
- **Blockers / challenges:** No delete-user endpoint exists; Delete button omitted from the dynamic user table to avoid a broken action.
- **Deviations from proposal:** Decline reuses the `blocked` ListingStatus (no separate `rejected` state).

---

## Sprint 7 - Notifications, Integration & Polish

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Notifications system, global error logging middleware, traffic logging, CORS config, full frontend-backend integration.

### Committed
- [x] US-42 Get notifications (`GET /notifications` - role-aware)
- [x] US-43 Mark notification as read
- [x] Global error handler middleware → writes to `error_logs`
- [x] Traffic logging middleware → increments `traffic_logs` daily
- [ ] CORS configuration for frontend origin
- [ ] Input validation (all endpoints)
- [ ] Partner: US-FE-12 404/Error page
- [ ] Full integration test pass - replace all mock data with real API calls
- [ ] Final Postman collection export

### Completed
- [x] `notifications.controller.js` implemented - role-aware `getNotifications` (with unreadCount) + ownership-checked `markAsRead`
- [x] Notification bell badge wired on all admin pages
- [x] Error/traffic logging middleware confirmed writing to DB (feeds admin error/traffic endpoints)
- [ ] CORS, validation, 404 page, full integration pass, Postman export - still pending

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

_Last updated: Sprint 6 + notifications (27 Jun 2026)_
