# HonnetKE Sequence Diagram Guide

Editable sources:

- [Full Sequence Diagram](../diagrams/HonnetKE%20Sequence%20Diagram%20Mermaid.md)
- [Student Sequence Diagram](../diagrams/HonnetKE%20Sequence%20Diagram%20-%20Student%20Mermaid.md)
- [Landlord/Agent Sequence Diagram](../diagrams/HonnetKE%20Sequence%20Diagram%20-%20Landlord%20Agent%20Mermaid.md)
- [Admin Sequence Diagram](../diagrams/HonnetKE%20Sequence%20Diagram%20-%20Admin%20Mermaid.md)

## Purpose

Sequence diagrams show the order of interactions between actors, modules, the database, and external services.

## Recommended Use

| Diagram | Best Used For |
| --- | --- |
| Full Sequence Diagram | Overall system flow summary |
| Student Sequence Diagram | Student registration, login, search, booking, favourite, contact, report |
| Landlord/Agent Sequence Diagram | Provider registration, listing creation, image upload, booking management |
| Admin Sequence Diagram | Admin login, listing review, approval/decline, reports, account moderation, analytics |

## Actor Separation

The current design separates:

- Student
- Landlord
- Agent
- Admin

This keeps the diagrams readable and avoids making one generic actor perform every role.

## Drawing Notes

- Use solid arrows for requests/actions.
- Use dashed arrows for responses.
- Use `alt` blocks for approval/decline, duplicate listing, and valid/invalid outcomes.
- Prefer the separate role diagrams in the final report if the full diagram becomes too crowded.
