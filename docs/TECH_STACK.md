# HonnetKE — Tech Stack & Justifications

> Fill in the **Justification** fields as decisions are finalised.
> This file feeds directly into **Chapter 5.2 — Technical Stack and Environment**.

---

## Backend Framework

| Field | Detail |
|---|---|
| **Language** | JavaScript (CommonJS) |
| **Runtime** | Node.js v20 |
| **Framework** | Express.js v4 |
| **Justification** | _(How do the built-in features of this framework directly address the problem? e.g. non-blocking I/O for concurrent listing queries, lightweight middleware system for role-based access control, large ecosystem for integrations like Cloudinary and OTP)_ |

---

## Frontend Technology

| Field | Detail |
|---|---|
| **Technology** | Plain HTML / CSS / JavaScript (confirm with partner) |
| **Styling** | _(e.g. custom CSS with design tokens)_ |
| **Justification** | _(How does this choice facilitate a responsive and intuitive interface? e.g. no framework overhead for a content-focused MVP, CSS custom properties for consistent brand tokens, mobile-first approach addresses student users on mobile)_ |

---

## Database

| Field | Detail |
|---|---|
| **DBMS** | PostgreSQL |
| **ORM / Query Builder** | Prisma v5 |
| **Justification** | _(Why PostgreSQL over alternatives? e.g. relational integrity enforced via FK constraints — critical for listings that belong to either a landlord OR agent but not both, CHECK constraints enforce role and status enumerations at the DB level, SERIAL primary keys, UNIQUE constraints prevent duplicate accounts)_ |

---

## Image Storage

| Field | Detail |
|---|---|
| **Service** | Cloudinary |
| **Integration** | Cloudinary SDK — images uploaded via backend, only URLs stored in `listing_images` table |
| **Justification** | _(Why offload image storage? e.g. free tier sufficient for MVP, offloads bandwidth from server, CDN delivery improves image load speed for students browsing on mobile, avoids storing binary data in PostgreSQL)_ |

---

## Authentication & Authorisation

| Field | Detail |
|---|---|
| **Method** | JWT (JSON Web Tokens) |
| **Storage** | _(e.g. HttpOnly cookie / Authorization header)_ |
| **Role Encoding** | Role field included in JWT payload for middleware guards |
| **Justification** | _(Why JWT over sessions? e.g. stateless — no server-side session store needed, role embedded in token avoids extra DB lookup per request, supports multiple client types — browser and potential mobile)_ |

---

## OTP Service

| Field | Detail |
|---|---|
| **Service** | _(e.g. Africa's Talking SMS API / Twilio / custom)_ |
| **Trigger** | On successful registration — OTP sent to registered phone number |
| **Justification** | _(Why SMS OTP? e.g. phone number is a required unique field — OTP verifies real ownership, SMS delivery does not depend on email access which students may not check promptly, aligns with Kenyan mobile-first usage patterns)_ |

---

## IDE & Version Control

| Field | Detail |
|---|---|
| **IDE** | Visual Studio Code |
| **Version Control** | Git |
| **Remote Repository** | GitHub |
| **Branching Strategy** | `main` (production-ready) / `dev` (integration) / `feature/US-XX-*` (per user story) |
| **Sprint Tags** | Each sprint review tagged: `sprint-0-review`, `sprint-1-review`, etc. |
| **Justification** | _(How did these tools ensure ordered steps and full traceability? e.g. feature branches map one-to-one with User Story IDs in the Product Backlog, commit history provides a timestamped record of every change, sprint tags mark exact codebase state at each review point, GitHub enables parallel work between backend and frontend developers without conflicts)_ |

---

## Hardware & Deployment Environment

| Field | Detail |
|---|---|
| **Development Machine** | _(e.g. Windows 11, Intel Core i5, 8GB RAM)_ |
| **Database Host** | _(e.g. Local PostgreSQL instance / Supabase / Railway)_ |
| **Backend Host** | _(e.g. Local / Render / Railway)_ |
| **Frontend Host** | _(e.g. Local / Netlify / GitHub Pages)_ |
| **Justification** | _(How does the selected hardware and hosting environment handle concurrent requests without performance degradation? e.g. Node.js event loop handles concurrent I/O efficiently on modest hardware, PostgreSQL connection pooling manages simultaneous DB queries, cloud hosting scales horizontally if traffic grows post-MVP)_ |

---

## Backup Strategy

| Field | Detail |
|---|---|
| **Code Backup** | GitHub remote repository — every push backs up the codebase |
| **Database Backup** | _(e.g. `pg_dump` scheduled daily / Supabase automatic backups / Railway managed backups)_ |
| **Image Backup** | Cloudinary manages redundancy for uploaded images |
| **Justification** | _(How does this strategy protect against data loss or corruption? e.g. Git history allows rollback to any previous commit, database dumps enable point-in-time recovery, Cloudinary CDN replication ensures images are not lost if a single server fails)_ |

---

## Non-Functional Requirements (NFR) Realisation

> Cross-reference with your proposal's NFR list. Fill in how each was addressed during implementation.

| NFR | How It Was Addressed | Status |
|---|---|---|
| **Security** — passwords not stored in plaintext | `bcrypt` hashing before storing in `password_hash` column | _(fill in)_ |
| **Security** — route protection | JWT middleware on all non-public routes | _(fill in)_ |
| **Integrity** — one listing per owner type | `CHECK` constraint in `listings` table (landlord XOR agent) | _(fill in)_ |
| **Integrity** — no duplicate accounts | `UNIQUE` on `email` and `phone_number` in all user tables | _(fill in)_ |
| **Scalability** — image storage | Cloudinary offloads image load from server | _(fill in)_ |
| **Usability** — role-based navigation | Navbar and dashboard routes change based on JWT role | _(fill in)_ |
| **Reliability** — error capture | Global error handler writes to `error_logs` table | _(fill in)_ |
| **Traceability** — traffic monitoring | Middleware increments `traffic_logs` per day | _(fill in)_ |

---

_Last updated: Sprint 0 — stack confirmed (Node.js + Express + Prisma + PostgreSQL)_
