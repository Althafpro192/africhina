/**
 * E2E i18n regression test for the upload-related translation keys.
 *
 * Verifies that after the i18n cleanup (added `addFailed` / `fileAddFailed`
 * to en/id/zh/fr and removed `|| 'fallback'` patterns in FileUpload.vue),
 * the rendered UI text in each locale does NOT contain raw i18n keys.
 *
 * Catches regressions where:
 *   - a locale is missing a key (vue-i18n would show the key as raw text)
 *   - a key path is wrong (e.g. `upload.fileAddFailed` vs `upload.file_addFailed`)
 *   - the `t()` helper in the composable does not resolve correctly
 *
 * Runs against the LAN IP (non-secure context) so the regression is
 * tested in the same environment that triggered the original bug.
 */
const { chromium } = require('playwright');
const path = require('path');

const BASE = process.env.NONSECURE_BASE_URL || 'http://192.168.0.109:8000';
const TEST_RESULTS_DIR = path.resolve(__dirname, '..', 'test-results');
const SCREENSHOT_PATH = path.join(TEST_RESULTS_DIR, 'rfq-i18n-regression.png');

const TEST_FILE = path.join(TEST_RESULTS_DIR, 'test-upload.png');

// Raw i18n keys that must NEVER appear in the rendered DOM
const FORBIDDEN_RAW_KEYS = [
    'upload.dropHere',
    'upload.dragDrop',
    'upload.processing',
    'upload.selectFiles',
    'upload.allowedTypes',
    'upload.maxSize',
    'upload.addMore',
    'upload.uploadFailed',
    'upload.addFailed',
    'upload.fileAddFailed',
    'upload.fileTooLarge',
    'upload.previewFailed',
    'upload.fileTypeNotAllowed',
    'upload.reference',
    'upload.embedded',
];

const log = (...args) => console.log('[I18N]', ...args);

const assertNoRawKeys = (text, locale) => {
    const hits = FORBIDDEN_RAW_KEYS.filter((k) => text.includes(k));
    if (hits.length > 0) {
        log(`❌ ${locale}: raw i18n keys bleeding through: ${hits.join(', ')}`);
        return false;
    }
    log(`✅ ${locale}: no raw i18n keys in rendered DOM`);
    return true;
};

const setLocaleAndReload = async (page, locale) => {
    // vue-i18n composable exposes i18n.global.locale. We poke it via window.
    await page.evaluate((loc) => {
        try {
            const root = document.querySelector('#app')?.__vue_app__;
            const i18n = root?.config?.globalProperties?.$i18n;
            if (i18n?.global?.locale) {
                i18n.global.locale.value = loc;
            } else {
                // Legacy fallback
                localStorage.setItem('africhina_locale', loc);
            }
        } catch (e) {
            localStorage.setItem('africhina_locale', loc);
        }
    }, locale);
    // Force the SPA to re-render
    await page.waitForTimeout(500);
};

(async () => {
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
    });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('vite') || text.includes('sockjs') || text.includes('WebSocket')) return;
        if (msg.type() === 'error' || msg.type() === 'warning') {
            log(`[CONSOLE.${msg.type().toUpperCase()}]`, text);
        }
    });
    page.on('pageerror', (err) => log('[PAGE_ERROR]', err.name, err.message));

    // ---- 1. Login ----
    log('navigating to', BASE);
    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'buyer@africhina.com');
    await page.fill('input[type="password"]', 'password123');
    await Promise.all([
        page.waitForURL(/\/buyer/, { timeout: 15000 }),
        page.click('button[type="submit"]'),
    ]);
    log('login OK,', page.url());

    // ---- 2. Navigate to RFQ create page ----
    await page.goto(BASE + '/buyer/rfq/create');
    await page.waitForSelector('input[type="file"]', { timeout: 15000 });
    log('RFQ create page loaded');

    // ---- 3. Upload a file in the default locale ----
    // Per QA spec: actively wait for the preview to render. If it does not
    // appear within PREVIEW_LOAD_TIMEOUT_MS, the file is considered a FAILED
    // upload. FilePreviewGrid.vue renders each uploaded file as
    // <div class="file-card">.
    const PREVIEW_LOAD_TIMEOUT_MS = 3000;
    const fileInput = await page.$('input[type="file"]');

    const beforeCount = await page.evaluate(
        () => document.querySelectorAll('.file-card').length
    );
    await fileInput.setInputFiles(TEST_FILE);
    try {
        await page.waitForFunction(
            ({ baseline }) =>
                document.querySelectorAll('.file-card').length > baseline,
            { baseline: beforeCount },
            { timeout: PREVIEW_LOAD_TIMEOUT_MS, polling: 100 }
        );
        log(
            `uploaded test file in default locale — preview rendered within ${PREVIEW_LOAD_TIMEOUT_MS}ms`
        );
    } catch (_) {
        log(
            `❌ test file preview did NOT render within ${PREVIEW_LOAD_TIMEOUT_MS}ms — failing`
        );
        await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
        await browser.close();
        process.exit(4);
    }

    let allOk = true;

    // ---- 4. Test each locale ----
    for (const locale of ['en', 'id', 'zh', 'fr']) {
        log('--- testing locale:', locale, '---');
        await setLocaleAndReload(page, locale);
        await page.waitForTimeout(500);

        const bodyText = await page.evaluate(() => document.body.innerText);
        const ok = assertNoRawKeys(bodyText, locale);

        // For Indonesian, the addFailed message text should be the Indonesian
        // translation, not the raw key. We assert this for id and zh.
        if (locale === 'id') {
            if (bodyText.includes('addFailed')) {
                log(`❌ ${locale}: raw 'addFailed' key still bleeding through`);
                allOk = false;
            } else {
                log(`✅ ${locale}: no raw 'addFailed' key`);
            }
        }
        if (locale === 'zh') {
            if (bodyText.includes('addFailed')) {
                log(`❌ ${locale}: raw 'addFailed' key still bleeding through`);
                allOk = false;
            } else {
                log(`✅ ${locale}: no raw 'addFailed' key`);
            }
        }
        if (locale === 'fr') {
            if (bodyText.includes('addFailed')) {
                log(`❌ ${locale}: raw 'addFailed' key still bleeding through`);
                allOk = false;
            }
        }

        if (!ok) allOk = false;
    }

    // ---- 5. Final screenshot for evidence ----
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
    log('screenshot saved to', SCREENSHOT_PATH);

    if (!allOk) {
        log('❌ I18N REGRESSION DETECTED');
        await browser.close();
        process.exit(1);
    }

    log('✅ I18N REGRESSION TEST PASSED');
    await browser.close();
    process.exit(0);
})().catch((e) => {
    console.error('FATAL', e);
    process.exit(1);
});
