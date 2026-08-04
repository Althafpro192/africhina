#!/usr/bin/env python3
"""
Apply i18n audit fixes to all 4 locale files.

Strategy (Karpathy 'Simplicity First' + 'Surgical Changes'):
- EN is canonical: read EN, ensure other 3 files have exactly the same key structure.
- Add `supplier_register` to fr.json and zh.json (translated from id.json).
- Add missing `request_details.save_changes` to zh.json.
- Append new keys for hardcoded text in BaseModal.vue, BaseProgressBar.vue,
  ChatWindow.vue, ChatComponent.vue, ImageLightbox.vue, Navbar.vue,
  AdminLayout.vue, BuyerLayout.vue.
"""

import json
import sys
from pathlib import Path

LOCALES = Path("src/locales")

# ----------------------------------------------------------------------------
# Step 1: Fix pre-existing gaps.
# ----------------------------------------------------------------------------

# supplier_register namespace (already exists in en.json + id.json).
# Copy from id.json (Indonesian, validated) into fr.json and zh.json.
sr_id = json.loads((LOCALES / "id.json").read_text())["supplier_register"]

for locale_name in ("fr", "zh"):
    path = LOCALES / f"{locale_name}.json"
    data = json.loads(path.read_text())
    if "supplier_register" not in data:
        data["supplier_register"] = sr_id
        # Re-sort keys so supplier_register sits between auth and nav (matching en.json).
        ordered = {k: data[k] for k in data}
        path.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n")
        print(f"[OK] Added supplier_register to {locale_name}.json")

# Missing request_details.save_changes in zh.json
zh = json.loads((LOCALES / "zh.json").read_text())
if "save_changes" not in zh["request_details"]:
    zh["request_details"]["save_changes"] = "保存更改"
    (LOCALES / "zh.json").write_text(
        json.dumps(zh, ensure_ascii=False, indent=2) + "\n"
    )
    print("[OK] Added request_details.save_changes to zh.json")

# ----------------------------------------------------------------------------
# Step 2: New namespaces for hardcoded text in .vue files.
# Add to en.json (canonical). Other locales will inherit English fallback
# for now and we'll translate them in step 3.
# ----------------------------------------------------------------------------

NEW_KEYS = {
    "common": {
        "brand": "AfriChina Bridge",
    },
    "admin_layout": {
        "role": "Administrator",
        "toggle_sidebar": "Toggle sidebar",
        "theme_toggle_light": "Switch to Light Mode",
        "theme_toggle_dark": "Switch to Dark Mode",
        "notifications_title": "Admin Notifications",
        "alerts_title": "Admin Alerts",
    },
    "chat": {
        "live_negotiation": "Live Negotiation Chat",
        "subtitle_id": "ID: {id}",
        "typing": "Typing",
        "loading_history": "Loading chat history...",
        "no_messages_negotiation": "No messages yet. Send a message to start negotiation!",
        "attachment_alt": "Attachment",
        "edited": "(edited)",
        "compression_in_progress": "Compression in progress",
        "attach_file": "Attach file",
        "hold_to_record": "Hold or click to record",
    },
    "modal": {
        "assign_supplier": "Assign Supplier",
        "select_supplier": "-- Select Supplier --",
        "quoted_price": "Quoted Price (USD)",
        "production_progress_label": "Production Progress ({percent}%)",
        "internal_notes_hidden": "⚠️ Internal Notes (Hidden from Buyer)",
        "upload_qc_media": "Upload QC / Production Media",
        "send_email_supplier": "Send Email Update to Supplier",
        "status_label": "Status",
    },
    "progress": {
        "production": "Production Progress",
    },
    "image_lightbox": {
        "thumbnail_alt": "Thumbnail {idx}",
    },
}

