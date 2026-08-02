# Moving portfolio images to self-hosted MinIO

Status: **on hold, partially reverted.** Adding a `package.json` +
`netlify/functions/` made Netlify's deploy start failing outright
(three pushes in a row never went live — the site kept serving the
last good deploy from before this work, which is why nothing broke
for real). Tried the two standard fixes for that (missing
`package-lock.json`, missing `npm run build` script) and neither
fixed it, which means the actual cause needs the real build log —
something only visible from inside the Netlify dashboard, not
guessable from outside.

**What's still in the repo:** `js/media-library-minio.js` (the
browser-side picker) and its registration in `admin/index.html` — both
plain static files, no build step, harmless and inert since nothing
points a CMS field at the `minio` media library yet.

**What's been pulled back out:** `package.json`, `package-lock.json`,
`netlify.toml`, and `netlify/functions/*.js` (the two serverless
functions) — removed from the repo for now so normal static deploys
work again, including Brianna's own edits through `/admin`.

**To pick this back up:** check Netlify's dashboard → the failed
deploys around [date this was attempted] → **Deploy log** — the actual
error will be near the bottom. Once that's known, the functions can go
back in with whatever that error actually calls for (their code is
below, unchanged, ready to restore). Steps 1–4 below are otherwise
still accurate for the MinIO/Unraid side.

## What this is

- `netlify/functions/media-sign-upload.js` — issues a short-lived
  presigned URL so the browser can upload a file straight to MinIO.
- `netlify/functions/media-list.js` — lists what's already in the
  bucket, for the "choose existing" view.
- `js/media-library-minio.js` — a custom media picker registered with
  the CMS (`admin/index.html` already loads it). Does nothing unless a
  field asks for it.
- `netlify.toml` + `package.json` — tell Netlify to build the two
  functions above (they need the AWS S3 SDK, since MinIO speaks the S3
  API).

## 1. Set up MinIO on Unraid

1. **Community Applications → search "MinIO" → install.**
2. Give it a data path (an Unraid share, e.g. `/mnt/user/appdata/minio`).
3. Set a root user/password when it asks (this is the MinIO admin
   login, not the site's).
4. Start the container, open its web console, and create a bucket —
   e.g. `portfolio-media`.
5. **Make the bucket public-read** (Console → bucket → Access Policy →
   set to "public" or "readonly" for anonymous). Images need to be
   viewable by anyone visiting the site — only *uploading* stays
   locked down (that's what the presigned URL / token handles).
6. **Add a CORS rule** on the bucket allowing `PUT` from your Netlify
   domain (`https://glowing-dasik-1b746d.netlify.app`, or your real
   domain once you have one) — otherwise the browser will refuse to
   upload directly to MinIO. MinIO's console has a CORS config section
   under bucket settings; allow `GET, PUT` and that origin.
7. **Generate an access key** (Console → Access Keys → Create) —
   you'll get an Access Key + Secret Key. These go in Netlify's env
   vars, never in the portfolio's code.
8. **Expose it through NPM/SWAG** the same way as the job hub — a
   subdomain (e.g. `media.yourdomain.com`) pointed at MinIO's port,
   with a certificate, since Netlify needs to reach it over HTTPS.

## 2. Set Netlify environment variables

In the Netlify dashboard for this site → **Site configuration →
Environment variables**, add:

| Variable | Value |
|---|---|
| `MINIO_ENDPOINT` | `https://media.yourdomain.com` (step 1.8) |
| `MINIO_ACCESS_KEY` | from step 1.7 |
| `MINIO_SECRET_KEY` | from step 1.7 |
| `MINIO_BUCKET` | `portfolio-media` (or whatever you named it) |
| `MINIO_PUBLIC_URL` | usually the same as `MINIO_ENDPOINT` + `/portfolio-media`, unless you're fronting it differently |
| `MEDIA_API_TOKEN` | any random string you make up — this is a shared secret between the browser-side picker and the two functions |

**Also edit `js/media-library-minio.js`**: replace
`"REPLACE_WITH_MEDIA_TOKEN"` near the top with the exact same string
you used for `MEDIA_API_TOKEN`, then commit/push. (This token is
visible to anyone who views the page source — it's a basic deterrent
against randos hitting the upload endpoint directly, not real
security. The presigned URLs it protects also expire in 5 minutes and
only grant one upload each, which limits the actual risk.)

Redeploy the site after setting env vars (Netlify → Deploys → Trigger
deploy) so the functions pick them up.

## 3. Test it before switching anything over

Once redeployed, the `minio` media library exists but nothing uses it
yet. You can sanity-check the functions directly:

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/media-sign-upload \
  -H "Content-Type: application/json" -H "x-media-token: YOUR_TOKEN" \
  -d '{"filename":"test.jpg","contentType":"image/jpeg"}'
```

Should return JSON with `uploadUrl` and `publicUrl`. If it 500s, check
the Netlify function logs — almost always a missing/typo'd env var.

## 4. Switch a field over (the actual cutover, one field at a time)

In `admin/config.yml`, any image field can opt in by adding
`media_library: { name: "minio" }` next to its `widget: "image"` line,
e.g.:

```yaml
- { name: "image", label: "Image", widget: "image", media_library: { name: "minio" } }
```

Do this for the gallery's `image` field first (the highest-volume one)
once steps 1–3 are confirmed working, and leave the others (headshot,
resume file, pet photos) on the default git storage until you're
comfortable — there's no requirement to switch everything at once, and
nothing breaks by leaving some fields on git storage indefinitely.
