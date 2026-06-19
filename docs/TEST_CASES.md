# HonnetKE — Test Cases

> One test case table per core functionality.
> Fill in **Actual Result**, **Pass/Fail**, and **Appendix** after each feature is implemented and tested.
> Tool: Postman (backend) / Browser (frontend).
> Screenshots saved in `appendices/` — referenced in the Appendix column.
> This file feeds directly into **Chapter 5.3 — Testing**.

---

## Sprint 1 — Auth

---

### TC-01 | Functional Test — Student Registration

| Field | Detail |
|---|---|
| **Test Case ID** | TC-01 |
| **Type of Test** | Functional |
| **Functionality Tested** | Student account registration |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `{ "full_name": "Jane Doe", "email": "jane@test.com", "phone_number": "0712345678", "password": "Test@1234", "role": "student" }` |
| **Expected Result** | `201 Created` — student record saved, OTP sent to phone number |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ — see `APPENDICES_INDEX.md` |

**Edge Cases to Also Test:**
- Duplicate email → expect `409 Conflict`
- Duplicate phone number → expect `409 Conflict`
- Missing required field → expect `400 Bad Request`

---

### TC-02 | Functional Test — OTP Verification

| Field | Detail |
|---|---|
| **Test Case ID** | TC-02 |
| **Type of Test** | Functional |
| **Functionality Tested** | Phone number verification via OTP |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `{ "phone_number": "0712345678", "otp": "123456" }` |
| **Expected Result** | `200 OK` — account verified, user can now log in |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

**Edge Cases:**
- Invalid OTP → expect `400 Bad Request`
- Expired OTP → expect `400 Bad Request`

---

### TC-03 | Functional Test — User Login (Student)

| Field | Detail |
|---|---|
| **Test Case ID** | TC-03 |
| **Type of Test** | Functional |
| **Functionality Tested** | Student login and JWT generation |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `{ "email": "jane@test.com", "password": "Test@1234" }` |
| **Expected Result** | `200 OK` — JWT returned, payload contains `role: "student"` |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

**Edge Cases:**
- Wrong password → expect `401 Unauthorized`
- Non-existent email → expect `401 Unauthorized`
- Suspended account → expect `403 Forbidden`

---

### TC-04 | Functional Test — Landlord Registration & Login

| Field | Detail |
|---|---|
| **Test Case ID** | TC-04 |
| **Type of Test** | Functional |
| **Functionality Tested** | Landlord account registration and login |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `{ "full_name": "John Mwangi", "email": "john@landlord.com", "phone_number": "0722345678", "password": "Test@1234", "role": "landlord" }` |
| **Expected Result** | Register: `201 Created`. Login: `200 OK`, `role: "landlord"` in JWT |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-05 | Functional Test — Role-Based Access Control

| Field | Detail |
|---|---|
| **Test Case ID** | TC-05 |
| **Type of Test** | Security / Functional |
| **Functionality Tested** | Protected routes reject unauthorised roles |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | Student JWT used on a landlord-only endpoint (e.g. `POST /listings`) |
| **Expected Result** | `403 Forbidden` |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

**Also Test:**
- No token on protected route → expect `401 Unauthorized`
- Guest accessing student-only listing detail → expect `401 Unauthorized`

---

### TC-06 | Functional Test — Forgot Password

| Field | Detail |
|---|---|
| **Test Case ID** | TC-06 |
| **Type of Test** | Functional |
| **Functionality Tested** | Password reset email/link trigger |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `{ "email": "jane@test.com" }` |
| **Expected Result** | `200 OK` — reset link sent to registered email |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

## Sprint 2 — Listings Core

---

### TC-07 | Functional Test — Create Listing (Landlord)

| Field | Detail |
|---|---|
| **Test Case ID** | TC-07 |
| **Type of Test** | Functional |
| **Functionality Tested** | Landlord creates a new property listing |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `{ "title": "Sunny Bedsitter", "description": "...", "price": 8000, "county": "Nairobi", "area": "Ruaka", "nearest_campus": "USIU", "room_type": "single", "gender_preference": "mixed", "property_type": "bedsitter", "amenities": ["WiFi", "Water"] }` |
| **Expected Result** | `201 Created` — listing saved with `status: "pending"`, admin notification triggered |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-08 | Functional Test — Listing Image Upload (Cloudinary)