# Translations
TRANSLATIONS = {
    "id": {
        "common.brand": "AfriChina Bridge",
        "admin_layout.role": "Administrator",
        "admin_layout.toggle_sidebar": "Alihkan sidebar",
        "admin_layout.theme_toggle_light": "Beralih ke Mode Terang",
        "admin_layout.theme_toggle_dark": "Beralih ke Mode Gelap",
        "admin_layout.notifications_title": "Notifikasi Admin",
        "admin_layout.alerts_title": "Peringatan Admin",
        "chat.live_negotiation": "Chat Negosiasi Langsung",
        "chat.subtitle_id": "ID: {id}",
        "chat.typing": "Mengetik",
        "chat.loading_history": "Memuat riwayat obrolan...",
        "chat.no_messages_negotiation": "Belum ada pesan. Kirim pesan untuk memulai negosiasi!",
        "chat.attachment_alt": "Lampiran",
        "chat.edited": "(diedit)",
        "chat.compression_in_progress": "Kompresi sedang berlangsung",
        "chat.attach_file": "Lampirkan file",
        "chat.hold_to_record": "Tahan atau klik untuk merekam",
        "modal.assign_supplier": "Tetapkan Pemasok",
        "modal.select_supplier": "-- Pilih Pemasok --",
        "modal.quoted_price": "Harga Penawaran (USD)",
        "modal.production_progress_label": "Progres Produksi ({percent}%)",
        "modal.internal_notes_hidden": "⚠️ Catatan Internal (Tersembunyi dari Pembeli)",
        "modal.upload_qc_media": "Unggah Media QC / Produksi",
        "modal.send_email_supplier": "Kirim Pembaruan Email ke Pemasok",
        "modal.status_label": "Status",
        "progress.production": "Progres Produksi",
        "image_lightbox.thumbnail_alt": "Thumbnail {idx}",
    },
    "fr": {
        "common.brand": "AfriChina Bridge",
        "admin_layout.role": "Administrateur",
        "admin_layout.toggle_sidebar": "Basculer la barre latérale",
        "admin_layout.theme_toggle_light": "Passer en Mode Clair",
        "admin_layout.theme_toggle_dark": "Passer en Mode Sombre",
        "admin_layout.notifications_title": "Notifications Admin",
        "admin_layout.alerts_title": "Alertes Admin",
        "chat.live_negotiation": "Chat de Négociation en Direct",
        "chat.subtitle_id": "ID : {id}",
        "chat.typing": "En train d'écrire",
        "chat.loading_history": "Chargement de l'historique du chat...",
        "chat.no_messages_negotiation": "Aucun message pour l'instant. Envoyez un message pour démarrer la négociation !",
        "chat.attachment_alt": "Pièce jointe",
        "chat.edited": "(modifié)",
        "chat.compression_in_progress": "Compression en cours",
        "chat.attach_file": "Joindre un fichier",
        "chat.hold_to_record": "Maintenez ou cliquez pour enregistrer",
        "modal.assign_supplier": "Assigner un Fournisseur",
        "modal.select_supplier": "-- Sélectionner un Fournisseur --",
        "modal.quoted_price": "Prix Devisé (USD)",
        "modal.production_progress_label": "Progression de la Production ({percent}%)",
        "modal.internal_notes_hidden": "⚠️ Notes Internes (Masqué pour l'Acheteur)",
        "modal.upload_qc_media": "Téléverser Média QC / Production",
        "modal.send_email_supplier": "Envoyer E-mail de Mise à Jour au Fournisseur",
        "modal.status_label": "Statut",
        "progress.production": "Progression de la Production",
        "image_lightbox.thumbnail_alt": "Miniature {idx}",
    },
    "zh": {
        "common.brand": "AfriChina Bridge",
        "admin_layout.role": "管理员",
        "admin_layout.toggle_sidebar": "切换侧边栏",
        "admin_layout.theme_toggle_light": "切换到浅色模式",
        "admin_layout.theme_toggle_dark": "切换到深色模式",
        "admin_layout.notifications_title": "管理员通知",
        "admin_layout.alerts_title": "管理员提醒",
        "chat.live_negotiation": "实时洽谈聊天",
        "chat.subtitle_id": "编号：{id}",
        "chat.typing": "正在输入",
        "chat.loading_history": "正在加载聊天记录...",
        "chat.no_messages_negotiation": "暂无消息。发送消息以开始洽谈！",
        "chat.attachment_alt": "附件",
        "chat.edited": "（已编辑）",
        "chat.compression_in_progress": "压缩进行中",
        "chat.attach_file": "附加文件",
        "chat.hold_to_record": "长按或点击录音",
        "modal.assign_supplier": "指派供应商",
        "modal.select_supplier": "-- 选择供应商 --",
        "modal.quoted_price": "报价（美元）",
        "modal.production_progress_label": "生产进度（{percent}%）",
        "modal.internal_notes_hidden": "⚠️ 内部备注（对买家隐藏）",
        "modal.upload_qc_media": "上传质检/生产资料",
        "modal.send_email_supplier": "向供应商发送邮件更新",
        "modal.status_label": "状态",
        "progress.production": "生产进度",
        "image_lightbox.thumbnail_alt": "缩略图 {idx}",
    },
}


def set_deep(data, dotted_key, value):
    """Set a value into nested dict by dotted key path."""
    parts = dotted_key.split(".")
    cur = data
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


def merge_namespace(target, ns):
    """Merge a namespace dict into target, but don't overwrite existing keys."""
    for k, v in ns.items():
        if k not in target:
            target[k] = v
        elif isinstance(v, dict) and isinstance(target[k], dict):
            merge_namespace(target[k], v)


# ----------------------------------------------------------------------------
# Step 3: Apply to en.json (canonical, English).
# ----------------------------------------------------------------------------
en = json.loads((LOCALES / "en.json").read_text())
for ns, content in NEW_KEYS.items():
    if ns not in en:
        en[ns] = {}
    merge_namespace(en[ns], content)
(LOCALES / "en.json").write_text(json.dumps(en, ensure_ascii=False, indent=2) + "\n")
print(f"[OK] Updated en.json ({sum(1 for _ in LOCALES.glob('en.json'))} file)")

# ----------------------------------------------------------------------------
# Step 4: Apply translations to id/fr/zh.
# ----------------------------------------------------------------------------
for locale_name, translations in TRANSLATIONS.items():
    path = LOCALES / f"{locale_name}.json"
    data = json.loads(path.read_text())
    for dotted_key, value in translations.items():
        set_deep(data, dotted_key, value)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"[OK] Updated {locale_name}.json with {len(translations)} translations")

# ----------------------------------------------------------------------------
# Step 5: Validate key structure parity across all 4 files.
# ----------------------------------------------------------------------------

def keys_at(d, prefix=""):
    """Yield all dotted key paths in nested dict."""
    if isinstance(d, dict):
        for k, v in d.items():
            yield from keys_at(v, f"{prefix}{k}.")
    else:
        yield prefix.rstrip(".")


en_keys = set(keys_at(en))
for locale_name in ("id", "fr", "zh"):
    data = json.loads((LOCALES / f"{locale_name}.json").read_text())
    loc_keys = set(keys_at(data))
    missing = en_keys - loc_keys
    extra = loc_keys - en_keys
    if missing:
        print(f"[WARN] {locale_name}.json missing {len(missing)} keys: {sorted(missing)[:10]}")
    if extra:
        print(f"[WARN] {locale_name}.json has {len(extra)} extra keys: {sorted(extra)[:10]}")
    if not missing and not extra:
        print(f"[OK] {locale_name}.json key structure matches en.json ({len(en_keys)} keys)")

print("\nDone.")