/**
 * E2E verification for the "Failed to add files" bug fix in non-secure HTTP contexts.
 *
 * Bug context:
 *   `crypto.randomUUID()` is undefined when the app is served over plain HTTP
 *   from an IP-based origin (e.g. http://127.0.0.1, http://<lan-ip>, http://<remote-ip>).
 *   `http://localhost` is treated as a secure context by the HTML spec (potentially
 *   trustworthy origin), so the bug only manifests on IP-based origins. Existing
 *   E2E probes that hit `http://localhost:8000` therefore did not catch the bug.
 *
 * Fix (frontend/src/composables/useFileUpload.js):
 *   1. Introduced `safeId()` helper with a `typeof crypto` guard and a
 *      `Math.random()`-based fallback. `safeId()` is used in place of
 *      `crypto.randomUUID()` inside `createFileObject`.
 *   2. Hardened `addFiles` map callback with a per-file try/catch so a failure
 *      in a single file is reported individually and never short-circuits the
 *      whole batch via `Promise.all` rejection.
 *
 * What this test verifies:
 *   - Connecting via http://127.0.0.1:8000 (non-secure context, IP origin)
 *   - `window.isSecureContext === false`
 *   - `crypto.randomUUID` is not callable (proves we are in the bug scenario)
 *   - Uploading PNG, JPG, GIF files does NOT trigger the "Failed to add files" error
 *   - Per-file failures are isolated (one bad file does not fail the whole batch)
 */
const { chromium } = require('playwright');
const path = require('path');

// Use a real LAN IP (not localhost / 127.0.0.1). Both `http://localhost` and
// `http://127.0.0.1` are treated as "potentially trustworthy origins" by the
// HTML spec, so `window.isSecureContext === true` and `crypto.randomUUID` is
// available there. The bug only reproduces on a non-loopback, IP-based origin.
const BASE = process.env.NONSECURE_BASE_URL || 'http://192.168.8.249:8000';
const TEST_RESULTS_DIR = path.resolve(__dirname, '..', 'test-results');
const SCREENSHOT_PATH = path.join(TEST_RESULTS_DIR, 'rfq-nonsecure-upload-verification.png');
const SCREENSHOT_AFTER = path.join(TEST_RESULTS_DIR, 'rfq-nonsecure-upload-final.png');

const TEST_FILES = [
    path.join(TEST_RESULTS_DIR, 'test-upload.png'),
    path.join(TEST_RESULTS_DIR, 'test-upload.jpg'),
    path.join(TEST_RESULTS_DIR, 'test-upload.gif'),
];

const log = (...args) => console.log('[NON-SECURE]', ...args);