| Field | Detail |
|---|---|
| **Test Case ID** | TC-08 |
| **Type of Test** | Functional / Integration |
| **Functionality Tested** | Image upload to Cloudinary, URL stored in `listing_images` |
| **Test Environment** | Local — Node.js, Cloudinary API, Postman |
| **Test Tool** | Postman (multipart/form-data) |
| **Test Data** | Image file attached to `POST /listings/:id/images` |
| **Expected Result** | `201 Created` — Cloudinary URL saved in `listing_images` table |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-09 | Functional Test — Edit Listing

| Field | Detail |
|---|---|
| **Test Case ID** | TC-09 |
| **Type of Test** | Functional |
| **Functionality Tested** | Landlord/agent edits their own listing |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `PATCH /listings/:id` with `{ "price": 9500 }` |
| **Expected Result** | `200 OK` — listing updated. Editing another owner's listing → `403 Forbidden` |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

## Sprint 3 — Search & Discovery

---

### TC-10 | Functional Test — Search & Filter Listings

| Field | Detail |
|---|---|
| **Test Case ID** | TC-10 |
| **Type of Test** | Functional |
| **Functionality Tested** | Public listing search with filters |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `GET /listings?county=Nairobi&price_max=10000&room_type=single&gender=mixed` |
| **Expected Result** | `200 OK` — filtered list of active listings only, paginated |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-11 | Functional Test — View Listing Detail (Student)

| Field | Detail |
|---|---|
| **Test Case ID** | TC-11 |
| **Type of Test** | Functional |
| **Functionality Tested** | Student views full listing detail |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `GET /listings/:id` with student JWT |
| **Expected Result** | `200 OK` — listing data including images, amenities, and provider contact info |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

## Sprint 4 — Student Features

---

### TC-12 | Functional Test — Save Listing to Favourites

| Field | Detail |
|---|---|
| **Test Case ID** | TC-12 |
| **Type of Test** | Functional |
| **Functionality Tested** | Student saves a listing to favourites |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `POST /favourites` with `{ "listing_id": 1 }`, student JWT |
| **Expected Result** | `201 Created` — favourite record saved. Duplicate save → `409 Conflict` |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-13 | Functional Test — Submit Booking Request

| Field | Detail |
|---|---|
| **Test Case ID** | TC-13 |
| **Type of Test** | Functional |
| **Functionality Tested** | Student submits a booking request for a listing |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `POST /bookings` with `{ "listing_id": 1, "request_note": "I need the room by 1st." }`, student JWT |
| **Expected Result** | `201 Created` — booking saved with `status: "pending"`, provider notified |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-14 | Functional Test — Report a Listing

| Field | Detail |
|---|---|
| **Test Case ID** | TC-14 |
| **Type of Test** | Functional |
| **Functionality Tested** | Student reports a listing for admin review |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `POST /reports` with `{ "listing_id": 1, "reason": "Fake listing, images stolen." }`, student JWT |
| **Expected Result** | `201 Created` — report saved with `status: "pending"`, admin notified |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

## Sprint 5 — Provider Features

---

### TC-15 | Functional Test — Provider Responds to Booking

| Field | Detail |
|---|---|
| **Test Case ID** | TC-15 |
| **Type of Test** | Functional |
| **Functionality Tested** | Landlord/agent confirms or declines a booking request |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `PATCH /bookings/:id` with `{ "status": "confirmed", "provider_response": "Room is available." }`, landlord JWT |
| **Expected Result** | `200 OK` — booking status updated, student notified |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-16 | Functional Test — View Listing Analytics

| Field | Detail |
|---|---|
| **Test Case ID** | TC-16 |
| **Type of Test** | Functional |
| **Functionality Tested** | Landlord/agent views weekly view count analytics for a listing |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `GET /analytics/:listing_id`, landlord JWT |
| **Expected Result** | `200 OK` — array of `{ week_start, view_count }` records for last 30 days |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

## Sprint 6 — Admin Features

---

### TC-17 | Functional Test — Admin Approves a Listing

