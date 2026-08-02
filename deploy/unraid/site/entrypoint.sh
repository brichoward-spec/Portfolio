#!/bin/sh
set -e

REPO_URL="${REPO_URL:-https://github.com/brichoward-spec/Portfolio.git}"
BRANCH="${BRANCH:-main}"
TARGET="/usr/share/nginx/html"
INTERVAL="${PULL_INTERVAL:-120}"

if [ ! -d "$TARGET/.git" ]; then
  rm -rf "$TARGET"
  git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$TARGET"
fi

# Background loop: check for new commits every $INTERVAL seconds and reset
# to match. try_files reads from disk per-request, so updates show up on the
# very next request — no nginx reload needed.
(
  while true; do
    cd "$TARGET" && git fetch origin "$BRANCH" && git reset --hard "origin/$BRANCH"
    sleep "$INTERVAL"
  done
) &

exec nginx -g 'daemon off;'
