import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile, compileError } from './harness.mjs'

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

// The "GlowScript X.Y VPython" header line is optional and is never compiled.
// The compiler used to drop line 1 unconditionally, whatever it contained.
describe('header line', () => {
    const body = 'first_line = 1\nsecond_line = 2'
    const compiles_body = (program) => {
        const js = compile(program)
        assert.match(js, /first_line = 1/, 'first line of code was dropped')
        assert.match(js, /second_line = 2/, 'second line of code was dropped')
    }

    test('GlowScript header', () => compiles_body('GlowScript 3.2 VPython\n' + body))
    test('Web VPython header', () => compiles_body('Web VPython 3.2\n' + body))
    test('lowercase header with suffix', () => compiles_body('glowscript 3.2dev vpython\n' + body))
    test('no header', () => compiles_body(body))
    test('blank lines before header', () => compiles_body('\n\nGlowScript 3.2 VPython\n' + body))
    test('comment before header', () => compiles_body('# my program\nGlowScript 3.2 VPython\n' + body))
    test('CRLF line endings', () => compiles_body(('GlowScript 3.2 VPython\n' + body).replace(/\n/g, '\r\n')))
    test('leading blank line, no header', () => compiles_body('\n' + body))

    test('header text after code is still an error', () => {
        assert.notEqual(compileError(body + '\nGlowScript 3.2 VPython'), null)
    })
})

// Error line numbers must match the user's source, header or not.
describe('error line numbers', () => {
    const error_line = (program) => compileError(program)?.match(/line (\d+)/i)?.[1]

    test('with header', () => assert.equal(error_line('GlowScript 3.2 VPython\nx = 1\ny ='), '3'))
    test('without header', () => assert.equal(error_line('x = 1\ny ='), '2'))
    test('blank line before header', () => assert.equal(error_line('\nGlowScript 3.2 VPython\nx = 1\ny ='), '4'))
})

describe('javascript programs', () => {
    test('with header', () => assert.match(compile('GlowScript 3.2 JavaScript\nlet first_line = 1', { lang: 'javascript' }), /first_line = 1/))
    test('without header', () => assert.match(compile('let first_line = 1', { lang: 'javascript' }), /first_line = 1/))
})
