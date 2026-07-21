# Project Context — B. Howard Portfolio Site
### Full session notes, for handoff to Claude Code alongside `build-brief-cms.md`

This document is a plain-English record of everything decided, built, and discussed while designing this site in chat with Claude. It exists so a new session (like Claude Code) has full context without re-deriving decisions from scratch. Pair it with `build-brief-cms.md` (the actual build spec) and the current mockup files.

---

## 1. What this project is

A split personal site for Brianna Howard — multi-discipline creator (Frankenstein-format visual artist across materials) and Business Systems Analyst. The site has two "doors": a Creative side and a Professional side, sharing one visual design language but with different tone/color intensity.

Currently: four static, self-contained HTML mockups with everything (text, images) hardcoded/embedded as base64. The goal of the next phase is to turn this into a real, editable site via a CMS (see `build-brief-cms.md` for the technical plan — Decap/Tina or Sanity, chosen over a fully custom build).

---

## 2. Current files

| File | Purpose |
|---|---|
| `index.html` | Landing page — two doors: Professional / Creative |
| `portfolio.html` | Creative home |
| `about.html` | About page — bio + fur family section |
| `professional.html` | Resume/business page |
| `B-C-HOWARD_Resume.pdf` | Downloadable resume, linked from professional.html |

---

## 3. Design system (shared across all pages)

- **Fonts:** Sora (display/bold headings) + Inter (body text)
- **Colors:**
  - `--bg: #f8f1e4` (warm cream)
  - `--ink: #2b2318` (main text)
  - `--ink-soft: #786d5c` (secondary text)
  - `--line: rgba(43,35,24,0.12)` (hairline borders/separators)
  - `--bg-soft: #efe4d1` (panel/section tint)
- **Creative-side accents (6 vivid "glow" colors), used across chips, icons, quotes:**
  - `--glow1: #ff2e88` (pink)
  - `--glow2: #00d9c0` (teal)
  - `--glow3: #ffcc00` (yellow)
  - `--glow4: #8a5cff` (purple)
  - `--glow5: #ff6a3d` (orange)
  - `--glow6: #35d16f` (green)
- **Professional-side accent:** `--accent: #3c6e8f` (single muted blue — deliberately toned down vs. the creative side)
- **Section pattern:** `.section-head` = eyebrow (small label) + `<h2>`; sections are separated with `section + section { border-top: 1px solid var(--line); }`
- **Cursor effect:** a circular grayscale-reveal cursor effect exists **only** on `portfolio.html` — explicitly not on about.html, professional.html, or index.html

This visual language is considered **final** — any future build should render it, not redesign it.

---

## 4. Page-by-page content and decisions

### `index.html` — Landing page
- Name + tagline: "Creator. Business Systems Analyst. Pick a door."
- Two door cards: Professional (muted blue) → professional.html, Creative (glow1 pink) → portfolio.html

### `portfolio.html` — Creative home
**Nav:** Home | About | Approach | Materials | Work | Contact | Resume →

**Hero:**
- Eyebrow: "Problem-first, material-agnostic"
- h1: "I don't ask what a thing is. I ask what it could become."
- Sub (final, after edits): "Driftwood doesn't know it's not a doorway." *(swapped with the Approach heading — see edit history below)*

**Approach section:**
- h2 (final, after edits): "Wood, paint, paper, code — whatever gets the job done." *(swapped from the hero, see below)*
- No eyebrow (removed — "The Approach" label was cut for simplicity)
- No middle line (the "Not duct tape and a paperclip... MacGyver..." line was removed — user felt it was one quip too many)
- Pull quote ("If it can be pictured, it can be improved. Or at least made prettier.") — **currently missing from the page entirely.** User asked to move it from the Approach section to sit under the gallery/Work section, but it was removed during an earlier edit and never re-added anywhere. This still needs to be added back under the Work section.

