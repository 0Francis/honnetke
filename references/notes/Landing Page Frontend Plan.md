# HonnetKE Landing Page — Frontend Plan

> Full plan is maintained in the implementation plan artifact.  
> This is a quick-reference copy for the notes folder.

## Sections to Build

1. **Navbar** — Sticky, charcoal bg, glassmorphism on scroll, hamburger on mobile
2. **Hero** — Full-viewport, Kenyan housing background + dark overlay, "Find Your Cell" headline, search bar with 5 filters
3. **Featured Hostels** — 3-column card grid (6 mock listings), hover lift + image zoom
4. **Contact / "Buzz Us"** — Two-column: hornets nest illustration + contact form, amber/cream bg
5. **Footer** — Charcoal bg, 3-column: logo+tagline, quick links, contact info

## File Structure

```
honnetke/
├── index.html
├── css/
│   ├── variables.css     ← design tokens
│   ├── reset.css         ← CSS reset
│   ├── global.css        ← base styles + utilities
│   └── landing.css       ← landing page styles
├── js/
│   └── landing.js        ← scroll, mobile nav, animations
└── assets/
    ├── images/           ← hero photo, hostel images, illustrations
    └── icons/            ← SVG icons
```

## Brand Tokens

- Primary: `#E8900A` (Deep Amber)
- Secondary: `#1E1E1E` (Dark Charcoal)
- Accent: `#FFF8EC` (Warm Cream)
- Fonts: Plus Jakarta Sans (headings), Inter (body)

## Key Decisions Pending

- Plain HTML/CSS/JS vs framework (Vite/React)?
- Google Fonts CDN vs self-hosted?
- Hardcoded mock data vs real API for featured listings?
- Contact form mailto address?
