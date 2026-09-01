#!/bin/bash
set -e

# Netlify build script. This is intentionally separate from do_build.sh
# (the upstream project's GCS deploy script) and does not touch it or
# share code with it: do_build.sh/GCS belongs to upstream, this is purely
# for our own Netlify hosting.

TRUSTED_HOST=${TRUSTED_HOST:?"TRUSTED_HOST must be set (e.g. https://app.pickcode.io)"}

echo "=== Building rsWVPRunner for Netlify ==="
echo "Trusted host: $TRUSTED_HOST"

# Assemble deploy/ from ONLY the assets the runner serves in production.
rm -rf deploy
mkdir -p deploy/untrusted

# Runtime asset directories (served as-is).
cp -r css lib package shaders deploy/

# Runtime root files.
cp favicon.ico index.html deploy/

# untrusted/: only the files the runner loads (not the template/backups/samples).
cp untrusted/run.js deploy/untrusted/
[ -d untrusted/images ] && cp -r untrusted/images deploy/untrusted/

# Generate run.html from template (TRUSTED_HOST baked in) and stamp run.js
# with a build timestamp for cache-busting. Portable sed (temp file + mv)
# since this runs on Netlify's Linux build image, not just macOS.
sed "s|TRUSTED_HOST_TEMPLATE|$TRUSTED_HOST|g" untrusted/run.html.template > deploy/untrusted/run.html

BUILD_DATE=$(date +%Y%m%d%H%M)
tmp_run_js=$(mktemp)
sed "s|PACKAGE_BUILD_TEMPLATE|$BUILD_DATE|g" deploy/untrusted/run.js > "$tmp_run_js"
mv "$tmp_run_js" deploy/untrusted/run.js

# The real runner page is /untrusted/run.html; index.html is just a stub.
# Redirect (not rewrite) so the browser URL actually changes to
# /untrusted/run.html and run.html's relative asset paths (../lib, ../css,
# ../package) resolve correctly.
echo "/  /untrusted/run.html  301" > deploy/_redirects

echo "=== Build complete! ==="
