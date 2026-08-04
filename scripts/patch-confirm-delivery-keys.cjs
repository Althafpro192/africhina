// scripts/patch-confirm-delivery-keys.cjs
// Idempotent: adds 3 keys (confirm.confirm_delivery_title, confirm.yes_confirm,
// request_details.delivery_confirmed) to en/id/fr/zh if missing.

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'frontend', 'src', 'locales');

const KEYS = {
    en: {
        'confirm.confirm_delivery_title': 'Confirm Goods Receipt',
        'confirm.yes_confirm': 'Yes, confirm receipt',
        'request_details.delivery_confirmed': 'Delivery confirmed successfully!',
    },
    id: {
        'confirm.confirm_delivery_title': 'Konfirmasi Penerimaan Barang',
        'confirm.yes_confirm': 'Ya, konfirmasi penerimaan',
        'request_details.delivery_confirmed': 'Pengiriman berhasil dikonfirmasi!',
    },
    fr: {
        'confirm.confirm_delivery_title': "Confirmer la réception des marchandises",
        'confirm.yes_confirm': 'Oui, confirmer la réception',
        'request_details.delivery_confirmed': 'Livraison confirmée avec succès !',
    },
    zh: {
        'confirm.confirm_delivery_title': '确认收货',
        'confirm.yes_confirm': '是的，确认收货',
        'request_details.delivery_confirmed': '已成功确认收货！',
    },
};

function setDeep(obj, dottedKey, value) {
    const parts = dottedKey.split('.');
    let cursor = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (
            cursor[part] === undefined ||
            cursor[part] === null ||
            typeof cursor[part] !== 'object' ||
            Array.isArray(cursor[part])
        ) {
            cursor[part] = {};
        }
        cursor = cursor[part];
    }
    cursor[parts[parts.length - 1]] = value;
}

function hasKey(obj, dottedKey) {
    const parts = dottedKey.split('.');
    let cursor = obj;
    for (const part of parts) {
        if (cursor === null || cursor === undefined) return false;
        cursor = cursor[part];
    }
    return cursor !== undefined;
}

let totalAdded = 0;
let totalSkipped = 0;

for (const [locale, map] of Object.entries(KEYS)) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    let added = 0;
    let skipped = 0;
    for (const [key, value] of Object.entries(map)) {
        if (hasKey(data, key)) {
            skipped++;
            continue;
        }
        setDeep(data, key, value);
        added++;
    }
    if (added > 0) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
    console.log(`[${locale}] added=${added} skipped=${skipped}`);
    totalAdded += added;
    totalSkipped += skipped;
}

console.log(`DONE — total added=${totalAdded} skipped=${totalSkipped}`);