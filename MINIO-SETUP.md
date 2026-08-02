# Moving portfolio images to self-hosted MinIO

Status: **code ready, dormant.** Nothing changes for Brianna's day-to-day
editing until every step below is done AND a field is explicitly
switched over in `admin/config.yml` (last step, kept separate on
purpose so nothing can half-break).

Earlier attempt at this used Netlify Functions for the upload-signing
piece, which hit Netlify's operational-credit limit and got reverted.
This version doesn't touch Netlify at all — the signing API is its own
container on the same Unraid box as everything else, so it's free and
independent of Netlify's build pipeline entirely.

## What this is

- `deploy/unraid/media-api/` — a small standalone Node server (not a
  Netlify Function) that issues presigned upload URLs and lists what's
  in the bucket. Runs as its own container.
- `js/media-library-minio.js` — the browser-side picker, registered
  with the CMS (`admin/index.html` already loads it). Does nothing
  unless a field asks for it.

## 1. Set up MinIO on Unraid

1. **Community Applications → search "MinIO" → install.**
2. Give it a data path (an Unraid share, e.g. `/mnt/user/appdata/minio`).
3. Set a root user/password when it asks (this is the MinIO admin
   login, unrelated to anything else).
4. Start the container, open its web console, and create a bucket —
   e.g. `portfolio-media`.
5. **Make the bucket public-read** (Console → bucket → Access Policy →
   "public" or "readonly" for anonymous). Images need to be viewable
   by anyone visiting the site — only *uploading* stays locked down
   (that's what the presigned URL / token handles).
6. **Add a CORS rule** on the bucket allowing `GET, PUT` from the
   portfolio's real domain — otherwise the browser will refuse to
   upload directly to MinIO. MinIO's console has a CORS section under
   bucket settings.
7. **Generate an access key** (Console → Access Keys → Create) — an
   Access Key + Secret Key. These go in `media-api`'s `.env`, never in
   any file that gets committed.
8. **Expose it through NPM/SWAG**, same as everything else — a
   subdomain (e.g. `media.yourdomain.com`) pointed at MinIO's port,
   with a certificate.

## 2. Deploy the media-api container

See [`deploy/unraid/README.md`](deploy/unraid/README.md) for the
actual `docker compose` steps. In short: copy `.env.example` to `.env`
in `deploy/unraid/media-api/`, fill in the values from step 1 plus a
random string for `MEDIA_API_TOKEN`, then `docker compose up -d --build`.

**Also edit `js/media-library-minio.js`**: set `MEDIA_API_BASE` to
wherever you expose media-api (step 1.8-equivalent for this
container), and set `API_TOKEN` to the exact same string as
`MEDIA_API_TOKEN`, then commit/push — the portfolio-site container
picks it up automatically within a couple minutes (see the
[deploy README](deploy/unraid/README.md)).

(That token is visible to anyone who views the page source — it's a
basic deterrent against randos hitting the upload endpoint directly,
not real security. The presigned URLs it protects also expire in 5
minutes and only grant one upload each, which limits the actual risk.)

## 3. Test it before switching anything over

```bash
curl -X POST https://media-api.yourdomain.com/sign-upload \
  -H "Content-Type: application/json" -H "x-media-token: YOUR_TOKEN" \
  -d '{"filename":"test.jpg","contentType":"image/jpeg"}'
```

Should return JSON with `uploadUrl` and `publicUrl`. If it errors,
check `docker logs portfolio-media-api` — almost always a missing or
typo'd `.env` value.

## 4. Switch a field over (the actual cutover, one field at a time)

In `admin/config.yml`, any image field can opt in by adding
`media_library: { name: "minio" }` next to its `widget: "image"` line:

```yaml
- { name: "image", label: "Image", widget: "image", media_library: { name: "minio" } }
```

Do this for the gallery's `image` field first (the highest-volume one)
once steps 1–3 are confirmed working, and leave the others (headshot,
resume file, pet photos) on the default git storage until you're
comfortable — there's no requirement to switch everything at once, and
nothing breaks by leaving some fields on git storage indefinitely.
