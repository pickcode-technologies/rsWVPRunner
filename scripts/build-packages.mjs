// Builds package/{glow,compiler,RScompiler,RSrun}.<version>.min.js from lib/.
//
// This is a drop-in replacement for upstream's build_package.py that needs only
// `npm install` instead of a vendored build-tools/Uglify-ES. It deliberately does
// the exact same thing: concatenate a fixed list of lib/ files (they share globals,
// so order matters) and strip whitespace/comments. No compression or mangling --
// reportScriptError() in untrusted/run.js reads function names out of stack traces.
// For the compiler packages the output is byte-identical to build_package.py's.
//
// The file lists and version are read from build_package.py itself, so upstream
// changes to the package contents are picked up without editing this file.
// (build_package.py also regenerates lib/glow/shaders.gen.js from shaders/; that
// file is committed, so run `python3 build_package.py`'s shader step only if you
// edit shaders/.)
//
// Usage: node scripts/build-packages.mjs [--watch]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { minify } from 'terser'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Same banner build_package.py's combine() emits at the start of the input and
// (via its empty "nomin" list) appends verbatim after the minified output.
const BANNER = '/*This is a combined, compressed file.  Look at https://github.com/BruceSherwood/glowscript for source code and copyright information.*/'
const combine = (files) => [BANNER, ';(function(){})();', ...files.map(read)].join('\n')
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8')

const OUTPUTS = { run: 'glow', compile: 'compiler', RScompile: 'RScompiler', RSrun: 'RSrun' }

export function readPackageSpec() {
    const py = read('build_package.py')
    const version = py.match(/^version\s*=\s*"([^"]+)"/m)?.[1]
    if (!version) throw new Error('build_package.py: could not find version = "X.Y"')
    const lists = {}
    for (const key of Object.keys(OUTPUTS)) {
        const m = py.match(new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`))
        if (!m) throw new Error(`build_package.py: could not find the "${key}" file list`)
        lists[key] = [...m[1].matchAll(/"\.\.\/([^"]+)"/g)].map((x) => x[1])
        if (lists[key].length === 0) throw new Error(`build_package.py: "${key}" file list is empty`)
    }
    return { version, lists }
}

export async function buildPackages({ quiet = false } = {}) {
    const { version, lists } = readPackageSpec()
    const outputs = []
    for (const [key, name] of Object.entries(OUTPUTS)) {
        const start = Date.now()
        const out = `package/${name}.${version}.min.js`
        const result = await minify(combine(lists[key]), { compress: false, mangle: false })
        fs.writeFileSync(path.join(root, out), result.code + '\n' + combine([]))
        outputs.push(out)
        if (!quiet) console.log(`built ${out} (${lists[key].length} files, ${Date.now() - start}ms)`)
    }
    return outputs
}

export function watchLib(onChange) {
    let timer = null
    fs.watch(path.join(root, 'lib'), { recursive: true }, () => {
        clearTimeout(timer)
        timer = setTimeout(onChange, 100)
    })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    await buildPackages()
    if (process.argv.includes('--watch')) {
        console.log('watching lib/ for changes...')
        watchLib(() => buildPackages().catch((err) => console.error(err.message)))
    }
}
