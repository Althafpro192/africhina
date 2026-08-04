// Idempotent patch script: add 3 missing i18n keys × 4 locales
// 1. validation.driver_required
// 2. request_details.trusted_provider_assigned
// 3. request_details.driver_assigned
//
// Usage: node scripts/patch-driver-assigned-keys.cjs

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'frontend', 'src', 'locales');

const TRANSLATIONS = {
    en: {
        validation: {
            driver_required: 'Please select a driver',
        },
        request_details: {
            trusted_provider_assigned: 'Delivery routed to Trusted Provider',
            driver_assigned: 'Driver assigned successfully!',
        },
    },
    id: {
        validation: {
            driver_required: 'Silakan pilih driver',
        },
        request_details: {
            trusted_provider_assigned: 'Pengiriman dialihkan ke Trusted Provider',
            driver_assigned: 'Driver berhasil ditugaskan!',
        },
    },
    fr: {
        validation: {
            driver_required: 'Veuillez sélectionner un chauffeur',
        },
        request_details: {
            trusted_provider_assigned: 'Livraison confiée à un fournisseur de confiance',
            driver_assigned: 'Chauffeur assigné avec succès !',
        },
    },
    zh: {
        validation: {
            driver_required: '请选择司机',
        },
        request_details: {
            trusted_provider_assigned: '已切换至可信供应商配送',
            driver_assigned: '司机已成功指派！',
        },
    },
};

function setNested(obj, keys, value) {
    let cursor = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (typeof cursor[k] !== 'object' || cursor[k] === null) {
            cursor[k] = {};
        }
        cursor = cursor[k];
    }
    cursor[keys[keys.length - 1]] = value;
}

function applyTranslations(locale, dict) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);

    let added = 0;
    let skipped = 0;

    for (const [ns, fields] of Object.entries(dict)) {
        if (!json[ns]) json[ns] = {};
        for (const [key, value] of Object.entries(fields)) {
            const fullPath = [ns, key];
            let existing = json;
            let exists = true;
            for (const k of fullPath) {
                if (typeof existing !== 'object' || existing === null || !(k in existing)) {
                    exists = false;
                    break;
                }
                existing = existing[k];
            }
            if (exists) {
                skipped++;
            } else {
                setNested(json, fullPath, value);
                added++;
            }
        }
    }

    if (added > 0) {
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    }

    return { added, skipped };
}

let totalAdded = 0;
for (const [locale, dict] of Object.entries(TRANSLATIONS)) {
    const { added, skipped } = applyTranslations(locale, dict);
    console.log(`[${locale}] added=${added}  skipped=${skipped}`);
    totalAdded += added;
}

console.log(`\nDone. Total new keys added: ${totalAdded}`);
