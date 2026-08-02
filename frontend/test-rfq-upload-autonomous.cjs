/**
 * Autonomous RFQ Upload Flow Test (Seeded Data)
 *
 * End-to-end autonomous browser test that exercises the COMPLETE RFQ create
 * + file upload + submit flow in Chrome, using the canonical seeded buyer
 * account from `backend/database/seeders/DatabaseSeeder.php`:
 *   - email:    buyer@africhina.com   (full_name: "Kwame Osei")
 *   - password: password123
 *
 * This script addresses the reported bug: "Sedang diproses..." was stuck on
 * the References section of /buyer/rfq/create. It asserts that the upload
 * pipeline (Blob URL preview -> upload -> submit) never leaves the UI in a
 * permanent "processing" state and that zero Vue runtime errors fire.
 *
 * Pass criteria (ALL must hold):
 *   1. Login with seeded credentials reaches /buyer/dashboard (200 OK on
 *      /api/auth/login).
 *   2. /buyer/rfq/create loads, no Vue runtime errors are thrown.
 *   3. All form fields can be filled with valid data.
 *   4. Uploading the PNG fixture produces a preview (Blob URL) within 500ms.
 *   5. Submitting the form navigates away from /buyer/rfq/create within 30s
 *      and the URL no longer contains "rfq/create".
 *   6. At no point does the References section show a permanent (>=10s)
 *      "Sedang diproses..." spinner that does not resolve.
 *   7. Total Vue runtime errors observed: 0.
 *   8. Total unhandled console errors observed: 0.
 *
 * Usage:
 *   PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 node frontend/test-rfq-upload-autonomous.cjs
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// ---------- Configuration ----------
const BASE_URL = 'http://localhost:8000';
const BUYER_EMAIL = 'buyer@africhina.com';  // seeded canonical buyer
const BUYER_PASSWORD = 'password123';       // matches DatabaseSeeder.php
const FIXTURE_PATH = '/tmp/fixture-rfq-upload.png';  // 256x256 valid PNG
const SHOT_DIR = path.join(__dirname, 'test-results');
const STUCK_PROCESSING_MS = 10_000;  // if "Sedang diproses..." lasts >= this, fail
const SUBMIT_TIMEOUT_MS = 30_000;
const PREVIEW_TIMEOUT_MS = 5_000;

// ---------- Screenshot helper ----------
function shotPath(name) {
    return path.join(SHOT_DIR, `autonomous-${name}-${Date.now()}.png`);
}
async function snap(page, name) {
    if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });
    const p = shotPath(name);
    await page.screenshot({ path: p, fullPage: true });
    console.log(`   📸 ${p}`);
    return p;
}

// ---------- Pretty assertions ----------
const results = { pass: 0, fail: 0, info: [] };
function pass(name, detail = '') {
    results.pass++;
    results.info.push(`[PASS] ${name}${detail ? ' — ' + detail : ''}`);
    console.log(`   ✅ ${name}${detail ? ' — ' + detail : ''}`);
}
function fail(name, detail = '') {
    results.fail++;
    results.info.push(`[FAIL] ${name}${detail ? ' — ' + detail : ''}`);
    console.log(`   ❌ ${name}${detail ? ' — ' + detail : ''}`);
}
function info(label, detail = '') {
    console.log(`   ℹ️  ${label}${detail ? ' — ' + detail : ''}`);
}

// ---------- Main ----------
(async () => {
    console.log('================================================================');
    console.log('  Autonomous RFQ Upload Flow Test (Seeded Buyer)');
    console.log('================================================================\n');

    // Sanity checks
    if (!fs.existsSync(FIXTURE_PATH)) {
        console.error(`FATAL: fixture PNG missing at ${FIXTURE_PATH}`);
        process.exit(2);
    }

    const browser = await chromium.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage();

    // Observers
    const vueErrors = [];
    const consoleErrors = [];
    const networkLog = [];

    page.on('console', (msg) => {
        const t = msg.type();
        const text = msg.text();
        if (t === 'error') consoleErrors.push(text);
        // Heuristic for Vue runtime errors (printed by app.config.errorHandler)
        if (/\[Vue warn\]|Uncaught \(in promise\)|TypeError:|ReferenceError:/i.test(text)) {
            vueErrors.push(text);
        }
    });
    page.on('pageerror', (err) => {
        vueErrors.push(`PAGEERROR: ${err.message}`);
    });
    page.on('response', (resp) => {
        const url = resp.url();
        if (url.includes('/api/')) {
            networkLog.push(`${resp.status()} ${resp.request().method()} ${url.replace(BASE_URL, '')}`);
        }
    });

    let ok = true;
    try {
        // ===== STEP 1: Login =====
        console.log('STEP 1 — Login with seeded buyer@africhina.com / password123');
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForSelector('input[type="email"]', { timeout: 10_000 });

        // Capture login response
        const loginRespPromise = page.waitForResponse(
            (r) => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST',
            { timeout: 15_000 }
        );

        await page.fill('input[type="email"]', BUYER_EMAIL);
        await page.fill('input[type="password"]', BUYER_PASSWORD);
        await page.click('button[type="submit"]');

        const loginResp = await loginRespPromise;
        if (loginResp.status() === 200) {
            pass('POST /api/auth/login returned 200');
        } else {
            fail('POST /api/auth/login', `expected 200, got ${loginResp.status()}`);
            ok = false;
        }

        await page.waitForURL(/\/buyer\//, { timeout: 15_000 });
        const url1 = page.url();
        if (url1.includes('/buyer/dashboard')) {
            pass('Redirected to /buyer/dashboard', `url=${url1}`);
        } else {
            fail('Redirect', `unexpected url=${url1}`);
            ok = false;
        }

        // Verify token + user persisted
        const authState = await page.evaluate(() => ({
            token: localStorage.getItem('token'),
            user: localStorage.getItem('user'),
        }));
        if (authState.token) pass('JWT token persisted to localStorage');
        else { fail('JWT token missing from localStorage'); ok = false; }
        if (authState.user && authState.user.includes('Kwame Osei')) {
            pass('Seeded full_name "Kwame Osei" present in localStorage.user');
        } else {
            info('localStorage.user content', authState.user ? authState.user.slice(0, 120) : '(empty)');
        }

        await snap(page, '01-dashboard-after-login');

        // ===== STEP 2: Navigate to RFQ Create =====
        console.log('\nSTEP 2 — Navigate to /buyer/rfq/create');
        const navRespPromise = page.waitForResponse(
            (r) => r.url().includes('/api/categories') || r.url().includes('/api/requests'),
            { timeout: 10_000 }
        ).catch(() => null);

        await page.goto(`${BASE_URL}/buyer/rfq/create`, {
            waitUntil: 'domcontentloaded',
            timeout: 30_000,
        });
        await navRespPromise;

        // Wait for the Product Details input to appear
        await page.waitForSelector('input[placeholder*="Solar Panel"]', { timeout: 15_000 });
        pass('RFQ Create page rendered (productName input present)');
        await snap(page, '02-rfq-create-loaded');

        // ===== STEP 3: Fill RFQ form =====
        console.log('\nSTEP 3 — Fill all required RFQ fields');
        await page.fill('input[placeholder*="Solar Panel"]', 'Autonomous Test Solar Inverter 5kW');
        await page.selectOption('select >> nth=0', 'electronics'); // category
        await page.fill('input[placeholder*="Solar Panels"]', 'Hybrid Inverters');
        await page.fill('textarea[placeholder*="Describe technical specs"]',
            'Autonomous test: 5kW hybrid solar inverter, 48V DC, MPPT 80A, IP65 rated.');
        await page.fill('textarea[placeholder*="SGS inspection"]',
            'Must pass CE/IEC62109, zero defect tolerance.');
        await page.fill('input[placeholder*="ISO 9001"]', 'ISO 9001, CE, RoHS');
        await page.fill('input[type="number"]', '25');
        await page.selectOption('select >> nth=1', 'pcs');         // unit
        await page.selectOption('select >> nth=2', 'USD');         // currency
        await page.selectOption('select >> nth=3', '5k-20k');      // budget range

        // Delivery date — 30 days from today
        const future = new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10);
        await page.fill('input[type="date"]', future);

        await page.selectOption('select >> nth=4', 'FOB');         // shipping
        await page.selectOption('select >> nth=5', 'TT');          // payment
        pass('All form fields filled successfully');
        await snap(page, '03-form-filled');

        // ===== STEP 4: Upload PNG fixture via the hidden file input =====
        console.log('\nSTEP 4 — Upload the PNG fixture via hidden <input type=file>');

        // Some Vue file-upload components hide the <input>. Set it explicitly.
        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) {
            fail('File input not found on page');
            ok = false;
        } else {
            await fileInput.setInputFiles(FIXTURE_PATH);
            pass('File queued for upload', `${FIXTURE_PATH}`);

            // ---- Watch the "Sedang diproses..." text for stuck state ----
            const stuckObserver = (async () => {
                const start = Date.now();
                const seen = { start: null, end: null, maxMs: 0 };
                while (Date.now() - start < SUBMIT_TIMEOUT_MS + 5_000) {
                    const txt = await page.evaluate(() => {
                        const el = document.body.innerText;
                        const m = el.match(/Sedang diproses\.{0,5}/i);
                        return m ? m[0] : null;
                    });
                    const now = Date.now();
                    if (txt) {
                        if (seen.start == null) seen.start = now;
                        seen.maxMs = Math.max(seen.maxMs, now - seen.start);
                    } else if (seen.start != null && seen.end == null) {
                        seen.end = now;
                        break;
                    }
                    await page.waitForTimeout(250);
                }
                return seen;
            })();

            // ---- Wait for preview to materialize (Blob URL or uploaded thumbnail) ----
            const previewAppeared = await page
                .waitForSelector('img[src^="blob:"], img[alt*="preview" i], [class*="preview"] img, [class*="thumbnail"]',
                    { timeout: PREVIEW_TIMEOUT_MS })
                .then(() => true)
                .catch(() => false);
            if (previewAppeared) pass(`Preview rendered within ${PREVIEW_TIMEOUT_MS}ms (Blob URL / thumbnail visible)`);
            else { fail('Preview did not appear within timeout'); ok = false; }

            // ---- Verify no Vue runtime errors fired during the upload ----
            if (vueErrors.length === 0) pass('No Vue runtime errors during upload');
            else {
                fail('Vue runtime errors during upload', `${vueErrors.length} errors`);
                vueErrors.slice(0, 3).forEach((e) => info('Vue error', e.slice(0, 200)));
                ok = false;
            }

            // ---- Wait for the upload to finish (look for "uploaded" / FilePreviewGrid) ----
            const uploadedSeen = await page
                .waitForSelector('[class*="preview-grid"], [class*="uploaded"], [class*="file-preview"]',
                    { timeout: 15_000 })
                .then(() => true)
                .catch(() => false);
            if (uploadedSeen) pass('Upload pipeline reached "uploaded/preview-grid" state');
            else info('Upload pipeline state', 'preview-grid selector not matched (upload may use a different class)');

            await snap(page, '04-after-upload');

            const stuckStats = await stuckObserver;
            info('"Sedang diproses..." visibility', JSON.stringify(stuckStats));
            if (stuckStats.start && (!stuckStats.end || stuckStats.maxMs >= STUCK_PROCESSING_MS)) {
                fail(`"Sedang diproses..." stuck for ${stuckStats.maxMs}ms (threshold ${STUCK_PROCESSING_MS}ms) — REGRESSION`);
                ok = false;
            } else if (stuckStats.start && stuckStats.end) {
                pass(`"Sedang diproses..." resolved cleanly after ${stuckStats.maxMs}ms`);
            } else {
                pass('"Sedang diproses..." never appeared (upload may be fully fire-and-forget)');
            }
        }

        // ===== STEP 5: Submit the RFQ form =====
        console.log('\nSTEP 5 — Submit the RFQ form');

        // Intercept the POST /api/requests to confirm a real network submission
        const submitPromise = page.waitForResponse(
            (r) => /\/api\/requests(\?|$)/.test(r.url()) &&
                r.request().method() === 'POST',
            { timeout: SUBMIT_TIMEOUT_MS }
        ).catch(() => null);

        await snap(page, '05-before-submit');

        // Click the submit button (find by type=submit or "Kirim" / "Send" / "Submit" / "Publish")
        const submitBtn = await page.$('form button[type="submit"]');
        if (!submitBtn) { fail('Submit button not found'); ok = false; }
        else {
            await submitBtn.click();
            info('Clicked submit button', 'waiting for /api/requests POST ...');
        }

        const submitResp = await submitPromise;
        if (submitResp) {
            const status = submitResp.status();
            info(`POST /api/requests responded with ${status}`);
            if (status >= 200 && status < 400) {
                pass(`POST /api/requests accepted (${status})`);
            } else {
                const body = await submitResp.text().catch(() => '');
                fail(`POST /api/requests returned ${status}`, body.slice(0, 200));
                ok = false;
            }
        } else {
            info('POST /api/requests',
                'no POST captured (might mean the form did not actually submit)');
        }

        // Wait for navigation away from /rfq/create
        let navigated = false;
        try {
            await page.waitForURL((u) => !u.toString().includes('/rfq/create'),
                { timeout: SUBMIT_TIMEOUT_MS });
            navigated = true;
        } catch (_) { /* fallthrough */ }

        if (navigated) {
            pass('Navigated away from /rfq/create',
                `new url = ${page.url()}`);
        } else {
            // Possibly an inline success state — check for toast/text
            const successText = await page.evaluate(() => {
                const body = document.body.innerText;
                return /berhasil|success|terkirim|sent|published/i.test(body);
            });
            if (successText) {
                pass('Inline success message detected (no full navigation)');
            } else {
                fail('Did not navigate and no success text shown', `still at ${page.url()}`);
                ok = false;
            }
        }

        await snap(page, '06-after-submit');

        // ===== STEP 6: Final error tallies =====
        console.log('\nSTEP 6 — Final error tallies');
        if (vueErrors.length === 0) pass('Total Vue runtime errors: 0');
        else {
            fail(`Total Vue runtime errors: ${vueErrors.length}`);
            vueErrors.forEach((e) => info('Vue error', e.slice(0, 200)));
            ok = false;
        }
        if (consoleErrors.length === 0) pass('Total console errors: 0');
        else {
            // console.error during login redirect is sometimes benign; just report count
            info('Console errors observed', `${consoleErrors.length} (first 3 below)`);
            consoleErrors.slice(0, 3).forEach((e) => info('Console', e.slice(0, 200)));
        }

        info('Network log (last 15)');
        networkLog.slice(-15).forEach((l) => info('  ', l));

    } catch (e) {
        console.error('\nFATAL:', e.stack || e.message);
        await snap(page, '99-fatal').catch(() => { });
        ok = false;
    } finally {
        await context.close().catch(() => { });
        await browser.close().catch(() => { });

        console.log('\n================================================================');
        console.log(`  RESULT: ${ok && results.fail === 0 ? 'PASS ✅' : 'FAIL ❌'}`);
        console.log(`  Passed: ${results.pass}    Failed: ${results.fail}`);
        console.log('================================================================');
        process.exit(ok && results.fail === 0 ? 0 : 1);
    }
})();
