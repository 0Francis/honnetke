# HonnetKE Class Diagram Guide

Editable source: [HonnetKE Class Diagram Mermaid.md](../diagrams/HonnetKE%20Class%20Diagram%20Mermaid.md)

## Purpose

The class diagram shows the software structure of HonnetKE: classes, attributes, methods, inheritance, and associations.

## Main Classes

| Class | Purpose |
| --- | --- |
| `Account` | Abstract superclass for shared registration, login, logout, and OTP behaviour |
| `Student` | Searches listings, books listings, saves favourites, reports listings, contacts providers |
| `PropertyProvider` | Abstract superclass for listing creation, listing updates, booking requests, notifications, and analytics |
| `Landlord` | Creates, edits, deactivates, reactivates, and deletes owned listings |
| `Agent` | Creates, organizes, edits, deactivates, reactivates, and deletes client-owner listings |
| `Admin` | Reviews listings and reports, approves/declines listings, warns/suspends/reactivates accounts, and views logs/analytics |
| `Listing` | Stores property listing behaviour and state |
| `ListingImage` | Handles listing image references |
| `Favourite` | Connects students to saved listings |
| `Booking` | Connects students to booked listings |
| `Report` | Connects student reports to listings and admin resolution |
| `Warning` | Represents admin warnings |
| `Notification` | Represents stored system notifications |
| `Analytics` | Stores weekly listing view summaries |
| `ErrorLog` | Stores system error records for admin review |
| `TrafficLog` | Stores daily visit counts for admin review |

## Class vs Database Note

`Account` exists in the class diagram only as an abstract software superclass. It is not a database table in the ERD or schema.

## Key Relationships

- `Student`, `PropertyProvider`, and `Admin` inherit from `Account`.
- `Landlord` and `Agent` inherit from `PropertyProvider`.
- `Landlord` and `Agent` create, update, deactivate, reactivate, and delete listings.
- `Admin` reviews listings, approves/declines listings, reviews reports, and moderates accounts.
- `Student` creates bookings and favourites.
