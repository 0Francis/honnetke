# PROJECT_STATUS_TEMP_3.md

## HonnetKE - Complete Project Audit (Phase 1)

This document is the Phase 1 audit mandated by the Master Rebuild Prompt. It is a
fact-based review of the codebase as it currently exists, before any rebuild work
begins. Nothing in this document changes code; it defines the work.

Audit date: 2026-06-30
Branch audited: dev (synced with origin/main)

Legend:
- DONE: implemented and working
- PARTIAL: implemented but incomplete or buggy
- MISSING: not implemented at all
- RISK: correctness, security, or data-loss concern

---

## 0. System Snapshot

Backend:
- Node.js + Express (`backend/src/app.js`)
- Prisma ORM + PostgreSQL (`backend/prisma/schema.prisma`)
- JWT auth with 2FA OTP via email (`auth.controller.js`, `utils/otp.js`, `utils/mailer.js`)
- Cloudinary image uploads (`config/cloudinary`)
- Controllers: auth, listings, bookings, favourites, reports, notifications, analytics, admin
- Middleware: auth, role, error, traffic

Frontend:
- Static multi-page HTML/CSS/vanilla JS (no framework/build step)
- Portals: landing, login, signup, students, landlord, admin, error
- Shared JS: `frontend/shared/js/api.js`, `frontend/shared/js/auth.js`
- Per-portal CSS files (no shared design-system stylesheet)

---

## 1. Broken / Incomplete Features

### 1.1 Capacity and Availability System - MISSING (highest impact)
- The schema `Listing` model has no capacity, occupied, or availability fields.
- `bookings.controller.js` never adjusts occupancy and there is no overbooking guard.
- The prompt requires "Occupied: 3/5" plus Available / Few Slots Left / Full states,
  determined automatically. None of this exists in DB, API, or UI.

### 1.2 Booking Lifecycle - PARTIAL / RISK
- `BookingStatus` enum is `pending | confirmed | cancelled | declined`.
- The prompt requires `pending | accepted | rejected | cancelled | visited | completed`.
  "accepted/rejected/visited/completed" are not represented.
- `updateBookingStatus` only allows transitions FROM `pending`
  (`bookings.controller.js:190`). A student cannot cancel after acceptance, and a
  provider cannot mark a booking visited/completed.
- `Booking` has `@@unique([studentId, listingId])` (`schema.prisma:209`), which
  permanently blocks re-booking a listing after a cancellation.
- No capacity check on acceptance, so overbooking is possible by design.

### 1.3 Visit Invitation - MISSING
- The landlord/agent flow requires sending visit date, time, meeting notes, and a
  Google Maps location on acceptance. There are no schema fields, endpoints, emails,
  or UI for this.

### 1.4 Email System - PARTIAL
- `utils/mailer.js` implements only verification, login, and password-reset OTP emails.
- MISSING templates: booking accepted, booking rejected, visit invitation,
  listing approved, listing rejected, warnings.
- No shared branded layout beyond the single OTP template.

### 1.5 Notifications - PARTIAL
- `NotificationType` enum is only `listing_review | booking_update | system`.
- Working triggers: booking submitted, booking status change (`bookings.controller.js`),
  listing review (admin).
- MISSING/uncertain triggers: warnings, suspensions, announcements, report outcomes
  to the reporting student. No dedicated notification types for these.

### 1.6 Student Favourites Page - PARTIAL (frontend not wired)
- Backend `favourites.controller.js` + routes exist (add/remove/list).
- `frontend/students/favourites.html` renders hardcoded cards and does not call the API.

### 1.7 Student Visit History - MISSING
- `frontend/students/history.html` is fully static.
- No backend concept of "recently viewed" exists (only weekly `Analytics.viewCount`
  aggregate per listing, not per student).

### 1.8 Admin Duplicate Queue - MISSING (UI mockup only)
- `frontend/admin/duplicate-queue.html` is entirely hardcoded.
- No duplicate-detection endpoint or merge/keep/remove actions on the backend.

