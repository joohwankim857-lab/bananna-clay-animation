# CLAUDE.md — Banana Clay Animation Project

## Project Overview
This project creates premium scroll-driven animated websites from clay animation videos, using the `frontend-design` and `video-to-website` skills together.

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
- For scroll-driven video websites, also follow the `video-to-website` skill in `video-to-website-SKILL.md`.

## Skills Available
- `FrontendDesign SKILL.md` — Distinctive, production-grade frontend UI design rules
- `video-to-website-SKILL.md` — Turn a video into a GSAP/canvas scroll-driven animated site

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft.
- Screenshot → compare → fix mismatches → re-screenshot. At least 2 rounds. Stop only when no visible differences remain.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots save to `./temporary screenshots/screenshot-N.png` (auto-incremented).
- Optional label: `node screenshot.mjs http://localhost:3000 label` → `screenshot-N-label.png`
- After screenshotting, read the PNG with the Read tool to analyze it visually.
- Be specific when comparing: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing.
- If assets exist, use them. Do not use placeholders where real assets are available.
- If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Use custom brand colors.
- **Shadows:** Never flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never same font for headings and body. Pair a display/serif with a clean sans. Tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states.
- **Images:** Add gradient overlay (`bg-gradient-to-t from-black/60`) and color treatment with `mix-blend-multiply`.
- **Spacing:** Intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Layering system (base → elevated → floating), not all at the same z-plane.

## Scroll-Driven Sites (video-to-website)
- Lenis smooth scroll — mandatory
- 4+ different animation types — never repeat consecutively
- Staggered reveals: label → heading → body → CTA
- No glassmorphism cards — text on clean backgrounds
- Hero: standalone 100vh with circle-wipe reveal
- Horizontal marquee at 12vw+ font size
- All stat numbers count up via GSAP
- FRAME_SPEED: 1.8–2.2
- Side-aligned text only (outer 40% zones), never center except stats with dark overlay
- Minimum 800vh scroll height for 6 sections

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
- Do not use glassmorphism cards on scroll-driven sites
