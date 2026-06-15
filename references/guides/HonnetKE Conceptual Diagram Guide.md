# HonnetKE Conceptual Diagram Guide

No current editable conceptual diagram source exists in `Design/diagrams`.

## Purpose

The conceptual diagram should show the main parts of HonnetKE and how they connect.

## Actors

- Student
- Landlord
- Agent
- Admin

## Frontend Modules

| Module | Details |
| --- | --- |
| Student Module | Search, filter, view listings, book listings, save favourites, report listings, contact providers |
| Property Provider Module | Create listings, upload images, edit listings, deactivate listings, reactivate listings, delete listings, view bookings, update bookings, update notifications, view analytics |
| Admin Module | Receive listing notifications, review listings, approve listings, decline listings, review reports, warn accounts, suspend accounts, reactivate accounts, view error logs, view traffic analytics |

## Backend Services

| Service | Details |
| --- | --- |
| Authentication Service | Registration, login, OTP verification, sessions |
| Listing Service | Listing CRUD, duplicate checks, approval status, search/filtering |
| Booking Service | Booking requests, booking status updates |
| Notification Service | Booking, approval, decline, and report notifications |
| Admin Service | Reports, warnings, account moderation, logs, traffic analytics |

## External Services

| Service | Details |
| --- | --- |
| OTP Service | Sends account verification codes |
| Cloudinary | Image upload, compression, storage |
| WhatsApp / Call / SMS | External provider contact |

## Database Tables

- Students
- Landlords
- Agents
- Admins
- Listings
- Listing Images
- Favourites
- Bookings
- Reports
- Warnings
- Notifications
- Analytics
- Error Logs
- Traffic Logs