### 1.9 Landing Page - PARTIAL
- Featured listings ARE wired (`landing.js` calls `/listings?limit=6`).
- Hero stat counters animate hardcoded numbers (no API source).
- Contact form is a `mailto:` only (no backend).
- Guest gating uses `alert()` instead of a professional auth modal, and there is no
  "return to original action after login" flow.

### 1.10 Search and Filtering - PARTIAL
- `getListings` supports county, area, type, gender, room, price range, text search.
- MISSING filters from the prompt: amenities, availability, capacity, provider,
  distance, estate, structured university selection.

### 1.11 Image Management - PARTIAL
- Upload-only (`uploadImages`). MISSING: delete, reorder, set-primary endpoints, plus
  frontend drag-and-drop, preview, and client-side compression.

### 1.12 Property Types - PARTIAL / RISK
- `Listing.propertyType` is a free-text `String?` (`schema.prisma:140`), not constrained
  to the 12 required types. Frontend dropdowns expose only a small subset.

### 1.13 Listing Lifecycle - PARTIAL
- `ListingStatus` enum is `pending | active | inactive | blocked`.
- The prompt requires `draft | pending_approval | active | fully_occupied | suspended
  | rejected | archived`. Most states are unrepresented; badges are inconsistent.

### 1.14 Reporting Reasons - PARTIAL
- `Report.reason` is free text. The prompt requires enumerated reasons
  (Spam, Fraud, Wrong Information, Already Occupied, Inappropriate, Other).

### 1.15 Error Pages - PARTIAL
- A single `frontend/error/error.html` exists. Dedicated 404/500/offline/expired-session
  handling and retry actions are not consistently wired across the app.

---

## 2. Code Quality Review

### 2.1 Duplicated user models - RISK (major architectural smell)
- `Student`, `Landlord`, `Agent`, and `Admin` are four near-identical tables with the
  same auth fields. This forces:
  - Triple `findMany`/`groupBy` fan-out in `admin.controller.js::getUsers`.
  - Per-role id-field branching in nearly every controller
    (`bookings`, `notifications`, `listings`).
  - A polymorphic `Notification`/`Warning` shape with four nullable FKs.
- A single `User` model with a `role` enum (plus optional profile tables) would remove
  most of this branching. This is the highest-leverage refactor but also the riskiest
  (requires a data migration).

### 2.2 Large files
- `admin.controller.js` (~19.6 KB) mixes users, listings, reports, warnings, stats,
  and dashboard concerns. Should be split by concern.

### 2.3 Repeated provider/role logic
- `providerFilter`, `getProviderListingIds`, `getOwnedListing`, and `userFilter` repeat
  role-to-id mapping in multiple controllers. Centralize in a shared helper.

### 2.4 Frontend duplication
- `admin.css`, `landlord.css`, `students.css`, `login.css`, `landing.css` each
  redefine navbar, footer, buttons, badges, cards, and form styles.
- No shared design-system stylesheet and no shared component-render JS beyond
  `api.js`/`auth.js`. Card/badge/toast/modal markup is copy-pasted per page.

### 2.5 Hardcoded values and mock data
- Mock data remains in: admin duplicate-queue, student favourites, student history,
  landing hero stats. (Dashboards and tables that ARE wired still ship hardcoded
  placeholder rows in HTML.)
- Magic numbers (pagination caps, OTP TTL, similarity thresholds) are scattered.

### 2.6 Security middleware gaps - RISK
- `app.js` has no `helmet`, no rate limiting (login/OTP brute-force exposure),
  and no central input-validation layer (no `express-validator`/Zod).
- JWT is stored client-side via `auth.js` (review storage choice and expiry handling).
- File-upload validation (type/size limits) needs verification in `config/cloudinary`.

### 2.7 Tests - MISSING
- `docs/TEST_CASES.md` exists but there is no automated test suite (unit/integration/e2e).

---

## 3. UX Review (per page)

- Landing: strong visually; guest gating via `alert()` is unprofessional; contact form
  has no real submission; stat counters are fake.
- Authentication (login/signup/otp): functional 2FA flow; needs consistent error states,
  return-to-action after login, and shared modal styling.
- Student Portal (dashboard): dashboard wired; favourites and history pages are static.
- Property Listing (hostels): needs full filter set, availability badges, empty/loading
  states, and pagination controls.
