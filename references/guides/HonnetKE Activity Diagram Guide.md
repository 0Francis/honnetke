# HonnetKE Activity Diagram Guide

No current editable activity diagram source exists in `Design/diagrams`.

## Purpose

The activity diagram should show the main workflow decisions in HonnetKE.

## Suggested Flow

1. Guest opens HonnetKE.
2. Actor registers or logs in.
3. System verifies OTP and credentials.
4. System routes the actor by role:
   - Student searches, views, saves, books, contacts, or reports listings.
   - Landlord creates, uploads images, edits, deactivates, reactivates, deletes listings, views bookings, updates bookings/notifications, and views analytics.
   - Agent organizes client-owner listings, creates, uploads images, edits, deactivates, reactivates, deletes listings, views bookings, updates bookings/notifications, and views analytics.
   - Admin receives notifications, reviews listings, approves/declines listings, reviews reports, warns/suspends/reactivates accounts, and views logs/analytics.
5. Actor logs out.

## Decision Points

- Valid or invalid login.
- Duplicate or valid listing.
- Listing approved or declined.
- Booking confirmed, declined, cancelled, or pending.

## Drawing Notes

- Use swimlanes for Guest, Student, Landlord, Agent, Admin, System, and external services where needed.
- Keep the flow high-level to avoid duplicating the sequence diagrams.
