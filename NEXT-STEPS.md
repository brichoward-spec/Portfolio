# CMS Scaffold — What's Here and What's Next

Scaffold only, per your call — this doesn't touch `index.html`, `portfolio.html`,
`about.html`, or `professional.html` yet, and nothing is wired to a live backend.

## What was added

```
admin/
  index.html       — Decap CMS entry point (loads Decap from a CDN, no local build needed)
  config.yml        — collections: pages (home/professional/about/portfolio), gallery, posts, link_lists
content/
  pages/
    home.md          — seeded from index.html's current copy
    professional.md   — seeded from professional.html (hero, experience, skills, education, contact)
    about.md          — seeded from about.html's bio + fur family structure (photos left blank, see below)
    portfolio.md       — seeded from portfolio.html (hero, approach, materials, tools, pull quote, contact)
  gallery/           — empty, ready for the real art import
  posts/             — empty
  link_lists/        — empty
static/img/uploads/  — where Decap will drop uploaded media, once wired up
```

## Why this approach (recap)

Decap CMS chosen over Tina/Sanity. It's git-based: content is markdown files in
this repo, edited through a browser UI, no hosted service to depend on. Images
default to living in the repo for now (`static/img/uploads`) — swap
`media_folder`/`public_folder` in `admin/config.yml` for an external bucket or
Stephan's server later if the gallery grows large enough (71 images currently
sorted, see below) that in-repo images get unwieldy.

## Real constraint: this machine has no Node or Python

Decap's admin UI is static (loads from a CDN), so `admin/index.html` itself
needs no local build. But there's no way to **test it locally** — the normal
path is `npx decap-server` for a local backend, which needs Node. That means
the CMS can't actually be opened and clicked around in until it's deployed
somewhere with the backend connected (see below). Everything up to that point
is file-editing, which is why this stayed scaffold-only rather than trying to
stand up something "working" today.

## What has to happen before this is usable

1. **A real git repo + host.** Nothing here is in git yet. Needs: a GitHub
   repo (Decap's `git-gateway` backend, as configured, expects Netlify Identity
   in front of a GitHub repo — or switch to backend `github` directly with
   OAuth, which skips Netlify Identity but needs an OAuth app). Netlify is the
   path of least resistance since it also solves hosting.
2. **Hosting decision** (brief's open question #1) — static hosting (Netlify,
   Vercel, Cloudflare Pages) all work fine for a git-based CMS. Netlify is the
   natural choice if using `git-gateway`, since it provides both the host and
   the auth layer in one step.
3. **Category taxonomy mismatch** — flagging this explicitly because it'll
   bite during the art import otherwise: `portfolio.html`'s hardcoded material
   categories (Wood / Textile / Paper+Print / Found Objects / Paint / Metal,
   with placeholder counts 12/9/15/11/8/7) don't match the real folder names
   in `Onsite/Art` (Paintings, Illustration, Clay and Sculpture, Resin/Wood/
   Functional Crafts, Videos). The `gallery` collection in `admin/config.yml`
   currently uses the real folder names. Worth deciding which taxonomy is
   canonical before the bulk import, rather than after.
4. **Art folder is sorted and ready — 71 files total**, not ~8 (that earlier
   count only checked the top level and missed the subfolders). Real
   breakdown:

   | Category | Edited | From Instagram | Total |
   |---|---|---|---|
   | Clay and Sculpture | 4 | 2 | 6 |
   | Illustration | 9 | 17 | 26 |
   | Paintings | 19 | 7 | 26 |
   | Resin, Wood and Functional Crafts | 9 | — | 9 |
   | Videos | — | — | 1 (`INFJEST.mp4`) |

   Each category splits into `Edited/` (phone photos/screenshots, camera-roll
   filenames like `20240511_131328.jpg` — no title/medium info) and
   `From Instagram/` (already named like "Braveheart - digital.jpg",
   "Doctor Doom - ink and watercolor.jpg" — title and medium baked into the
   filename, useful signal for pre-filling gallery entry titles/tags on
   import). This is ready for the bulk-upload pass whenever you want to do it;
   no need to wait further on sorting.
5. **Photos not yet extracted** — `about.html`'s headshot and all fur-family
   photos are embedded as base64 in that file. `content/pages/about.md` has
   those fields stubbed but empty; they need pulling out of the HTML and
   re-uploading through the CMS media library once it's live (or dropped
   straight into `static/img/uploads/` now, if you'd rather do it ahead of time).
6. **Templates aren't wired yet.** The four HTML files still render their own
   hardcoded content — nothing here makes them read from `content/` yet. That's
   the next real phase once the repo/host/backend questions above are settled.

## Not decided yet (carried over from the brief)

- Commission/print page: request form only, or real payments (Stripe)?
- Any additional page/content types beyond page / gallery / post / link_list?
