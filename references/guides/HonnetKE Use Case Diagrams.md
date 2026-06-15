# HonnetKE Use Case Diagram Guide

Editable source: [HonnetKE Use Case Diagram Mermaid.md](../diagrams/HonnetKE%20Use%20Case%20Diagram%20Mermaid.md)

## Purpose

The use case diagram shows what each actor can do inside HonnetKE.

## Actors

- Guest
- Student
- Landlord
- Agent
- Admin
- OTP Service
- Cloudinary
- WhatsApp / Call / SMS

Landlord and Agent are shown as separate actors because the FR table lists their functions separately.

## Use Case Groups

| Group | Use Cases |
| --- | --- |
| Guest Services | Guest open platform, Guest search listings, Guest select authentication, Guest choose listing |
| Student Services | Student register account, Student login account, Student search listings, Student view listing, Student book listing, Student save listing, Student contact provider, Student report listing, Student view dashboard, Student logout account |
| Landlord Services | Landlord register account, Landlord login account, Landlord create listing, Landlord upload images, Landlord edit listing, Landlord deactivate listing, Landlord reactivate listing, Landlord delete listing, Landlord view bookings, Landlord update booking, Landlord update notification, Landlord view analytics, Landlord logout account |
| Agent Services | Agent register account, Agent login account, Agent create listing, Agent upload images, Agent edit listing, Agent deactivate listing, Agent reactivate listing, Agent delete listing, Agent organize listings, Agent view bookings, Agent update booking, Agent update notification, Agent view analytics, Agent logout account |
| Admin Services | Admin register account, Admin login account, Admin receive notification, Admin review listing, Admin approve listing, Admin decline listing, Admin review report, Admin warn account, Admin suspend account, Admin reactivate account, Admin view errors, Admin view traffic, Admin logout account |

## Include / Extend Rules

- Account registration connects to the OTP Service.
- Landlord and Agent image upload connects to Cloudinary.
- Student contact provider connects to WhatsApp / Call / SMS.
- Landlord create listing and Agent create listing trigger Admin receive notification.
- Admin approve listing and Admin decline listing extend Admin review listing.
- Student report listing triggers Admin review report.

## External Services

- OTP Service supports account registration.
- Cloudinary supports listing image upload.
- WhatsApp / Call / SMS supports provider contact.

## Drawing Notes

- Keep actors outside the HonnetKE boundary.
- Keep use cases inside the boundary.
- Place Student use cases on one side and Provider/Admin use cases on the other side to reduce crossing lines.
- Use the Mermaid file as the authoritative editable source.
