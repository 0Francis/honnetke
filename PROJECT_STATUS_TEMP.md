# HonnetKE — Project Status (Temp Snapshot)

> Working scratch doc. Captures where the project stands across frontend and backend as of this check-in. Delete or fold into `docs/SPRINT_LOG.md` once reviewed.

**Last updated:** 22 Jun 2026

---

## Summary

- **Frontend:** All static pages built and wired to the backend via a shared API client (`frontend/shared/js/api.js`). Auth, student, landlord, and landing flows make real API calls. Admin dashboard and error page exist as placeholders.
- **Backend:** Sprints 0–5 implemented. Auth, listings CRUD, search/filter, favourites, bookings, reports, and analytics are all functional with real business logic. Cloudinary image upload is working and tested.
- **Integration:** Live. Frontend pages use `window.HonnetKE.api` to call backend endpoints. Auth flow (register → OTP → login → JWT → role redirect) is fully wired end-to-end.
- **Remaining:** Admin controller (Sprint 6) and notifications controller (Sprint 7) are still stubs. Admin frontend is a placeholder. Input validation (`express-validator`) is not yet wired.

---

## What the System Can Do Right Now

### Authentication (Sprint 1 — Done)
- **Register** (`POST /api/auth/register`) — Students, landlords, and agents self-register with name, email, phone, password. Password is hashed via bcrypt. OTP code is generated and emailed via nodemailer.
- **Verify OTP** (`POST /api/auth/verify-otp`) — User enters 6-digit code from email. Code is bcrypt-verified against DB. On success, account is marked verified and JWT is issued.
- **Login** (`POST /api/auth/login`) — Email + password validated against role-specific table. If correct, a login OTP is emailed (2FA). JWT issued only after OTP verification at `/verify-otp`.
- **Forgot password** (`POST /api/auth/forgot-password`) — Sends a reset OTP to the user's email.
- **Reset password** (`POST /api/auth/reset-password`) — Verifies reset OTP and sets a new hashed password.
- **Resend OTP** (`POST /api/auth/resend-otp`) — Resends a fresh code if the previous one expired.
- **Logout** (`POST /api/auth/logout`) — Client-side token discard.
- **Frontend:** Login page, signup page, and OTP page all call the real API. Role-based redirect sends users to the correct dashboard after login.

### Listings CRUD (Sprint 2 — Done)
- **Create** (`POST /api/listings`) — Landlord/agent creates a listing with title, description, price, location, room type, gender preference, amenities. Status defaults to `pending` (awaiting admin approval). Admin is notified.
- **Edit** (`PATCH /api/listings/:id`) — Owner can update listing fields. Ownership is verified.
- **Delete** (`DELETE /api/listings/:id`) — Owner permanently deletes a listing.
- **Deactivate** (`PATCH /api/listings/:id/deactivate`) — Hides listing from search without deleting.
- **Reactivate** (`PATCH /api/listings/:id/reactivate`) — Re-submits listing for admin review.
- **Upload images** (`POST /api/listings/:id/images`) — Multipart form upload (up to 10 images, 5MB each). Files are stored in Cloudinary under `honnetke/listings/`, auto-resized to 1200×800. URLs saved to DB as `ListingImage` records. First image auto-marked as primary. **Tested and confirmed working.**
- **Frontend:** Landlord create-listing page, manage-listings page, and dashboard all call the real API. Edit mode loads existing listing data.

### Search & Discovery (Sprint 3 — Done)
- **Browse listings** (`GET /api/listings`) — Public endpoint with query filters: `q` (search), `area`, `county`, `nearestCampus`, `propertyType`, `roomType`, `genderPreference`, `minPrice`, `maxPrice`, `status`, `limit`, `page`. Returns paginated results with images.
- **Listing detail** (`GET /api/listings/:id`) — Public endpoint returning full listing data including images, amenities, and provider contact info. Non-owners can only see active/approved listings. View count is incremented for analytics.
- **Frontend:** Landing page fetches featured listings. Student dashboard fetches recent listings. Student listing detail page fetches by ID from URL param.

### Student Features (Sprint 4 — Done)
- **Favourites** — Add (`POST /api/favourites`), remove (`DELETE /api/favourites/:listingId`), list (`GET /api/favourites`). Students can save/unsave listings. Frontend heart toggle wired to API.
- **Bookings** (`POST /api/bookings`) — Student submits a booking request for a listing with an optional note. Duplicate check prevents multiple pending bookings for the same listing. Provider is notified.
- **Reports** (`POST /api/reports`) — Student reports a listing for fraud/inappropriate content. Admin is notified.
- **Frontend:** Student dashboard fetches listings, listing detail page supports booking modal + report modal, favourite toggle calls real API.

