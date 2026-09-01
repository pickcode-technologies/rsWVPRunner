# This is a static deployment of a RapydScript runner

This is a runner for RapydScript WebVPython programs. The runner must be embedded as an iframe within a host application. The host communicates with the runner through the iframe's "postMessage" method.

The runner can send results, errors, and screen grabs to the host window postMessge.

You must configure the "trusted host" environment variable on the deployed system to match the root URL of the host using this runner.

Because this is a static deployment, you need to configure the trusted host in the /untrusted/run.html file.

You can copy `sample.run.html` to `run.html` and edit the embedded javascript to set the `trusted_host` variable.

To run a simple web server in a code space use "bash -v serve.sh"

Copy individual files to cloud storage, e.g.,

 gsutil cp package/glow.3.2.min.js gs://rswvprunner/rsWVPRunner/package/glow.3.2.min.js

## Test harness

A local test page is in `test/index.html`. It embeds the runner in an iframe and lets you send programs via `postMessage`, the same way a host application would. With `./serve.sh` running (serving the runner on port 8090, trusted host `http://localhost:8080` by default), open a second terminal and run:

    npx serve test -p 8080

Then visit `http://localhost:8080` and click **▶ Run**. The "Runner URL" field defaults to `http://localhost:8090/untrusted/run.html`, matching `serve.sh`'s default port and trusted host.

