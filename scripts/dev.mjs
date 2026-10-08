// Local development server for the runner (replaces serve.sh for day-to-day use).
//
// - Builds package/*.<version>.min.js, then rebuilds whenever lib/ changes.
// - Generates untrusted/run.html with TRUSTED_HOST as the allowed embedding origin(s).
// - Serves the repo with caching disabled, so a reload always picks up changes.
//
// Usage: TRUSTED_HOST=http://localhost:5173 PORT=8090 npm run dev
// TRUSTED_HOST may be a comma-separated list. The runner is at /untrusted/run.html.

import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPackages, watchLib } from './build-packages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(process.env.PORT || 8090)
const TRUSTED_HOST = process.env.TRUSTED_HOST || process.env.FLASK_HOST || 'http://localhost:8080'

const TYPES = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.ttf': 'font/ttf', '.otf': 'font/otf', '.shader': 'text/plain',
}

const template = fs.readFileSync(path.join(root, 'untrusted/run.html.template'), 'utf8')
fs.writeFileSync(path.join(root, 'untrusted/run.html'), template.replaceAll('TRUSTED_HOST_TEMPLATE', TRUSTED_HOST))

await buildPackages()
watchLib(async () => {
    try {
        await buildPackages({ quiet: true })
        console.log(`[${new Date().toLocaleTimeString()}] rebuilt packages`)
    } catch (err) {
        console.error(`[${new Date().toLocaleTimeString()}] build failed: ${err.message}`)
    }
})

http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    let file = path.join(root, urlPath)
    if (!file.startsWith(root + path.sep) && file !== root) {
        res.writeHead(403).end()
        return
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404).end('Not found')
            return
        }
        res.writeHead(200, {
            'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-store',
        })
        res.end(data)
    })
}).listen(PORT, () => {
    console.log(`\nRunner:        http://localhost:${PORT}/untrusted/run.html`)
    console.log(`Trusted host:  ${TRUSTED_HOST}`)
    console.log('Watching lib/ for changes...\n')
})
