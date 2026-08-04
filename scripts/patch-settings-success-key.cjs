// scripts/patch-settings-success-key.cjs
// Adds settings_page.update_success key to all 4 locales
const fs = require('fs')
const path = require('path')

const LOCALES = ['en', 'id', 'fr', 'zh']
const FILES = LOCALES.map((l) => path.join(__dirname, '..', 'frontend', 'src', 'locales', `${l}.json`))

const TRANSLATIONS = {
    en: 'Profile updated successfully!',
    id: 'Profil berhasil diperbarui!',
    fr: 'Profil mis à jour avec succès !',
    zh: '个人资料已成功更新！'
}

function setDeep(obj, dottedKey, value) {
    const parts = dottedKey.split('.')
    let cur = obj
    for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {}
        cur = cur[parts[i]]
    }
    cur[parts[parts.length - 1]] = value
}

function hasKey(obj, dottedKey) {
    const parts = dottedKey.split('.')
    let cur = obj
    for (const p of parts) {
        if (!cur || typeof cur !== 'object' || !(p in cur)) return false
        cur = cur[p]
    }
    return true
}

const KEY = 'settings_page.update_success'

for (const file of FILES) {
    const locale = path.basename(file, '.json')
    const json = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!hasKey(json, KEY)) {
        setDeep(json, KEY, TRANSLATIONS[locale])
        fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8')
        console.log(`[${locale}] +1 (added ${KEY})`)
    } else {
        console.log(`[${locale}] skipped (already has ${KEY})`)
    }
}