### Provider Features (Sprint 5 — Done)
- **View bookings** (`GET /api/bookings`) — Landlord/agent sees bookings for their listings. Optional `status` filter. Students see their own bookings. Admins see all.
- **Manage bookings** (`PATCH /api/bookings/:id`) — Landlord/agent can confirm or decline bookings. Students can cancel their own pending bookings. Status transitions are validated. Notifications sent on status change.
- **Analytics** (`GET /api/analytics/:listingId`) — Per-listing view counts and weekly breakdown.
- **Overview analytics** (`GET /api/analytics`) — Aggregated stats across all of a provider's listings (total listings, total views, total bookings, pending bookings, active listings).
- **Frontend:** Landlord dashboard fetches real booking counts and analytics overview. Bookings page shows real data with confirm/decline buttons wired. Analytics page shows real view counts and charts.

### Infrastructure (Sprint 0 — Done)
- **Prisma schema** — 13 models + all enums. Migrations and seed applied.
- **Seed data** — 7 pre-seeded users (2 admins, 2 students, 2 landlords, 1 agent) with real emails and password `Honnetke123!`. 4 sample listings (no images — images now uploaded via Cloudinary).
- **Middleware** — JWT auth (`protect`), role-based access (`allowRoles`), traffic logging, global error handler.
- **Config** — Prisma singleton, Cloudinary config with multer storage, nodemailer transporter.
- **Shared API client** — `frontend/shared/js/api.js` provides `window.HonnetKE.api` with `get`, `post`, `patch`, `del` methods. Auto-attaches JWT from localStorage/sessionStorage. Base URL: `http://localhost:5000/api`.
- **Shared auth client** — `frontend/shared/js/auth.js` provides `isLoggedIn`, `getUser`, `requireAuth`, `logout`, `redirectToDashboard`.

---

## What Is NOT Done Yet

### Admin Controller (Sprint 6 — Stubs)
All admin endpoints return `501 Not implemented`:
- `GET /api/admin/listings?status=pending` — pending listings
- `PATCH /api/admin/listings/:id/approve` — approve listing
- `PATCH /api/admin/listings/:id/decline` — decline listing with reason
- `GET /api/admin/reports` — review reports
- `PATCH /api/admin/reports/:id` — resolve report
- `POST /api/admin/warnings` — issue warning
- `PATCH /api/admin/accounts/:id/suspend` — suspend account
- `PATCH /api/admin/accounts/:id/reactivate` — reactivate account
- `GET /api/admin/errors` — error logs
- `GET /api/admin/traffic` — traffic logs

### Notifications Controller (Sprint 7 — Stubs)
- `GET /api/notifications` — role-aware notification list
- `PATCH /api/notifications/:id/read` — mark as read

### Frontend Gaps
- **Admin dashboard** (`frontend/admin/coming-soon.html`) — placeholder page only.
- **Error page** (`frontend/error/error.html`) — exists but not integrated into routing.
- **Image upload UI** — Backend works, but landlord dashboard has no file upload widget yet.
- **Favourites page** (`frontend/students/favourites.html`) — page exists but not wired to API.
- **History page** (`frontend/students/history.html`) — page exists but not wired to API.
- **Input validation** — `express-validator` is installed but not used on any endpoint.

---

## Next Steps

1. **Sprint 6 — Admin Controller** — Implement all 10 admin endpoints (pending listings, approve/decline, reports, warnings, suspend/reactivate, error/traffic logs). Build the admin dashboard frontend.
2. **Sprint 7 — Notifications** — Implement `getNotifications` (role-aware query) and `markAsRead`. Wire notification bell/dropdown on dashboards.
3. **Frontend polish:**
   - Add image upload widget to landlord create/edit listing page.
   - Wire student favourites page to `GET /api/favourites`.
   - Wire student history page to `GET /api/bookings` (student's own bookings).
   - Integrate 404/error page into routing.
4. **Validation** — Add `express-validator` middleware to all endpoints (auth inputs, listing fields, booking/report payloads).
5. **Testing** — End-to-end integration test pass. Postman collection export.