- Property Details (listing): wired to API; missing deposit, rules, capacity/occupancy,
  availability, nearby services, and map; contact/report flows need auth gating.
- Landlord Dashboard: wired; needs booking accept/reject with visit-invitation UI and
  capacity display.
- Admin Dashboard: wired; duplicate queue is a mockup; moderation/warnings/suspension
  flows need end-to-end verification.
- Bookings: lifecycle incomplete (no visited/completed, no post-acceptance cancel).
- Notifications: dropdown/unread-count need consistent wiring across all portals.
- Search / Filtering: incomplete filter coverage; no shared filter component.
- Settings/Profile: profile pages exist (`*/profile.html`) - wiring needs verification.

Consistent global UX gaps: empty states, loading skeletons, confirmation dialogs,
and toasts are implemented ad hoc per page rather than as shared components.

---

## 4. Mobile / Responsiveness Review

- Per-portal CSS includes media queries (`admin.css`, `login.css`, `students.css`),
  so basic responsiveness exists, but it is implemented independently per portal.
- Known risk areas to verify on tablet / large phone / small phone:
  - Wide admin data tables (horizontal scroll was patched on `.data-table-wrapper`,
    needs a consistent responsive table pattern).
  - Filter bars and filter tabs (`flex-wrap`/`nowrap` overflow risk).
  - Listing detail gallery and contact card stacking.
  - Touch-target sizing on icon buttons (fav, password toggle, table actions).
- No single breakpoint scale is shared across portals (each file picks its own).

---

## 5. Em Dash Audit (Writing Standard)

- A project-wide scan for the em dash character found roughly 595 occurrences across
  ~57 files (source, HTML, CSS, and Markdown). These must be replaced with a hyphen
  or colon as appropriate before completion. This is a mechanical but wide-reaching pass.

---

## 6. Prioritized Rebuild Plan (Phase 2 proposal)

Ordered by impact and dependency. Risky/destructive items are flagged.

Tier A - Foundations (enables everything else):
1. Decision on the `User` unification refactor vs keeping four tables. (RISK: migration)
2. Schema changes: capacity/occupied on Property, expanded ListingStatus and
   BookingStatus enums, visit-invitation fields, enumerated report reasons,
   per-student view history. (RISK: Prisma migration)
3. Shared design-system CSS + shared component JS (cards, badges, modals, toasts,
   empty/loading states, tables, pagination).

Tier B - Core workflows:
4. Booking lifecycle + capacity logic (accept increments, cancel-after-accept
   decrements, overbooking prevention, visited/completed).
5. Visit invitation (fields + endpoint + email + notification + student view).
6. Notifications completeness (warnings, suspensions, reports, announcements).
7. Email templates (booking accepted/rejected, visit invite, listing approved/rejected,
   warnings) on a shared branded layout.
8. Wire favourites page and build visit-history feature end to end.

Tier C - Discovery and details:
9. Full search/filter set + availability badges + pagination UI.
10. Property details enrichment (deposit, rules, capacity, map, nearby services).
11. Professional guest auth modal + return-to-action flow.
12. Image management (delete/reorder/set-primary + drag-drop/preview/compression).

Tier D - Hardening and polish:
13. Security: helmet, rate limiting, central validation, upload limits.
14. Accessibility pass (ARIA, focus states, contrast, keyboard nav).
15. Responsiveness pass across all breakpoints with the shared system.
16. Remove all mock data, dead code, and unused CSS/JS.
17. Project-wide em dash removal + final verification scan.

Tier E - Documentation:
18. Generate `PROJECT_TECHNICAL_GUIDE.md` (28-section guide).

---

## 7. Open Decisions Needing Owner Input

1. User-table unification: proceed with a single `User` + role model (cleaner, but a
   real data migration), or keep the four-table design and centralize helpers instead?
2. Property rename: rename `Listing` -> `Property` in the DB/API (prompt's intent), or
   keep `Listing` internally and only adjust UI labels/property-type enum? Full rename
   touches every controller, route, and frontend API call.
3. Migration safety: is the current database disposable (dev seed only), or does it hold
   data that must be preserved through migrations?

These three answers determine how much of Tier A is safe to automate without review.
