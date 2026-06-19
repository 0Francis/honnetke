# HonnetKE — Sprint Log

> Append a new sprint block at the end after each sprint review.
> This file feeds directly into **Chapter 5.2 — Implementation Challenges and Adjustments / Deviations from Proposal**.

---

## Sprint 0 — Setup & Scaffolding

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Establish the project foundation — backend scaffold, database, Git workflow, and docs structure.

### Committed
- [ ] Initialize backend project (package.json, folder structure, dependencies)
- [ ] Configure `.env` and `.env.example`
- [ ] Create PostgreSQL database and run full schema (all 13 tables)
- [ ] Set up Git branching convention (`main` / `dev` / `feature/*`)
- [ ] Create `docs/` tracking files
- [ ] Create `appendices/` folder
- [ ] Partner: frontend folder structure, design tokens, CSS reset

### Completed
- [ ] _(fill in after sprint review)_

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:** _(e.g. tech stack changes, scope adjustments)_

---

## Sprint 1 — Authentication

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Full auth system for all roles — register, OTP verify, login with JWT, logout, role middleware.

### Committed
- [ ] US-01 Student register endpoint
- [ ] US-02 Landlord register endpoint
- [ ] US-03 Agent register endpoint
- [ ] US-04 OTP verification endpoint
- [ ] US-05 Login endpoint (all roles) + JWT generation
- [ ] US-06 Role-based redirect logic (JWT payload role field)
- [ ] US-07 Forgot password endpoint
- [ ] US-08 Logout
- [ ] Auth middleware (protect routes)
- [ ] Role-based access control middleware
- [ ] Partner: Landing page static HTML/CSS

### Completed
- [ ] _(fill in after sprint review)_

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 2 — Listings Core

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Full listings CRUD with Cloudinary image upload. Admin is notified on new listing submission.

### Committed
- [ ] US-09 Landlord create listing (`POST /listings` → status: pending)
- [ ] US-10 Agent create listing
- [ ] US-11 Image upload to Cloudinary (`POST /listings/:id/images`)
- [ ] US-12 Edit listing (`PATCH /listings/:id`)
- [ ] US-13 Deactivate listing
- [ ] US-14 Reactivate listing
- [ ] US-15 Delete listing
- [ ] US-16 Agent organise listings
- [ ] Trigger notification to admin on new listing
- [ ] Partner: US-FE-01 Landing page

### Completed
- [ ] _(fill in after sprint review)_

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 3 — Search & Discovery

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Public search/filter endpoint, listing detail, pagination. Partner delivers auth pages and hostels page.

### Committed
- [ ] US-17 Featured listings endpoint (`GET /listings?featured=true`)
- [ ] US-18 Search & filter endpoint (`GET /listings` with query params)
- [ ] US-19 Guest redirect logic (401 on protected listing detail)
- [ ] US-20 Listing detail endpoint (`GET /listings/:id`)
- [ ] US-21 Pagination on listing results
- [ ] Partner: US-FE-02 Sign Up page
- [ ] Partner: US-FE-03 Login page
- [ ] Partner: US-FE-04 OTP Verification page
- [ ] Partner: US-FE-05 Hostels page
- [ ] Partner: US-FE-06 Listing Detail page

### Completed
- [ ] _(fill in after sprint review)_

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 4 — Student Features

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Full student interaction set — favourites, bookings, contact, reports, student dashboard data.

### Committed
- [ ] US-22 Save listing to favourites (`POST /favourites`)
- [ ] US-23 Remove from favourites (`DELETE /favourites/:id`)
- [ ] US-24 Submit booking request (`POST /bookings`)
- [ ] US-25 Contact provider (external redirect — WhatsApp/call/SMS, no backend logic)
- [ ] US-26 Report listing (`POST /reports`)
- [ ] US-27 Student dashboard data endpoint
- [ ] Partner: US-FE-07 Student Dashboard
- [ ] Partner: US-FE-08 Favourites page
- [ ] Partner: US-FE-09 Visited History page

### Completed
- [ ] _(fill in after sprint review)_

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 5 — Provider Features

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Landlord/Agent booking management, analytics, notifications.

### Committed
- [ ] US-28 View bookings for my listings (`GET /bookings?provider=me`)
- [ ] US-29 Confirm / decline / cancel booking (`PATCH /bookings/:id`)
- [ ] US-30 Weekly analytics endpoint (`GET /analytics/:listing_id`)
- [ ] US-31 Mark notification as read (`PATCH /notifications/:id/read`)
- [ ] Analytics middleware (increment view count on listing detail view)
- [ ] Partner: US-FE-10 Landlord/Agent Dashboard

### Completed
- [ ] _(fill in after sprint review)_

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 6 — Admin Features

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Full admin moderation — listing review, reports, account management, system logs.

### Committed
- [ ] US-32 Admin notification on new listing (triggered from Sprint 2, confirmed working here)
- [ ] US-33 Get pending listings (`GET /admin/listings?status=pending`)
- [ ] US-34 Approve listing (`PATCH /admin/listings/:id/approve`)
- [ ] US-35 Decline listing (`PATCH /admin/listings/:id/decline`)
- [ ] US-36 Review reports (`GET /admin/reports`)
- [ ] US-37 Issue warning (`POST /admin/warnings`)
- [ ] US-38 Suspend account (`PATCH /admin/accounts/:id/suspend`)
- [ ] US-39 Reactivate account (`PATCH /admin/accounts/:id/reactivate`)
- [ ] US-40 View error logs (`GET /admin/errors`)
- [ ] US-41 View traffic logs (`GET /admin/traffic`)
- [ ] Partner: US-FE-11 Admin Dashboard

### Completed
- [ ] _(fill in after sprint review)_

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

## Sprint 7 — Notifications, Integration & Polish

**Dates:** ___ / ___ / 2025 → ___ / ___ / 2025
**Sprint Goal:** Notifications system, global error logging middleware, traffic logging, CORS config, full frontend-backend integration.

### Committed
- [ ] US-42 Get notifications (`GET /notifications` — role-aware)
- [ ] US-43 Mark notification as read
- [ ] Global error handler middleware → writes to `error_logs`
- [ ] Traffic logging middleware → increments `traffic_logs` daily
- [ ] CORS configuration for frontend origin
- [ ] Input validation (all endpoints)
- [ ] Partner: US-FE-12 404/Error page
- [ ] Full integration test pass — replace all mock data with real API calls
- [ ] Final Postman collection export

### Completed
- [ ] _(fill in after sprint review)_

### Carry-over
- _(none yet)_

### Retrospective
- **Went well:**
- **Blockers / challenges:**
- **Deviations from proposal:**

---

_Last updated: Sprint 0_
