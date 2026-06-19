# HonnetKE — Appendices Index

> Add a new row every time you capture a screenshot as evidence.
> Screenshots go in `honnetke/appendices/` using the filename convention below.
> Reference the **Appendix Label** inline in Chapter 5 text and in `TEST_CASES.md`.
>
> **Filename Convention:** `TC-[ID]-[short-description].png`
> **Example:** `TC-01-student-register-201.png`

---

## Appendix Table

| Appendix Label | Test Case ID | Functionality | Filename | Notes |
|---|---|---|---|---|
| Appendix A-1 | TC-01 | Student Registration — 201 success | `TC-01-student-register-201.png` | _(fill in after test)_ |
| Appendix A-2 | TC-01 | Student Registration — 409 duplicate email | `TC-01-student-register-409-dup-email.png` | _(fill in after test)_ |
| Appendix A-3 | TC-02 | OTP Verification — 200 success | `TC-02-otp-verify-200.png` | _(fill in after test)_ |
| Appendix A-4 | TC-02 | OTP Verification — 400 invalid OTP | `TC-02-otp-verify-400-invalid.png` | _(fill in after test)_ |
| Appendix A-5 | TC-03 | Student Login — 200 + JWT | `TC-03-student-login-200.png` | _(fill in after test)_ |
| Appendix A-6 | TC-03 | Student Login — 401 wrong password | `TC-03-student-login-401.png` | _(fill in after test)_ |
| Appendix A-7 | TC-04 | Landlord Registration & Login | `TC-04-landlord-register-login.png` | _(fill in after test)_ |
| Appendix A-8 | TC-05 | Role-Based Access Control — 403 wrong role | `TC-05-rbac-403.png` | _(fill in after test)_ |
| Appendix A-9 | TC-05 | Role-Based Access Control — 401 no token | `TC-05-rbac-401-no-token.png` | _(fill in after test)_ |
| Appendix A-10 | TC-06 | Forgot Password — 200 reset sent | `TC-06-forgot-password-200.png` | _(fill in after test)_ |
| Appendix B-1 | TC-07 | Create Listing — 201 success | `TC-07-create-listing-201.png` | _(fill in after test)_ |
| Appendix B-2 | TC-07 | Create Listing — admin notification triggered | `TC-07-create-listing-admin-notif.png` | _(fill in after test)_ |
| Appendix B-3 | TC-08 | Cloudinary Image Upload — 201 + URL saved | `TC-08-image-upload-201.png` | _(fill in after test)_ |
| Appendix B-4 | TC-09 | Edit Listing — 200 success | `TC-09-edit-listing-200.png` | _(fill in after test)_ |
| Appendix B-5 | TC-09 | Edit Listing — 403 wrong owner | `TC-09-edit-listing-403.png` | _(fill in after test)_ |
| Appendix C-1 | TC-10 | Search & Filter Listings — 200 with results | `TC-10-search-filter-200.png` | _(fill in after test)_ |
| Appendix C-2 | TC-11 | View Listing Detail — 200 student | `TC-11-listing-detail-200.png` | _(fill in after test)_ |
| Appendix D-1 | TC-12 | Save to Favourites — 201 success | `TC-12-save-favourite-201.png` | _(fill in after test)_ |
| Appendix D-2 | TC-12 | Save to Favourites — 409 duplicate | `TC-12-save-favourite-409.png` | _(fill in after test)_ |
| Appendix D-3 | TC-13 | Submit Booking — 201 success | `TC-13-booking-submit-201.png` | _(fill in after test)_ |
| Appendix D-4 | TC-14 | Report Listing — 201 success | `TC-14-report-listing-201.png` | _(fill in after test)_ |
| Appendix E-1 | TC-15 | Provider Confirms Booking — 200 success | `TC-15-booking-confirm-200.png` | _(fill in after test)_ |
| Appendix E-2 | TC-16 | View Analytics — 200 with weekly data | `TC-16-analytics-200.png` | _(fill in after test)_ |
| Appendix F-1 | TC-17 | Admin Approves Listing — 200 status active | `TC-17-admin-approve-200.png` | _(fill in after test)_ |
| Appendix F-2 | TC-18 | Admin Declines Listing — 200 status blocked | `TC-18-admin-decline-200.png` | _(fill in after test)_ |
| Appendix F-3 | TC-19 | Admin Warns User — 201 success | `TC-19-admin-warn-201.png` | _(fill in after test)_ |
| Appendix F-4 | TC-20 | Admin Suspends Account — 200 status suspended | `TC-20-admin-suspend-200.png` | _(fill in after test)_ |
| Appendix F-5 | TC-20 | Suspended User Login — 403 | `TC-20-suspended-login-403.png` | _(fill in after test)_ |
| Appendix F-6 | TC-21 | Admin Error Logs — 200 | `TC-21-error-logs-200.png` | _(fill in after test)_ |
| Appendix F-7 | TC-21 | Admin Traffic Logs — 200 | `TC-21-traffic-logs-200.png` | _(fill in after test)_ |
| Appendix G-1 | TC-22 | View Notifications — 200 role-aware | `TC-22-notifications-200.png` | _(fill in after test)_ |
| Appendix G-2 | TC-23 | Full Student Journey — end-to-end browser | `TC-23-student-journey-e2e.png` | _(fill in after test)_ |
| Appendix G-3 | TC-24 | Full Landlord Journey — end-to-end browser | `TC-24-landlord-journey-e2e.png` | _(fill in after test)_ |

---

## Appendix Groups Summary

| Group | Sprint | Coverage |
|---|---|---|
| **A** (A-1 to A-10) | Sprint 1 | Auth — registration, OTP, login, RBAC, forgot password |
| **B** (B-1 to B-5) | Sprint 2 | Listings core — create, upload, edit |
| **C** (C-1 to C-2) | Sprint 3 | Search, filter, listing detail |
| **D** (D-1 to D-4) | Sprint 4 | Student features — favourites, bookings, reports |
| **E** (E-1 to E-2) | Sprint 5 | Provider features — booking response, analytics |
| **F** (F-1 to F-7) | Sprint 6 | Admin features — approve, decline, warn, suspend, logs |
| **G** (G-1 to G-3) | Sprint 7 | Notifications, end-to-end integration tests |

---

_Last updated: Sprint 0 (index pre-populated — evidence to be captured per sprint)_
