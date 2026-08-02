/**
 * ============================================================================
 * E2E TEST: ISSUE F - Driver Phone Number Validation
 * ============================================================================
 *
 * Verifies:
 *   1. Backend regex rejects alphabetic / special / too-short phones (store).
 *   2. Backend regex rejects alphabetic phones on update.
 *   3. Backend regex accepts plain digits, +prefix, spaces, dashes, parens.
 *   4. Backend accepts null/empty phone (nullable).
 *   5. Frontend HTML5 attrs (type=tel, inputmode=numeric, pattern, maxlength).
 *   6. Frontend blocks alphabetic chars from being typed.
 *   7. Frontend accepts valid formatted phone via paste.
 *   8. Full form submit with valid phone reaches backend (201).
 *
 * Uses Zorin OS Google Chrome binary; headless=false per project policy.
 * Run with: PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 node frontend/test-driver-phone-validation.cjs
 * ============================================================================
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8000';

const ADMIN_CREDENTIALS = {
    email: 'admin@africhina.com',
    password: 'password123'
};

const CHROME_PATH = '/usr/bin/google-chrome';

const testResults = {
    startTime: new Date().toISOString(),
    passed: [],
    failed: []
};

function recordResult(category, name, passed, details = '') {
    const symbol = passed ? '✅' : '❌';
    const entry = `${symbol} [${category}] ${name}${details ? ' — ' + details : ''}`;
    console.log(entry);
    (passed ? testResults.passed : testResults.failed).push(entry);
}

// ─── Native fetch helpers (no axios dependency) ──────────────────────────────
async function apiPost(url, body, token) {
    const r = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });
    let json = null;
    try { json = await r.json(); } catch (_) { json = null; }
    return { status: r.status, data: json };
}

async function apiPut(url, body, token) {
    const r = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    let json = null;
    try { json = await r.json(); } catch (_) { json = null; }
    return { status: r.status, data: json };
}

async function apiDelete(url, token) {
    const r = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            Authorization: `Bearer ${token}`
        }
    });
    let json = null;
    try { json = await r.json(); } catch (_) { json = null; }
    return { status: r.status, data: json };
}

async function loginAsAdmin() {
    const res = await apiPost(`${BACKEND_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    if (res.status !== 200 || !res.data?.token) {
        throw new Error('Login failed: ' + JSON.stringify(res.data));
    }
    return res.data.token;
}

// ─── Backend regex tests ─────────────────────────────────────────────────────
async function runAPIBackendTests() {
    console.log('\n========================================');
    console.log('  LAYER 1 — BACKEND REGEX VALIDATION');
    console.log('========================================\n');

    const token = await loginAsAdmin();

    // 1. Reject alphabetic
    {
        const res = await apiPost(`${BACKEND_URL}/api/admin/drivers`, {
            full_name: 'Test Invalid Alpha',
            email: `test_alpha_${Date.now()}@africhina.com`,
            phone: 'abc1234567890'
        }, token);
        const ok = res.status === 422 && !!res.data?.errors?.phone;
        recordResult('BACKEND-422', 'rejects phone with letters', ok,
            `status=${res.status} errors=${JSON.stringify(res.data?.errors || {}).slice(0, 120)}`);
    }

    // 2. Reject special chars
    {
        const res = await apiPost(`${BACKEND_URL}/api/admin/drivers`, {
            full_name: 'Test Invalid Special',
            email: `test_special_${Date.now()}@africhina.com`,
            phone: '+62@812#3456'
        }, token);
        const ok = res.status === 422 && !!res.data?.errors?.phone;
        recordResult('BACKEND-422', 'rejects phone with @ and #', ok, `status=${res.status}`);
    }

    // 3. Reject too-short
    {
        const res = await apiPost(`${BACKEND_URL}/api/admin/drivers`, {
            full_name: 'Test Invalid Short',
            email: `test_short_${Date.now()}@africhina.com`,
            phone: '+12345'
        }, token);
        const ok = res.status === 422 && !!res.data?.errors?.phone;
        recordResult('BACKEND-422', 'rejects too-short phone (<7 chars)', ok, `status=${res.status}`);
    }

    // 4. Accept plain digits
    {
        const res = await apiPost(`${BACKEND_URL}/api/admin/drivers`, {
            full_name: 'Test Valid Plain',
            email: `test_plain_${Date.now()}@africhina.com`,
            phone: '6281234567890'
        }, token);
        const ok = res.status === 201;
        const driverId = res.data?.driver?.id;
        recordResult('BACKEND-201', 'accepts plain digits "6281234567890"', ok,
            `status=${res.status}`);
        if (driverId) await apiDelete(`${BACKEND_URL}/api/admin/drivers/${driverId}`, token);
    }

    // 5. Accept formatted + update paths
    {
        const res = await apiPost(`${BACKEND_URL}/api/admin/drivers`, {
            full_name: 'Test Valid Formatted',
            email: `test_fmt_${Date.now()}@africhina.com`,
            phone: '+62 812-3456-7890'
        }, token);
        const ok = res.status === 201;
        const driverId = res.data?.driver?.id;
        recordResult('BACKEND-201', 'accepts "+62 812-3456-7890"', ok,
            `status=${res.status}`);

        if (driverId) {
            const upd1 = await apiPut(`${BACKEND_URL}/api/admin/drivers/${driverId}`, {
                phone: '+1 (555) 123-4567'
            }, token);
            recordResult('BACKEND-200', 'update accepts "+1 (555) 123-4567"', upd1.status === 200,
                `status=${upd1.status}`);

            const upd2 = await apiPut(`${BACKEND_URL}/api/admin/drivers/${driverId}`, {
                phone: 'abc'
            }, token);
            recordResult('BACKEND-422', 'update rejects alphabetic phone', upd2.status === 422 && !!upd2.data?.errors?.phone,
                `status=${upd2.status}`);

            await apiDelete(`${BACKEND_URL}/api/admin/drivers/${driverId}`, token);
        }
    }

    // 6. Accept null phone (nullable)
    {
        const res = await apiPost(`${BACKEND_URL}/api/admin/drivers`, {
            full_name: 'Test Null Phone',
            email: `test_null_${Date.now()}@africhina.com`,
            phone: null
        }, token);
        const ok = res.status === 201;
        const driverId = res.data?.driver?.id;
        recordResult('BACKEND-201', 'accepts null phone (nullable)', ok,
            `status=${res.status}`);
        if (driverId) await apiDelete(`${BACKEND_URL}/api/admin/drivers/${driverId}`, token);
    }
}

// ─── Frontend browser tests ─────────────────────────────────────────────────
async function runFrontendBrowserTests() {
    console.log('\n========================================');
    console.log('  LAYER 2 — FRONTEND BROWSER TESTS');
    console.log('========================================\n');

    const browser = await chromium.launch({
        headless: false,
        executablePath: CHROME_PATH,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 }
    });
    const page = await context.newPage();

    try {
        // Login
        await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 15000 });
        await page.fill('input[type="email"], input[name="email"]', ADMIN_CREDENTIALS.email);
        await page.fill('input[type="password"], input[name="password"]', ADMIN_CREDENTIALS.password);
        await page.locator('button[type="submit"]').first().click();
        await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 20000 });

        // Navigate to Drivers page
        await page.goto(`${FRONTEND_URL}/admin/drivers`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });

        // Open Add Driver modal
        const addBtn = page.locator(
            'button:has-text("Add Driver"), button:has-text("Tambah Driver"), ' +
            'button:has-text("添加司机"), button:has-text("Ajouter un Chauffeur")'
        ).first();
        await addBtn.waitFor({ state: 'visible', timeout: 15000 });
        await addBtn.click();

        // Locate the phone input
        const phoneInput = page.locator('input[type="tel"]').first();
        await phoneInput.waitFor({ state: 'visible', timeout: 10000 });

        // HTML5 attrs present?
        const pattern = await phoneInput.getAttribute('pattern');
        const inputmode = await phoneInput.getAttribute('inputmode');
        const maxlength = await phoneInput.getAttribute('maxlength');
        const placeholder = await phoneInput.getAttribute('placeholder');
        recordResult('FRONTEND-ATTR', 'inputmode="numeric"', inputmode === 'numeric', `got: ${inputmode}`);
        recordResult('FRONTEND-ATTR', 'maxlength="30"', maxlength === '30', `got: ${maxlength}`);
        recordResult('FRONTEND-ATTR', 'pattern attribute set', !!pattern && pattern.length > 0, `got: ${pattern}`);
        recordResult('FRONTEND-ATTR', 'placeholder set', !!placeholder, `got: ${placeholder}`);

        // Test F1: typing alphabetic chars should be blocked
        await phoneInput.click();
        await phoneInput.fill('');
        await phoneInput.type('abc1234567890', { delay: 30 });
        const valueAfterAlpha = await phoneInput.inputValue();
        const onlyAllowedChars = /^[0-9 +\-()]*$/.test(valueAfterAlpha);
        recordResult('FRONTEND-TYPING', 'alphabetic chars blocked in phone', onlyAllowedChars,
            `value after typing "abc1234567890" = "${valueAfterAlpha}"`);

        // Test F2: typing valid characters should be allowed
        await phoneInput.fill('');
        await phoneInput.type('+6281234567890', { delay: 30 });
        const valueAfterValid = await phoneInput.inputValue();
        recordResult('FRONTEND-TYPING', 'valid phone "+6281234567890" accepted', valueAfterValid === '+6281234567890',
            `value = "${valueAfterValid}"`);

        // Test F3: paste a formatted phone; the handler should sanitize it
        // to a clean string of digits (with leading '+') that contains the
        // same digit sequence as the original paste content.
        await phoneInput.fill('');
        const pasteSource = '+62 812-3456-7890';
        const expectedDigits = pasteSource.replace(/\D/g, ''); // "6281234567890"
        await page.evaluate((src) => {
            const inp = document.querySelector('input[type="tel"]');
            const dt = new DataTransfer();
            dt.setData('text', src);
            const ev = new ClipboardEvent('paste', {
                clipboardData: dt, bubbles: true, cancelable: true
            });
            inp.dispatchEvent(ev);
        }, pasteSource);
        const valueAfterPaste = await phoneInput.inputValue();
        // Strip all non-digits from the resulting value and compare with
        // the digit-only version of the source.
        const resultDigits = valueAfterPaste.replace(/\D/g, '');
        const pasteAccepted = resultDigits === expectedDigits;
        recordResult('FRONTEND-PASTE', 'paste of formatted phone works', pasteAccepted,
            `value = "${valueAfterPaste}" (digits=${resultDigits})`);

        // Test F4: full form submit with valid phone
        const uniqueEmail = `e2e_valid_${Date.now()}@africhina.com`;
        const fullNameInput = page.locator('input[required]').nth(0);
        await fullNameInput.fill('E2E Phone Valid Driver');
        await page.locator('input[type="email"]').first().fill(uniqueEmail);
        await phoneInput.fill('');
        await phoneInput.type('+62 812-3456-7890', { delay: 20 });

        const submitResponsePromise = page.waitForResponse(
            resp => resp.url().includes('/api/admin/drivers') && resp.request().method() === 'POST',
            { timeout: 15000 }
        ).catch(() => null);

        const saveBtn = page.locator(
            'button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Simpan"), ' +
            'button[type="submit"]:has-text("保存"), button[type="submit"]:has-text("Enregistrer")'
        ).first();
        await saveBtn.click();

        const submitResp = await submitResponsePromise;
        if (submitResp) {
            const status = submitResp.status();
            recordResult('FRONTEND-SUBMIT', 'POST /api/admin/drivers returns 2xx',
                status >= 200 && status < 300, `status=${status}`);
            await page.waitForTimeout(1500);
            const modalStillOpen = await page.locator('input[type="tel"]').first().isVisible().catch(() => false);
            recordResult('FRONTEND-UI', 'modal closes after successful submit', !modalStillOpen, '');
        } else {
            recordResult('FRONTEND-SUBMIT', 'POST /api/admin/drivers received', false,
                'no network response observed');
        }

        await page.screenshot({ path: 'test-results/issue-f-driver-phone-final.png' });

    } catch (err) {
        recordResult('FRONTEND-FATAL', 'browser test execution', false, err.message);
        try { await page.screenshot({ path: 'test-results/issue-f-driver-phone-error.png' }); } catch (_) { }
    } finally {
        await context.close();
        await browser.close();
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────
(async () => {
    console.log('========================================');
    console.log('  ISSUE F: Driver Phone Validation E2E');
    console.log('========================================');

    try {
        await runAPIBackendTests();
    } catch (err) {
        recordResult('BACKEND-FATAL', 'API test execution', false, err.message);
    }

    try {
        await runFrontendBrowserTests();
    } catch (err) {
        recordResult('FRONTEND-FATAL', 'Browser test execution', false, err.message);
    }

    console.log('\n========================================');
    console.log('  SUMMARY');
    console.log('========================================');
    console.log(`Passed: ${testResults.passed.length}`);
    console.log(`Failed: ${testResults.failed.length}`);
    if (testResults.failed.length > 0) {
        console.log('\nFailed assertions:');
        testResults.failed.forEach(f => console.log('  ' + f));
        process.exitCode = 1;
    } else {
        console.log('\n🎉 All phone validation tests PASSED.');
    }

    const outDir = 'test-results';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
        path.join(outDir, 'issue-f-driver-phone-validation.json'),
        JSON.stringify({
            ...testResults,
            endTime: new Date().toISOString(),
            summary: { passed: testResults.passed.length, failed: testResults.failed.length }
        }, null, 2)
    );

    process.exit(process.exitCode || 0);
})();