| Field | Detail |
|---|---|
| **Test Case ID** | TC-17 |
| **Type of Test** | Functional |
| **Functionality Tested** | Admin approves a pending listing |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `PATCH /admin/listings/:id/approve`, admin JWT |
| **Expected Result** | `200 OK` — listing `status` updated to `"active"`, `approved_by` and `approved_at` populated, landlord/agent notified |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-18 | Functional Test — Admin Declines a Listing

| Field | Detail |
|---|---|
| **Test Case ID** | TC-18 |
| **Type of Test** | Functional |
| **Functionality Tested** | Admin declines a pending listing with a reason |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `PATCH /admin/listings/:id/decline` with `{ "decline_reason": "Images do not match description." }`, admin JWT |
| **Expected Result** | `200 OK` — listing `status` updated to `"blocked"`, `decline_reason` saved, provider notified |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-19 | Functional Test — Admin Warns a User

| Field | Detail |
|---|---|
| **Test Case ID** | TC-19 |
| **Type of Test** | Functional |
| **Functionality Tested** | Admin issues a formal warning to a student, landlord, or agent |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `POST /admin/warnings` with `{ "student_id": 1, "reason": "Abusive report filed." }`, admin JWT |
| **Expected Result** | `201 Created` — warning record saved, user notified |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-20 | Functional Test — Admin Suspends and Reactivates Account

| Field | Detail |
|---|---|
| **Test Case ID** | TC-20 |
| **Type of Test** | Functional |
| **Functionality Tested** | Admin suspends then reactivates a user account |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `PATCH /admin/accounts/:id/suspend` then `PATCH /admin/accounts/:id/reactivate`, admin JWT |
| **Expected Result** | Suspend: `200 OK`, account `status: "suspended"`. Reactivate: `200 OK`, `status: "active"`. Suspended user login → `403 Forbidden` |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-21 | Functional Test — Admin Views Error Logs & Traffic Logs

| Field | Detail |
|---|---|
| **Test Case ID** | TC-21 |
| **Type of Test** | Functional |
| **Functionality Tested** | Admin views system error logs and daily traffic logs |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `GET /admin/errors` and `GET /admin/traffic`, admin JWT |
| **Expected Result** | `200 OK` — list of error log records; list of `{ date, visit_count }` records |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

## Sprint 7 — Notifications & Integration

---

### TC-22 | Functional Test — View & Read Notifications

| Field | Detail |
|---|---|
| **Test Case ID** | TC-22 |
| **Type of Test** | Functional |
| **Functionality Tested** | Any logged-in user can view and mark notifications as read |
| **Test Environment** | Local — Node.js, PostgreSQL, Postman |
| **Test Tool** | Postman |
| **Test Data** | `GET /notifications` with student JWT; `PATCH /notifications/:id/read` |
| **Expected Result** | `200 OK` — list of notifications for the logged-in user only. Mark read: `is_read: true` |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-23 | Integration Test — Full User Journey (Student)

| Field | Detail |
|---|---|
| **Test Case ID** | TC-23 |
| **Type of Test** | Integration / End-to-End |
| **Functionality Tested** | Complete student flow: register → verify OTP → login → search → view listing → book → receive notification |
| **Test Environment** | Local — Frontend + Backend running together, Browser |
| **Test Tool** | Browser (Chrome), Postman (backend verification) |
| **Test Data** | New student account, live listing in DB |
| **Expected Result** | All steps complete without error, booking appears in DB with `status: "pending"`, notification created |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

### TC-24 | Integration Test — Full Provider Journey (Landlord)

| Field | Detail |
|---|---|
| **Test Case ID** | TC-24 |
| **Type of Test** | Integration / End-to-End |
| **Functionality Tested** | Landlord flow: register → login → create listing → upload image → listing approved by admin → booking received → booking confirmed |
| **Test Environment** | Local — Frontend + Backend, Browser |
| **Test Tool** | Browser (Chrome), Postman |
| **Test Data** | New landlord account, admin account seeded in DB |
| **Expected Result** | All steps complete. Listing moves from `pending` → `active`. Booking moves from `pending` → `confirmed` |
| **Actual Result** | _(fill in after test)_ |
| **Pass / Fail** | _(fill in)_ |
| **Evidence** | Appendix ___ |

---

_Last updated: Sprint 0 (shells created — results to be filled in per sprint)_
