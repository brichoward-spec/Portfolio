# B. Howard Site — CMS-Based Build
### Version B: Recommended approach (lighter weight, same outcomes)

---

## 1. What exists today

Four static, self-contained HTML mockups (no backend, no database — content and images are hardcoded/embedded directly in the files):

| File | Purpose |
|---|---|
| `index.html` | Landing page — two doors: Professional / Creative |
| `portfolio.html` | Creative home — hero, approach, materials/tools, gallery, contact |
| `about.html` | About page — bio, fur family section |
| `professional.html` | Resume/business page — experience, skills, education, resume PDF download |

Shared design system: Sora + Inter fonts, warm cream palette, a 6-color "glow" accent palette on the creative side, single muted blue accent on the professional side. This visual language is **final** — the app renders this design, it does not redesign it.

**Why this version instead of a fully custom app:** the actual goal — edit content without touching code, upload images properly, add new pages — doesn't require building a database, an API, and a custom drag-and-drop editor from scratch. Existing content platforms already do this well. Using one gets the same outcomes with far less to build and maintain long-term.

**Note:** the artwork images in the current mockups were placeholders/examples — the real image set is being sorted into folders now. That folder structure is useful signal for how galleries/categories should be organized in the CMS (see Section 3.5 below).

---

## 2. Requirements (same goals, mapped to this approach)

| Original ask | How this approach covers it |
|---|---|
| Drag-and-drop editing UI | Built-in editor UI from the CMS — includes reordering content blocks by drag |
| Mockups stay the live design, fully editable | Current HTML/CSS becomes the template layer; content is pulled from the CMS instead of hardcoded |
| Add new pages/posts/lists/links | CMS content types for "page," "post," and "link list," creatable without a developer |
| Real image hosting, no base64, thumbnails | CMS handles upload, storage, and automatic image optimization/thumbnails out of the box |
| Server/hosting | Minimal — no custom backend server to run; see options below |
| Commission/print page (optional) | A page built the same way, with a contact/request form to start |

---

## 3. Recommended architecture

Two solid options, both far lighter than a custom build:

### Option 1: Git-based CMS (Decap CMS or Tina CMS)
- Content is stored as files (e.g. markdown/JSON) in the same repo as the site.
- Comes with a real browser-based editor: text fields, image upload, drag-to-reorder.
- Images upload to a connected storage location and are optimized automatically. This can be a third-party bucket (e.g. Cloudflare R2) **or Stephan's server**, if he's already set up to store/serve files — either works the same way from the CMS's side: it uploads the original, generates the web/thumbnail versions, and requests pull whichever size is needed instead of loading full images every time.
- No database and no custom backend to build or host — the site can still be hosted as a static site that rebuilds when content changes.

### Option 2: Headless CMS (Sanity or similar)
- Hosted content backend with a polished built-in editor (text, images, drag-to-reorder, custom content types).
- Free tier is generous for a personal site.
- Site fetches content from the CMS at build or request time; templates stay exactly as designed.
- Slightly more "hosted service" dependency than Option 1, but even less to set up. Image storage can still point at Stephan's server if preferred, rather than Sanity's own image hosting — worth a quick check on whether that's supported the way he has things set up, or whether using Sanity's built-in image handling is simpler.

**Either way:** the visual templates from the current mockups carry over unchanged — this only replaces *where the content lives*, not how it looks.

### 3.5 Image organization & upload
- Source folder for the sorted art: `C:\Users\brich\OneDrive\Desktop\Claude_Code\Onsite\Art` — Claude Code should read from this path directly when building out the bulk upload/import step.
- The folders currently being sorted are a good starting point for how the gallery should be structured in the CMS — e.g. if folders are by material/medium (paint, wood, etc.) or by project, that maps naturally to categories or tags on each gallery piece.
- Recommend a bulk-upload pass once folders are finalized: upload the real image set through the CMS's media library in one go, tag/categorize as they go in, rather than adding pieces one at a time later.
- Thumbnail generation happens automatically on upload regardless of which storage option is used — no manual resizing needed on Brianna's end.

---

## 4. What this simplifies vs. the custom build

- No database to design, host, or maintain.
- No custom admin authentication system to build — the CMS handles login.
- No custom image pipeline to write — upload/resize/thumbnail is built in.
- Far smaller ongoing maintenance surface (fewer moving parts you own).
- Faster to get to a working v1.

---

## 5. Open questions

1. **Hosting** — Option 1 can run on simple static hosting (Netlify, Vercel, Cloudflare Pages); Option 2 needs the site to fetch from the CMS but is also easy to host anywhere. Neither needs Stephan to host the *whole app* the way the custom-build version would. What's worth confirming with him is narrower: can his server store and serve image files reliably (with the CMS handling upload/thumbnailing), or is a third-party image bucket simpler for everyone?
2. **Editing access** — CMS logins handle multiple users easily if that's ever needed later.
3. **Commission/print page** — request form only, or real payments (Stripe) from day one?
4. **Content types** — "post" and "link list" covers the notes; worth flagging any other page types wanted from the start.

---

## 6. Assets to hand off alongside this brief

- `index.html`, `portfolio.html`, `about.html`, `professional.html` — current design/content reference
- `B-C-HOWARD_Resume.pdf` — linked resume download
- This document
