#!/usr/bin/env node
/**
 * Append-only patch: add `request_details.payment_verified` to all 4 locales.
 * Replaces the previously hardcoded Indonesian success toast that broke i18n.
 */
const fs = require('fs');
const path = require('path');

const LOCALES = ['en', 'id', 'fr', 'zh'];
const LOCALES_DIR = path.join(__dirname, '..', 'frontend', 'src', 'locales');

const PATCH = {
    en: 'Payment verified successfully!',
    id: 'Pembayaran berhasil diverifikasi!',
    fr: 'Paiement vérifié avec succès !',
    zh: '付款已成功验证！'
};

let totalAdded = 0;

for (const loc of LOCALES) {
    const file = path.join(LOCALES_DIR, `${loc}.json`);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data.request_details) data.request_details = {};

    if (!Object.prototype.hasOwnProperty.call(data.request_details, 'payment_verified')) {
        data.request_details.payment_verified = PATCH[loc];
        fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
        console.log(`${loc}: +1 key (request_details.payment_verified)`);
        totalAdded++;
    } else {
        console.log(`${loc}: already up-to-date`);
    }
}

console.log(`Done. ${totalAdded} keys added across ${LOCALES.length} locales.`);