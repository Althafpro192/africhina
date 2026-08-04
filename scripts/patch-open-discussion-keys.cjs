#!/usr/bin/env node
/**
 * Append-only patch: add missing `confirm.open_discussion_title` and
 * `confirm.yes_open` to all 4 locales. Idempotent.
 */
const fs = require('fs');
const path = require('path');

const LOCALES = ['en', 'id', 'fr', 'zh'];
const LOCALES_DIR = path.join(__dirname, '..', 'frontend', 'src', 'locales');

const PATCH = {
    en: {
        open_discussion_title: 'Open Discussion',
        yes_open: 'Open'
    },
    id: {
        open_discussion_title: 'Buka Diskusi',
        yes_open: 'Buka'
    },
    fr: {
        open_discussion_title: 'Ouvrir la discussion',
        yes_open: 'Ouvrir'
    },
    zh: {
        open_discussion_title: '开启讨论',
        yes_open: '开启'
    }
};

let totalAdded = 0;

for (const loc of LOCALES) {
    const file = path.join(LOCALES_DIR, `${loc}.json`);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data.confirm) data.confirm = {};

    let addedForLocale = 0;
    for (const [k, v] of Object.entries(PATCH[loc])) {
        if (!Object.prototype.hasOwnProperty.call(data.confirm, k)) {
            data.confirm[k] = v;
            addedForLocale++;
        }
    }

    if (addedForLocale > 0) {
        fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
        console.log(`${loc}: +${addedForLocale} keys (open_discussion_title, yes_open)`);
        totalAdded += addedForLocale;
    } else {
        console.log(`${loc}: already up-to-date`);
    }
}

console.log(`Done. ${totalAdded} keys added across ${LOCALES.length} locales.`);
