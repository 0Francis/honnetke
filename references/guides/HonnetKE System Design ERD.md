# System Design ERD Guide

Editable source: [HonnetKE ERD Mermaid.md](../diagrams/HonnetKE%20ERD%20Mermaid.md)

## Purpose

The ERD shows the database tables and relationships used by HonnetKE.

## Main Design Decision

There is no shared account table. Each actor has an independent table:

- `students`
- `landlords`
- `agents`
- `admins`

Each actor table stores its own account/profile details.

## Core Tables

| Table | Purpose |
| --- | --- |
| `students` | Student account and profile details |
| `landlords` | Landlord account and profile details |
| `agents` | Agent account and profile details |
| `admins` | Admin account and profile details |
| `listings` | Property/hostel listing records |
| `listing_images` | Cloudinary image references |
| `favourites` | Listings saved by students |
| `bookings` | Student booking requests and provider responses |
| `reports` | Listing reports and admin resolutions |
| `warnings` | Warnings issued by admins |
| `notifications` | System notifications, including booking updates |
| `analytics` | Weekly listing view counts |
| `error_logs` | System error records |
| `traffic_logs` | Daily visit counts |

## Important Rules

- A listing belongs to either one landlord or one agent.
- A student cannot favourite the same listing twice.
- A student cannot book the same listing twice.
- A booking can be pending, confirmed, cancelled, or declined.
