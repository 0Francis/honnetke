# HonnetKE - Product Backlog

> Update the **Status** and **Sprint** columns as work progresses.
> Statuses: `Backlog` | `In Progress` | `Done`

---

## Epic 1 - Auth & Account Management

| ID | User Story | Role | Sprint | Status |
|---|---|---|---|---|
| US-01 | As a student, I can register an account with my name, email, phone, and password | Student | 1 | Done |
| US-02 | As a landlord, I can register an account with my name, email, phone, and password | Landlord | 1 | Done |
| US-03 | As an agent, I can register an account with my name, email, phone, and password | Agent | 1 | Done |
| US-04 | As a new user, I receive an OTP on my phone to verify my account after registration | Student / Landlord / Agent | 1 | Done |
| US-05 | As a registered user, I can log in with my email and password | Student / Landlord / Agent / Admin | 1 | Done |
| US-06 | As a logged-in user, the system reads my role and redirects me to the correct dashboard | All roles | 1 | Done |
| US-07 | As a user who forgot my password, I can request a reset via my registered email | Student / Landlord / Agent | 1 | Done |
| US-08 | As a logged-in user, I can log out of my account | All roles | 1 | Done |

---

## Epic 2 - Listings (Core)

| ID | User Story | Role | Sprint | Status |
|---|---|---|---|---|
| US-09 | As a landlord, I can create a new listing with title, description, price, location, room type, gender preference, and amenities | Landlord | 2 | Done |
| US-10 | As an agent, I can create a new listing on behalf of a property owner | Agent | 2 | Done |
| US-11 | As a landlord/agent, I can upload images for a listing (stored via Cloudinary) | Landlord / Agent | 2 | Done |
| US-12 | As a landlord/agent, I can edit an existing listing I own | Landlord / Agent | 2 | Done |
| US-13 | As a landlord/agent, I can deactivate a listing to hide it from search results | Landlord / Agent | 2 | Done |
| US-14 | As a landlord/agent, I can reactivate a previously deactivated listing | Landlord / Agent | 2 | Done |
| US-15 | As a landlord/agent, I can delete a listing permanently | Landlord / Agent | 2 | Done |
| US-16 | As an agent, I can organise my client-owner listings into groups | Agent | 2 | Backlog |

---

## Epic 3 - Search & Discovery

| ID | User Story | Role | Sprint | Status |
|---|---|---|---|---|
| US-17 | As a guest, I can browse the landing page and see featured listings | Guest | 3 | Done |
| US-18 | As a guest or student, I can search listings by location, price, property type, gender preference, and room type | Guest / Student | 3 | Done |
| US-19 | As a guest, clicking a listing card redirects me to the login page | Guest | 3 | Done |
| US-20 | As a student, I can view the full details of a listing including images, amenities, and contact info | Student | 3 | Done |
| US-21 | As a guest or student, I can see paginated search results | Guest / Student | 3 | Done |

---

## Epic 4 - Student Features

| ID | User Story | Role | Sprint | Status |
|---|---|---|---|---|
| US-22 | As a student, I can save a listing to my favourites | Student | 4 | Done |
| US-23 | As a student, I can remove a listing from my favourites | Student | 4 | Done |
| US-24 | As a student, I can submit a booking request for a listing | Student | 4 | Done |
| US-25 | As a student, I can contact a landlord/agent via WhatsApp, call, or SMS | Student | 4 | Done |
| US-26 | As a student, I can report a listing for inappropriate content or fraud | Student | 4 | Done |
| US-27 | As a student, I can view my dashboard with recent activity and featured listings | Student | 4 | Done |

---

## Epic 5 - Provider Features (Landlord & Agent)

| ID | User Story | Role | Sprint | Status |
|---|---|---|---|---|
| US-28 | As a landlord/agent, I can view all booking requests for my listings | Landlord / Agent | 5 | Done |
| US-29 | As a landlord/agent, I can confirm, decline, or cancel a booking request | Landlord / Agent | 5 | Done |
| US-30 | As a landlord/agent, I can view weekly analytics (view counts) for my listings | Landlord / Agent | 5 | Done |
| US-31 | As a landlord/agent, I can mark notifications as read | Landlord / Agent | 5 | Done |

---

## Epic 6 - Admin Features

| ID | User Story | Role | Sprint | Status |
|---|---|---|---|---|
| US-32 | As an admin, I receive a notification when a new listing is submitted for review | Admin | 6 | Done |
| US-33 | As an admin, I can view all listings pending approval | Admin | 6 | Done |
| US-34 | As an admin, I can approve a listing so it becomes publicly visible | Admin | 6 | Done |
| US-35 | As an admin, I can decline a listing with a stated reason | Admin | 6 | Done |
| US-36 | As an admin, I can review reports filed by students | Admin | 6 | Done |
| US-37 | As an admin, I can issue a warning to a student, landlord, or agent | Admin | 6 | Done |
| US-38 | As an admin, I can suspend a user account | Admin | 6 | Done |
| US-39 | As an admin, I can reactivate a suspended account | Admin | 6 | Done |
| US-40 | As an admin, I can view system error logs | Admin | 6 | Done |
| US-41 | As an admin, I can view daily traffic logs | Admin | 6 | Done |

---

## Epic 7 - Notifications

| ID | User Story | Role | Sprint | Status |
|---|---|---|---|---|
| US-42 | As any logged-in user, I can view my notifications | All roles | 7 | Done |
| US-43 | As any logged-in user, I can mark a notification as read | All roles | 7 | Done |

---

## Epic 8 - Frontend (Partner)

| ID | User Story | Role | Sprint | Status |
|---|---|---|---|---|
| US-FE-01 | Landing page - navbar, hero, featured hostels, contact section, footer | Guest | 2 | Done |
| US-FE-02 | Sign Up page - two-column layout, role dropdown, OTP redirect | Guest | 3 | Done |
| US-FE-03 | Login page - two-column layout, forgot password modal | Guest | 3 | Done |
| US-FE-04 | OTP Verification page - 6-digit input, resend countdown | Guest | 3 | Done |
| US-FE-05 | Hostels page - search bar, filter sidebar, listing card grid, pagination | Guest / Student | 3 | Done |
| US-FE-06 | Listing Detail page - image carousel, details, contact card, report link | Student | 3 | Done |
| US-FE-07 | Student Dashboard - quick actions, recent activity, featured listings | Student | 4 | Done |
| US-FE-08 | Favourites page - saved card grid, empty state | Student | 4 | Backlog |
| US-FE-09 | Visited History page - list view, empty state | Student | 4 | Backlog |
| US-FE-10 | Landlord/Agent Dashboard - listing management, bookings, analytics | Landlord / Agent | 5 | Done |
| US-FE-11 | Admin Dashboard - pending listings, reports, user management, logs | Admin | 6 | Done |
| US-FE-12 | 404 / Error page - lost hornet illustration | All | 7 | Backlog |
