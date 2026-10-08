# This is a static deployment of a RapydScript runner

This is a runner for RapydScript WebVPython programs. The runner must be embedded as an iframe within a host application. The host communicates with the runner through the iframe's "postMessage" method.

The runner can send results, errors, and screen grabs to the host window postMessge.

You must configure the "trusted host" environment variable on the deployed system to match the root URL of the host using this runner.

Because this is a static deployment, you need to configure the trusted host in the /untrusted/run.html file.

You can copy `sample.run.html` to `run.html` and edit the embedded javascript to set the `trusted_host` variable.

To run a simple web server in a code space use "bash -v serve.sh"

Copy individual files to cloud storage, e.g.,

 gsutil cp package/glow.3.2.min.js gs://rswvprunner/rsWVPRunner/package/glow.3.2.min.js

## Development (Pickcode fork)

Requires Node 22+. Run `npm install` once.

- `npm run dev` builds the 3.2 packages from `lib/`, rebuilds them whenever `lib/` changes, and serves the runner at `http://localhost:8090/untrusted/run.html` with caching disabled. Set `TRUSTED_HOST` to your host app's origin (comma-separated for several), e.g. `TRUSTED_HOST=http://localhost:5173 npm run dev`. `PORT` changes the port.
- `npm run build` builds `package/{glow,compiler,RScompiler,RSrun}.3.2.min.js` from `lib/`. These files are build outputs and are not committed; older package versions are prebuilt blobs and are committed.
- `npm test` builds, then compiles every program in `tests/programs/` plus targeted compiler tests. When a program from the wild breaks, add it to `tests/programs/` along with the fix.

`scripts/build-packages.mjs` replaces `build_package.py` (which needs a vendored `build-tools/Uglify-ES`) but reads its file lists and version from `build_package.py`, so upstream changes to the package contents apply automatically. Its output matches `build_package.py`'s.

Netlify runs `netlify_build.sh`, which runs `npm test` (build + tests) before assembling `deploy/`, so a compiler change that breaks the tests is not deployed.

To stay mergeable with upstream, avoid moving or reformatting files in `lib/`, and keep each compiler fix small and in its own commit. If an upstream merge reports a modify/delete conflict on one of the 3.2 package files, keep the deletion.

## Test harness

A local test page is in `test/index.html`. It embeds the runner in an iframe and lets you send programs via `postMessage`, the same way a host application would. With `./serve.sh` running (serving the runner on port 8090, trusted host `http://localhost:8080` by default), open a second terminal and run:

    npx serve test -p 8080

Then visit `http://localhost:8080` and click **▶ Run**. The "Runner URL" field defaults to `http://localhost:8090/untrusted/run.html`, matching `serve.sh`'s default port and trusted host.

