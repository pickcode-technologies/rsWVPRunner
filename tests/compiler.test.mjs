import { test, describe } from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from './harness.mjs'

const programs = path.join(path.dirname(fileURLToPath(import.meta.url)), 'programs')

// Programs as found in the wild. Each must compile. Add real student programs
// here whenever a compatibility bug is reported.
describe('corpus', () => {
    for (const file of fs.readdirSync(programs).filter((f) => f.endsWith('.py')).sort()) {
        test(file, () => {
            compile(fs.readFileSync(path.join(programs, file), 'utf8'))
        })
    }
})
