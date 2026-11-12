# Vardan Raj | Portfolio

A one-page, animation-driven portfolio for a **Network Engineer & Graphic Designer**. The site is built around a "packet journey" idea: each section is a numbered hop, and a progress bar tracks the packet as you scroll.

**Live site:** https://YOUR-SITE.vercel.app  <!-- replace after deploying -->

## Highlights

- **Boot-sequence intro** that slides away into a masked name reveal
- **Animated network background** (canvas): drifting nodes, proximity links, travelling packets, and cursor repulsion
- **Scroll-driven motion** with GSAP + ScrollTrigger and smooth scrolling via Lenis
- **Custom cursor** with a blob hover effect and magnetic buttons (disabled on touch devices)
- **Projects section** with expandable rows, live demo and GitHub links
- **Design gallery** with 3D tilt tiles and a full-screen lightbox
- Responsive from 360px to 1920px, and respects `prefers-reduced-motion`

## Tech Stack

| Area | Tools |
| --- | --- |
| Build | Vite |
| Animation | GSAP, ScrollTrigger, Lenis |
| Background | Canvas 2D |
| Styling | Plain CSS with design tokens |
| Hosting | Vercel |

## Getting Started

```bash
# 1. Clone
git clone https://github.com/vardanraj/porfolio_n.git
cd porfolio_n

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Build for production
npm run build

# 5. Preview the production build
npm run preview
```

## Project Structure

```
.
├── index.html              # All page content (sections, text, links)
├── vite.config.js
├── package.json
├── public/
│   └── designs/            # Graphic design images shown in the gallery
└── src/
    ├── main.js             # Entry point
    ├── js/
    │   ├── animations.js   # Boot loader, scroll reveals, parallax, tilt
    │   ├── canvas.js       # Animated network background
    │   └── cursor.js       # Custom cursor and magnetic buttons
    └── styles/
        ├── tokens.css      # Colors, fonts, spacing
        ├── base.css        # Reset, cursor, grain, helpers
        └── sections.css    # Layout and styles for each section
```

## Customizing

- **Text and links:** edit `index.html`
- **Colors and fonts:** edit `src/styles/tokens.css` (accent color is `--accent`)
- **Graphic designs:** add images to `public/designs/` (WebP or JPG, about 800x1000, under 400 KB), then add or update a tile in the design section of `index.html`
- **Project links:** edit the `.project-links` block inside each project in `index.html`

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import it on [vercel.com](https://vercel.com) (it detects Vite automatically).
3. Build command: `npm run build`. Output directory: `dist`.
4. Every push to `main` redeploys the site.

## Featured Projects

- **Net Observer:** real-time network traffic dashboard ([live demo](https://net-observer.onrender.com) · [code](https://github.com/vardanraj/PacketTracer))
- **DNS Tunneling Detection:** incident detection for DNS tunneling attacks, from live traffic or PCAP files ([code](https://github.com/vardanraj/Hcl_AeigesDNS))
- **Live Voting System:** local-network voting for large auditoriums with poor internet

## Contact

- Email: vardanraj82@gmail.com
- LinkedIn: [linkedin.com/in/vardan-raj-y](https://linkedin.com/in/vardan-raj-y)
- GitHub: [github.com/vardanraj](https://github.com/vardanraj)

## Notes

Designs in `public/designs/` are original work by Vardan Raj for campus fests (ABES Got Talent, Genero, SAARANG). Please don't reuse them without permission.
