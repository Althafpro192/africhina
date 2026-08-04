#!/usr/bin/env node
/**
 * Append the new `validation`, `confirm`, and `common.unknownError`
 * namespaces to every locale JSON file. Idempotent.
 *
 * Usage: node scripts/add-validation-keys.cjs
 */
const fs = require('fs');
const path = require('path');

const LOCALES = ['en', 'id', 'fr', 'zh'];
const LOCALES_DIR = path.join(__dirname, '..', 'frontend', 'src', 'locales');

const NEW_KEYS = {
    en: {
        validation: {
            required: 'This field is required',
            requiredLabel: '{field} is required',
            fillAllFields: 'Please fill in all required fields before submitting',
            requiredFieldsAbove: 'Please correct the error above',
            email: 'Please enter a valid email address',
            minLength: 'Must be at least {min} characters',
            maxLength: 'Must be at most {max} characters',
            phoneInvalid: 'Please enter a valid phone number',
            numberInvalid: 'Please enter a valid number',
            passwordMismatch: 'Passwords do not match',
            invalid: 'Invalid value',
            selectOne: 'Please select an option',
            acceptTerms: 'You must accept the terms to continue',
            imageRequired: 'Please upload at least one image',
            selectDeliveryMethod: 'Please select a delivery method',
            specifyReason: 'Please specify a reason'
        },
        common: {
            unknownError: 'Something went wrong. Please try again.'
        },
        confirm: {
            title: 'Confirm Action',
            message: 'Are you sure you want to proceed?',
            delete_title: 'Delete Confirmation',
            delete_message: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
            block_title: 'Block Confirmation',
            block_message: 'Are you sure you want to block "{name}"?',
            unblock_title: 'Unblock Confirmation',
            unblock_message: 'Are you sure you want to unblock "{name}"?',
            verify_payment_title: 'Verify Payment',
            verify_payment_message: 'Verify and approve this payment proof?',
            reject_payment_title: 'Reject Payment',
            reject_payment_message: 'Reject this payment proof? Please specify the reason.',
            complete_order_title: 'Complete Order',
            complete_order_message: 'Complete this order? (Have you verified the B/L and receipt?)',
            assign_driver_title: 'Assign Driver',
            assign_driver_trusted: 'Send via Trusted Provider?',
            assign_driver_assigned: 'Assign this driver?',
            ship_order_title: 'Ship Order',
            ship_order_message: 'Mark this order as shipped?',
            delete_image_title: 'Delete Image',
            delete_image_message: 'Delete this image?',
            delete_message_title: 'Delete Message',
            delete_message_message: 'Are you sure you want to delete this message?',
            yes_block: 'Block',
            yes_unblock: 'Unblock',
            yes_delete: 'Delete',
            yes_verify: 'Verify',
            yes_complete: 'Complete',
            yes_ship: 'Ship',
            yes_assign: 'Assign'
        }
    },
    id: {
        validation: {
            required: 'Kolom ini wajib diisi',
            requiredLabel: '{field} wajib diisi',
            fillAllFields: 'Harap isi semua kolom yang wajib diisi sebelum mengirim',
            requiredFieldsAbove: 'Harap perbaiki kesalahan di atas',
            email: 'Harap masukkan alamat email yang valid',
            minLength: 'Minimal {min} karakter',
            maxLength: 'Maksimal {max} karakter',
            phoneInvalid: 'Harap masukkan nomor telepon yang valid',
            numberInvalid: 'Harap masukkan angka yang valid',
            passwordMismatch: 'Kata sandi tidak cocok',
            invalid: 'Nilai tidak valid',
            selectOne: 'Harap pilih salah satu opsi',
            acceptTerms: 'Anda harus menyetujui ketentuan untuk melanjutkan',
            imageRequired: 'Harap unggah minimal satu gambar',
            selectDeliveryMethod: 'Harap pilih metode pengiriman',
            specifyReason: 'Harap isi alasan'
        },
        common: {
            unknownError: 'Terjadi kesalahan. Silakan coba lagi.'
        },
        confirm: {
            title: 'Konfirmasi Tindakan',
            message: 'Apakah Anda yakin ingin melanjutkan?',
            delete_title: 'Konfirmasi Hapus',
            delete_message: 'Apakah Anda yakin ingin menghapus "{name}"? Tindakan ini tidak dapat dibatalkan.',
            block_title: 'Konfirmasi Blokir',
            block_message: 'Apakah Anda yakin ingin memblokir "{name}"?',
            unblock_title: 'Konfirmasi Buka Blokir',
            unblock_message: 'Apakah Anda yakin ingin membuka blokir "{name}"?',
            verify_payment_title: 'Verifikasi Pembayaran',
            verify_payment_message: 'Verifikasi dan setujui bukti pembayaran ini?',
            reject_payment_title: 'Tolak Pembayaran',
            reject_payment_message: 'Tolak bukti pembayaran ini? Harap isi alasan.',
            complete_order_title: 'Selesaikan Pesanan',
            complete_order_message: 'Selesaikan pesanan? (Sudah verifikasi B/L dan penerimaan?)',
            assign_driver_title: 'Tetapkan Driver',
            assign_driver_trusted: 'Kirim via Trusted Provider?',
            assign_driver_assigned: 'Tugaskan driver ini?',
            ship_order_title: 'Kirim Pesanan',
            ship_order_message: 'Tandai pesanan ini sebagai terkirim?',
            delete_image_title: 'Hapus Gambar',
            delete_image_message: 'Hapus gambar ini?',
            delete_message_title: 'Hapus Pesan',
            delete_message_message: 'Apakah Anda yakin ingin menghapus pesan ini?',
            yes_block: 'Blokir',
            yes_unblock: 'Buka Blokir',
            yes_delete: 'Hapus',
            yes_verify: 'Verifikasi',
            yes_complete: 'Selesaikan',
            yes_ship: 'Kirim',
            yes_assign: 'Tetapkan'
        }
    },
    fr: {
        validation: {
            required: 'Ce champ est obligatoire',
            requiredLabel: '{field} est obligatoire',
            fillAllFields: 'Veuillez remplir tous les champs obligatoires avant de soumettre',
            requiredFieldsAbove: 'Veuillez corriger l\'erreur ci-dessus',
            email: 'Veuillez entrer une adresse e-mail valide',
            minLength: 'Doit contenir au moins {min} caractères',
            maxLength: 'Doit contenir au plus {max} caractères',
            phoneInvalid: 'Veuillez entrer un numéro de téléphone valide',
            numberInvalid: 'Veuillez entrer un nombre valide',
            passwordMismatch: 'Les mots de passe ne correspondent pas',
            invalid: 'Valeur invalide',
            selectOne: 'Veuillez sélectionner une option',
            acceptTerms: 'Vous devez accepter les conditions pour continuer',
            imageRequired: 'Veuillez télécharger au moins une image',
            selectDeliveryMethod: 'Veuillez sélectionner une méthode de livraison',
            specifyReason: 'Veuillez préciser la raison'
        },
        common: {
            unknownError: 'Une erreur est survenue. Veuillez réessayer.'
        },
        confirm: {
            title: 'Confirmer l\'action',
            message: 'Êtes-vous sûr de vouloir continuer ?',
            delete_title: 'Confirmation de suppression',
            delete_message: 'Êtes-vous sûr de vouloir supprimer « {name} » ? Cette action est irréversible.',
            block_title: 'Confirmation du blocage',
            block_message: 'Êtes-vous sûr de vouloir bloquer « {name} » ?',
            unblock_title: 'Confirmation du déblocage',
            unblock_message: 'Êtes-vous sûr de vouloir débloquer « {name} » ?',
            verify_payment_title: 'Vérifier le paiement',
            verify_payment_message: 'Vérifier et approuver cette preuve de paiement ?',
            reject_payment_title: 'Rejeter le paiement',
            reject_payment_message: 'Rejeter cette preuve de paiement ? Veuillez préciser la raison.',
            complete_order_title: 'Terminer la commande',
            complete_order_message: 'Terminer cette commande ? (Avez-vous vérifié le B/L et la réception ?)',
            assign_driver_title: 'Assigner un chauffeur',
            assign_driver_trusted: 'Envoyer via un fournisseur de confiance ?',
            assign_driver_assigned: 'Assigner ce chauffeur ?',
            ship_order_title: 'Expédier la commande',
            ship_order_message: 'Marquer cette commande comme expédiée ?',
            delete_image_title: 'Supprimer l\'image',
            delete_image_message: 'Supprimer cette image ?',
            delete_message_title: 'Supprimer le message',
            delete_message_message: 'Êtes-vous sûr de vouloir supprimer ce message ?',
            yes_block: 'Bloquer',
            yes_unblock: 'Débloquer',
            yes_delete: 'Supprimer',
            yes_verify: 'Vérifier',
            yes_complete: 'Terminer',
            yes_ship: 'Expédier',
            yes_assign: 'Assigner'
        }
    },
    zh: {
        validation: {
            required: '此字段为必填项',
            requiredLabel: '{field}为必填项',
            fillAllFields: '提交前请填写所有必填字段',
            requiredFieldsAbove: '请更正上方的错误',
            email: '请输入有效的电子邮件地址',
            minLength: '至少 {min} 个字符',
            maxLength: '最多 {max} 个字符',
            phoneInvalid: '请输入有效的电话号码',
            numberInvalid: '请输入有效的数字',
            passwordMismatch: '密码不匹配',
            invalid: '值无效',
            selectOne: '请选择一个选项',
            acceptTerms: '您必须接受条款才能继续',
            imageRequired: '请至少上传一张图片',
            selectDeliveryMethod: '请选择配送方式',
            specifyReason: '请说明原因'
        },
        common: {
            unknownError: '发生错误。请重试。'
        },
        confirm: {
            title: '确认操作',
            message: '您确定要继续吗？',
            delete_title: '删除确认',
            delete_message: '您确定要删除"{name}"吗？此操作无法撤销。',
            block_title: '封禁确认',
            block_message: '您确定要封禁"{name}"吗？',
            unblock_title: '解封确认',
            unblock_message: '您确定要解封"{name}"吗？',
            verify_payment_title: '验证付款',
            verify_payment_message: '验证并批准此付款证明吗？',
            reject_payment_title: '拒绝付款',
            reject_payment_message: '拒绝此付款证明？请说明原因。',
            complete_order_title: '完成订单',
            complete_order_message: '完成此订单？（已验证提单和收货？）',
            assign_driver_title: '指派司机',
            assign_driver_trusted: '通过可信供应商发送？',
            assign_driver_assigned: '指派此司机？',
            ship_order_title: '发货',
            ship_order_message: '将此订单标记为已发货？',
            delete_image_title: '删除图片',
            delete_image_message: '删除此图片？',
            delete_message_title: '删除消息',
            delete_message_message: '您确定要删除此消息吗？',
            yes_block: '封禁',
            yes_unblock: '解封',
            yes_delete: '删除',
            yes_verify: '验证',
            yes_complete: '完成',
            yes_ship: '发货',
            yes_assign: '指派'
        }
    }
};

function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        const t = target[key];
        const s = source[key];
        if (
            t &&
            typeof t === 'object' &&
            !Array.isArray(t) &&
            s &&
            typeof s === 'object' &&
            !Array.isArray(s)
        ) {
            deepMerge(t, s);
        } else if (!(key in target)) {
            target[key] = s;
        }
    }
    return target;
}

let totalAdded = 0;
for (const locale of LOCALES) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const original = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const additions = NEW_KEYS[locale];
    const before = JSON.stringify(original).length;
    const merged = deepMerge(original, additions);
    const after = JSON.stringify(merged, null, 2) + '\n';
    fs.writeFileSync(filePath, after, 'utf8');
    // Count keys added
    let count = 0;
    for (const ns of Object.keys(additions)) {
        count += Object.keys(additions[ns]).length;
    }
    console.log(
        `${locale}: ${count} new keys appended (${before} -> ${after.length} bytes)`
    );
    totalAdded += count;
}
console.log(`Done. Total: ${totalAdded} keys across ${LOCALES.length} locales.`);
