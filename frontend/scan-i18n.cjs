#!/usr/bin/env node
/**
 * Scan all .vue files for hardcoded user-facing text that is NOT wrapped in $t() or {{ $t(...) }}
 * Outputs findings grouped per file with line numbers.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, 'src');

function walk(dir, list = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p, list);
        else if (entry.isFile() && entry.name.endsWith('.vue')) list.push(p);
    }
    return list;
}

const files = walk(ROOT);
const summary = [];

for (const file of files) {
    const rel = path.relative(path.resolve(__dirname, '../..'), file);
    const src = fs.readFileSync(file, 'utf-8');
    const lines = src.split(/\r?\n/);

    // Patterns to detect hardcoded user-facing text
    // We will look for:
    //   - Text nodes between > and < that contain English letters and aren't already in {{ $t(...) }} or {{ t(...) }} or v-html
    //   - placeholder="..." with English text
    //   - title="..." with English text
    //   - alt="..." with English text
    //   - aria-label="..." with English text
    //   - confirm()/alert() literals
    //   - toast messages "..." literals
    const findings = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const ln = i + 1;

        // Skip pure vue script lines that just have imports/JS (we'll only inspect template attrs/text nodes)
        // 1) placeholder / title / alt / aria-label with English words
        const attrRe = /(?:placeholder|title|alt|aria-label|aria-placeholder)\s*=\s*["']([^"']+)["']/g;
        let m;
        while ((m = attrRe.exec(line)) !== null) {
            const v = m[1];
            if (/[A-Za-z]/.test(v) && !v.startsWith('{{')) {
                findings.push({ line: ln, type: 'attr', attr: m[0].split('=')[0].trim(), value: v });
            }
        }

        // 2) Text content inside tags: >Some Text< where not {{ ... }} and contains letters
        const textRe = />([^<>]+)</g;
        while ((m = textRe.exec(line)) !== null) {
            const v = m[1].trim();
            if (!v) continue;
            // Skip if it includes {{ ... }} only
            if (/^\{\{[^}]+\}\}$/.test(v)) continue;
            // Skip if it's just an interpolation expression like {{ ... }}
            if (/^\{\{.*\}\}$/.test(v)) continue;
            // Skip if purely punctuation/symbols
            if (!/[A-Za-z]/.test(v)) continue;
            // Skip if already wrapped in $t()
            if (/\$t\(/.test(v) || /t\(/.test(v)) continue;
            // Skip Vue directives / bindings like v-if / @click / :
            findings.push({ line: ln, type: 'text', value: v });
        }

        // 3) Button or label content with English letters
        // Already covered in text content.
    }

    if (findings.length > 0) {
        summary.push({ file: rel, findings });
    }
}

// Output summary
let total = 0;
for (const s of summary) {
    console.log(`\n=== ${s.file} ===`);
    for (const f of s.findings) {
        total++;
        if (f.type === 'attr') {
            console.log(`  L${f.line} [${f.attr}] ${f.value}`);
        } else {
            console.log(`  L${f.line} [text] ${f.value}`);
        }
    }
}
console.log(`\nTotal findings: ${total}`);
console.log(`Files with findings: ${summary.length}`);
