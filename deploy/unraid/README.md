# Deploying the portfolio on Unraid (replaces Netlify)

Two containers, both free, both self-updating from GitHub — no build
service, no credits, nothing metered.

## 1. `site/` — the portfolio itself

Serves the static site and pulls from GitHub on a timer, so edits made
through `/admin` (which commit to GitHub) show up automatically —
nothing to redeploy manually, ever.

```bash
cd deploy/unraid/site
docker compose up -d --build
```

That starts it on `localhost:8089` (change the port in
`docker-compose.yml` first if it's taken). By default it checks for
new commits every 2 minutes (`PULL_INTERVAL` env var — change it if
you want faster/slower).

**Point Nginx Proxy Manager / SWAG at it:**
- Domain: your real public domain (e.g. `yourdomain.com` or
  `portfolio.yourdomain.com`) — this one's meant to be public, unlike
  the job hub.
- Forward to: `<unraid-ip>:8089`.
- Enable SSL / force HTTPS.

**If the GitHub repo is private**, `git clone`/`git pull` inside the
container will fail with the default settings. Either make the repo
public (it holds no secrets — API keys and passwords all live in
`.env` files that are git-ignored), or set `REPO_URL` in
`docker-compose.yml` to include a
[fine-grained read-only deploy token](https://github.com/settings/tokens?type=beta):
`https://<token>@github.com/brichoward-spec/Portfolio.git`.

## 2. `media-api/` — the MinIO upload signer

Only relevant once you're doing the [MinIO image-storage
migration](../../MINIO-SETUP.md) — skip this until then. In short:

```bash
cd deploy/unraid/media-api
cp .env.example .env
# edit .env with real MinIO endpoint/keys and a random MEDIA_API_TOKEN
docker compose up -d --build
```

Then point NPM/SWAG at `<unraid-ip>:8090` on its own subdomain (e.g.
`media-api.yourdomain.com`), and update `MEDIA_API_BASE` + `API_TOKEN`
in `js/media-library-minio.js` to match, then push. The `site`
container above picks up that change automatically within
`PULL_INTERVAL` seconds, same as any other content update.

## Updating either container's own code

`docker compose up -d --build` again after `git pull`-ing this repo
onto whatever machine you're running Docker commands from — normal
Docker Compose workflow. Only needed when the *container setup itself*
changes (this README, the Dockerfiles, nginx.conf, etc.) — day-to-day
content and code changes to the actual site deploy on their own via
the pull loop.