**Materials & Tools section** (merged into one section per user's request — "it's all materials, just how we use 'em"):
- 6 physical material icons: Wood (12), Textile (9), Paper+Print (15), Found Objects (11), Paint (8), Metal (7) — counts are placeholders, user still needs to confirm real counts
- Below that, in the same section: a row of "tool chips" for digital/software tools — Procreate, Adobe Photoshop, Adobe Illustrator, GIMP, Blender — styled as pill chips in the glow color palette, no separate nav link (folded into the existing "Materials" nav item)

**Gallery — 4 real artworks** (currently embedded as base64, all tagged "Paint"):
1. "Roost" — bird/tree silhouette
2. "Grown Wild" — vine circle with hidden "LOVE"
3. "High Desert" — desert house/cacti
4. "Desert Companions" — cactus triptych polaroids
- **Important:** these 4 were explicitly flagged as placeholder/example images, not the final set. The real, sorted image library lives locally at:
  `C:\Users\brich\OneDrive\Desktop\Claude_Code\Onsite\Art`
  The folder structure there (however it ends up organized — by material, by project, etc.) should inform how galleries/categories get modeled in the CMS.

**Contact section:**
- h2: "Got a problem worth solving weird?"
- Sub: "Fun, cheap, interesting — pick two, and I'll find the third."
- Always full color (not affected by the grayscale cursor effect)

### `about.html` — About page
**Nav:** same as portfolio.html
**Headshot:** cropped to a circle, 700×700, `object-fit: cover`

**Bio (final, 5 short paragraphs):**
1. "Failed art student; successful Humanities major."
2. Worked a handful of very different jobs — same pattern: hand her a mess, she'll sort it out.
3. Never stopped making things on the side; not attached to one medium.
4. Lives in Asheville, NC with her boyfriend and their corgi Frank.
5. Watches a lot of movies/TV; ran a review site in college.

**Fur Family section — now its own standalone `<section>`** (this took a couple of iterations):
- Originally nested inside the same div as the bio — user asked to separate it out
- Restructured into `<section id="fur-family">` with its own tinted background panel (`var(--bg-soft)`) and a `border-top` to visually separate it from the bio above and Contact below
- Eyebrow label: just "Fur Family" (user explicitly asked to drop a heading that had been there — "Who I come home to" was cut, keep only the eyebrow)
- Three groups inside:
  - **Frank** — corgi, belly-up photo
  - **My girls** — Korra (black dog) and Luna (black cat)
  - **Ones I've lost** (shown at reduced opacity) — Dory (black cat), Kodi Bear (black dog), Gizmo (chihuahua mix)
- **Dory's photo was recropped** — original crop cut off part of her head on the right; recropped from the original upload to fully include her head/ears, then re-encoded and swapped in

### `professional.html` — Resume/business page
**Nav:** Home | Experience | Skills | Education | Contact | View creative work →

**Hero:**
- Eyebrow: "Business Systems Analyst"
- h1: "Brianna Howard"
- Profile line: fixing broken/manual processes into scalable, data-driven systems; learns tools fast
- Contact row: phone, email, LinkedIn, Asheville NC
- Download Resume button → `B-C-HOWARD_Resume.pdf`

**Experience (current, after latest resume update):**
1. **Business Systems Analyst, Exelon** — **2024 – June 2026**, Remote *(this end date was just updated — previous version said "2024–Present"; the new uploaded resume confirmed the role ended/ends June 2026)*
2. Analyst / Project Coordinator, Exelon — 2022–2024, Remote
3. IT Analyst / Project Coordinator, Corevitas — 2020–2022, Remote
- Earlier roles (bartender/manager/server, 2012–2020) condensed, no bullets

**Skills chips:** Process Improvement, Business Systems Development, Workflow Automation, Operational Reporting, Contract Lifecycle Management, Root Cause Analysis, Power BI, Power Apps, Power Automate, SharePoint, Excel, ServiceNow, JIRA

**Education:** University of Central Florida — BA, Humanities (transcript was shared for reference; user confirmed it doesn't need to change anything on the page — Dean's List/GPA detail was offered but not requested, so it was left off)

---

## 5. Key standing decisions (don't relitigate these without reason)

- Grayscale cursor effect = creative side only (portfolio.html)
- Professional page keeps the same font/color DNA but toned down to a single muted accent — no glow colors there
- Every page links back to Home; creative pages cross-link to Resume; professional page cross-links to creative work
- Fur family section = about.html only, not on the professional side
- Materials and digital tools live in **one merged section** on portfolio.html, not two separate ones
- This visual design is final — a future CMS/app build should preserve it exactly, just make the content editable

---

## 6. Where the project is headed next (see `build-brief-cms.md` for full detail)

- Moving off hardcoded/base64 HTML to a real CMS-backed site (Decap/Tina or Sanity — recommended over a fully custom build)
- Real image hosting/storage with automatic thumbnailing, possibly using a server Stephan can set up, rather than embedding images
- Bulk-importing the real, sorted art library from the local `Art` folder path above
- Adding generic page/post/link-list content types so new pages can be added without touching code
- Possible future commission/print-sales page on the creative side

---

## 7. Loose ends / things not yet finalized

- Real material piece-counts (currently placeholder numbers: 12/9/15/11/8/7)
- Gallery currently only has Paint-tagged pieces — more variety expected once the real art library is imported
- The pull quote is currently missing from the page — needs to be added back under the Work/gallery section (see Section 4 note above)
- Frank's photo crop/framing was never explicitly confirmed as final by the user
- Commission/print sales page — scope not decided (request form only vs. real payments)