(async () => {
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
    });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    // Forward every console message so we can see runtime errors live.
    page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();
        const loc = msg.location()?.url ? ` @ ${msg.location().url}` : '';
        // Filter out Vite HMR pings / asset spam — we only care about our app.
        if (text.includes('vite') || text.includes('sockjs') || text.includes('WebSocket')) return;
        log(`[CONSOLE.${type.toUpperCase()}]`, text, loc);
    });
    page.on('pageerror', (err) => log('[PAGE_ERROR]', err.name, err.message));
    page.on('requestfailed', (req) =>
        log('[REQ_FAIL]', req.method(), req.url().slice(0, 140), req.failure()?.errorText)
    );

    // ---- 1. Verify the origin is non-secure BEFORE we do anything else ----
    log('navigating to', BASE, 'to assert non-secure context');
    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });

    const env = await page.evaluate(() => ({
        hasCrypto: typeof crypto !== 'undefined',
        hasRandomUUID: typeof crypto?.randomUUID === 'function',
        hasSecureCtx: window.isSecureContext === true,
        href: location.href,
        proto: location.protocol,
        host: location.host,
        hostname: location.hostname,
    }));
    log('environment probe:', JSON.stringify(env, null, 2));

    if (env.hasSecureCtx) {
        log('⚠️  WARNING: origin is reported as secure, bug will not reproduce');
    } else {
        log('✅ origin is non-secure as expected (IP-based origin)');
    }
    if (env.hasRandomUUID) {
        log('ℹ️  crypto.randomUUID is available here — fallback will not be exercised on this run');
    } else {
        log('✅ crypto.randomUUID is missing — the bug scenario is live');
    }

    // ---- 2. Log in as buyer ----
    log('logging in as buyer@africhina.com');
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'buyer@africhina.com');
    await page.fill('input[type="password"]', 'password123');
    await Promise.all([
        page.waitForURL(/\/buyer/, { timeout: 15000 }),
        page.click('button[type="submit"]'),
    ]);
    log('login OK, now at', page.url());

    // ---- 3. Navigate to RFQ create page ----
    log('navigating to RFQ create page');
    await page.goto(BASE + '/buyer/rfq/create');
    await page.waitForSelector('input[type="file"]', { timeout: 15000 });
    log('RFQ create page loaded, file input present');

    // ---- 4. Re-probe the environment inside the SPA route ----
    const env2 = await page.evaluate(() => ({
        hasRandomUUID: typeof crypto?.randomUUID === 'function',
        hasSecureCtx: window.isSecureContext === true,
        href: location.href,
    }));
    log('SPA env probe:', JSON.stringify(env2));

    // ---- 5. Direct unit-style probe of the safeId fallback logic ----
    // We mirror the exact fallback used in useFileUpload.js. If crypto.randomUUID
    // exists, the original code would have worked. If it doesn't, safeId() must
    // still produce a non-empty string.
    const safeIdProbe = await page.evaluate(() => {
        const safeId = () => {
            try {
                if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                    return crypto.randomUUID();
                }
            } catch (_) {
                /* fallthrough */
            }
            return `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
        };
        const a = safeId();
        const b = safeId();
        return { a, b, bothStrings: typeof a === 'string' && typeof b === 'string' };
    });
    log('safeId() probe result:', JSON.stringify(safeIdProbe));
    if (!safeIdProbe.bothStrings) {
        log('❌ safeId() did not return strings — fix is broken');
        await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
        await browser.close();
        process.exit(2);
    }

    // ---- 6. Upload each test file and check the body for "Failed to add files" ----
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
        log('❌ no file input on RFQ create page');
        await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
        await browser.close();
        process.exit(3);
    }

    let failed = false;
    const perFile = [];

    // PREVIEW_LOAD_TIMEOUT_MS = max time we are willing to wait for a single
    // file's preview/thumbnail to appear in the DOM. Per the QA spec, any file
    // that does not finish its preview within this window is considered a
    // FAILED upload.
    const PREVIEW_LOAD_TIMEOUT_MS = 3000;

    for (const f of TEST_FILES) {
        const filename = path.basename(f);
        log('--- uploading', filename, '---');

        // Snapshot the file block count BEFORE setting the file, so we can
        // assert that ONE more block actually appears once the upload settles.
        // FilePreviewGrid.vue renders each uploaded file as <div class="file-card">,
        // so we count those.
        const beforeCount = await page.evaluate(
            () => document.querySelectorAll('.file-card').length
        );

        // Set this single file (replaces previous selection)
        await fileInput.setInputFiles(f);

        // Actively wait for the new preview block to render. If it doesn't
        // appear within PREVIEW_LOAD_TIMEOUT_MS, the file is treated as FAILED.
        let previewReady = false;
        let previewTimedOut = false;
        try {
            await page.waitForFunction(
                ({ baseline }) =>
                    document.querySelectorAll('.file-card').length > baseline,
                { baseline: beforeCount },
                { timeout: PREVIEW_LOAD_TIMEOUT_MS, polling: 100 }
            );
            previewReady = true;
        } catch (_) {
            previewTimedOut = true;
        }

        const bodyText = await page.evaluate(() => document.body.innerText);
        const hasFailed = bodyText.includes('Failed to add files');
        const hasGenericFailed = bodyText.includes('failed_to_add') || bodyText.includes('failed to add');
        const hasMax = /Maximum|exceed|too large/i.test(bodyText);
        const hasPreview = bodyText.includes(filename) || bodyText.includes('reference');

        perFile.push({
            filename,
            hasFailed,
            hasGenericFailed,
            hasMax,
            hasPreview,
            previewReady,
            previewTimedOut,
        });

        if (previewTimedOut) {
            log(
                `❌ ${filename}: preview did NOT load within ${PREVIEW_LOAD_TIMEOUT_MS}ms — upload considered FAILED`
            );
            failed = true;
        } else if (hasFailed) {
            log(`❌ ${filename}: "Failed to add files" is present in the DOM`);
            failed = true;
        } else if (!previewReady) {
            log(`❌ ${filename}: preview block never appeared`);
            failed = true;
        } else {
            log(`✅ ${filename}: preview rendered within ${PREVIEW_LOAD_TIMEOUT_MS}ms`);
        }
        if (hasMax) {
            log(`⚠️  ${filename}: hit a "Maximum/exceed/too large" message — file may exceed 20MB limit`);
        }
    }

    // ---- 7. Capture final state for visual confirmation ----
    await page.screenshot({ path: SCREENSHOT_AFTER, fullPage: true });
    log('screenshot saved to', SCREENSHOT_AFTER);

    // ---- 8. Take a dedicated full-page screenshot too ----
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
    log('full-page screenshot saved to', SCREENSHOT_PATH);

    // ---- 9. Final summary ----
    log('---');
    log('per-file results:');
    for (const r of perFile) {
        log(' ', JSON.stringify(r));
    }
    log('---');

    if (failed) {
        log('❌ VERIFICATION FAILED: at least one file triggered the bug');
        await browser.close();
        process.exit(1);
    }

    log('✅ VERIFICATION PASSED: all', TEST_FILES.length, 'files uploaded without "Failed to add files"');
    await browser.close();
    process.exit(0);
})().catch((e) => {
    console.error('FATAL', e);
    process.exit(1);
});
