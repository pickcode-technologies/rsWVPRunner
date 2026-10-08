// Loads the built compiler package into a fresh Node VM context and compiles a
// program the same way untrusted/run.js does. Each compile gets a new context,
// matching the runner (every run is a fresh iframe); the compiler keeps module
// state between calls, so reusing a context gives misleading results.

import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { readPackageSpec } from '../scripts/build-packages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { version } = readPackageSpec()
const packages = {}

function load(name) {
    packages[name] ??= new vm.Script(fs.readFileSync(path.join(root, `package/${name}.${version}.min.js`), 'utf8'))
    return packages[name]
}

// Returns the compiled JavaScript, or throws the compiler's error.
export function compile(program, { lang = 'vpython' } = {}) {
    const ctx = { console, vec() { return {} } } // the compiler references vec at load time
    ctx.window = ctx
    vm.createContext(ctx)
    load(lang === 'javascript' ? 'compiler' : 'RScompiler').runInContext(ctx)
    return ctx.glowscript_compile(program, { lang, version, run: false })
}

// Same, but returns the error message (or null on success).
export function compileError(program, options) {
    try {
        compile(program, options)
        return null
    } catch (err) {
        return String(err.message ?? err)
    }
}
