# HonnetKE Use Case Diagram Redraw Guide

Use this only if redrawing the use case diagram manually in Lucidchart, diagrams.net, or another design tool.

Editable Mermaid source: [HonnetKE Use Case Diagram Mermaid.md](../diagrams/HonnetKE%20Use%20Case%20Diagram%20Mermaid.md)

## Layout

- Put `HonnetKE System` as the central system boundary.
- Place Guest and Student on the left.
- Place Landlord, Agent, and Admin on the right.
- Keep OTP Service, Cloudinary, and WhatsApp / Call / SMS outside the boundary as external services.

## Actor Note

Landlord and Agent are separate actors in the use case diagram because the FR table lists their responsibilities separately.

## Main Use Cases

| Actor | Use Cases |
| --- | --- |
| Guest | Open platform, search listings, select authentication, choose listing |
| Student | Register account, login account, search listings, view listing, book listing, save listing, contact provider, report listing, view dashboard, logout account |
| Landlord | Register account, login account, create listing, upload images, edit listing, deactivate listing, reactivate listing, delete listing, view bookings, update booking, update notification, view analytics, logout account |
| Agent | Register account, login account, create listing, upload images, edit listing, deactivate listing, reactivate listing, delete listing, organize listings, view bookings, update booking, update notification, view analytics, logout account |
| Admin | Register account, login account, receive notification, review listing, approve listing, decline listing, review report, warn account, suspend account, reactivate account, view errors, view traffic, logout account |

## Include / Extend Links

- Registration connects to OTP Service.
- Landlord and Agent image upload connects to Cloudinary.
- Student contact provider connects to WhatsApp / Call / SMS.
- Landlord create listing and Agent create listing trigger Admin receive notification.
- Admin approve listing and Admin decline listing extend Admin review listing.
- Student report listing triggers Admin review report.

## External Links

- OTP Service supports account registration.
- Cloudinary supports listing image upload.
- WhatsApp / Call / SMS supports provider contact.
