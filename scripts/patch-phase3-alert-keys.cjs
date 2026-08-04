// scripts/patch-phase3-alert-keys.cjs
// Idempotent: adds Phase 3 i18n keys (validation, auth, rfq_create, settings_page)
// used by BaseAlert consolidation in Login, Register, RFQCreate, Settings.

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'frontend', 'src', 'locales');

const KEYS = {
    en: {
        'validation.fix_phone_errors': 'Please fix the phone number errors.',
        'validation.fix_errors_before_saving': 'Please fix the errors before saving.',
        'auth.passwords_do_not_match': 'Password and confirmation password do not match.',
        'auth.password_min': 'Password must be at least 6 characters.',
        'auth.registration_failed': 'Registration failed. Please try again.',
        'auth.invalid_credentials': 'Invalid credentials. Please check your email and password.',
        'rfq_create.some_files_failed': 'Some files failed to upload. Please try again.',
        'rfq_create.submit_failed': 'Failed to submit request. Please try again.',
        'settings_page.update_failed': 'Failed to update profile',
    },
    id: {
        'validation.fix_phone_errors': 'Silakan perbaiki kesalahan nomor telepon.',
        'validation.fix_errors_before_saving': 'Silakan perbaiki kesalahan sebelum menyimpan.',
        'auth.passwords_do_not_match': 'Kata sandi dan konfirmasi kata sandi tidak cocok.',
        'auth.password_min': 'Kata sandi minimal 6 karakter.',
        'auth.registration_failed': 'Pendaftaran gagal. Silakan coba lagi.',
        'auth.invalid_credentials': 'Kredensial tidak valid. Silakan periksa email dan kata sandi Anda.',
        'rfq_create.some_files_failed': 'Beberapa file gagal diunggah. Silakan coba lagi.',
        'rfq_create.submit_failed': 'Gagal mengirim permintaan. Silakan coba lagi.',
        'settings_page.update_failed': 'Gagal memperbarui profil',
    },
    fr: {
        'validation.fix_phone_errors': "Veuillez corriger les erreurs du numéro de téléphone.",
        'validation.fix_errors_before_saving': "Veuillez corriger les erreurs avant d'enregistrer.",
        'auth.passwords_do_not_match': 'Le mot de passe et la confirmation ne correspondent pas.',
        'auth.password_min': 'Le mot de passe doit comporter au moins 6 caractères.',
        'auth.registration_failed': "L'inscription a échoué. Veuillez réessayer.",
        'auth.invalid_credentials': 'Identifiants invalides. Veuillez vérifier votre e-mail et votre mot de passe.',
        'rfq_create.some_files_failed': "Certains fichiers n'ont pas pu être téléchargés. Veuillez réessayer.",
        'rfq_create.submit_failed': "Échec de l'envoi de la demande. Veuillez réessayer.",
        'settings_page.update_failed': 'Échec de la mise à jour du profil',
    },
    zh: {
        'validation.fix_phone_errors': '请修正电话号码错误。',
        'validation.fix_errors_before_saving': '请先修正错误再保存。',
        'auth.passwords_do_not_match': '密码与确认密码不一致。',
        'auth.password_min': '密码至少需要 6 个字符。',
        'auth.registration_failed': '注册失败，请重试。',
        'auth.invalid_credentials': '凭据无效，请检查您的邮箱和密码。',
        'rfq_create.some_files_failed': '部分文件上传失败，请重试。',
        'rfq_create.submit_failed': '提交请求失败，请重试。',
        'settings_page.update_failed': '更新个人资料失败',
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