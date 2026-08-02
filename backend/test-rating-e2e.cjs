/**
 * E2E TEST: Ratings Moderation — pull from MySQL
 *
 * Verifies the fix for "Perbaiki rating — ambil data dari MySQL":
 *  1. Admin logs in
 *  2. Admin navigates to /admin/ratings
 *  3. The moderation page renders the rating row(s) from MySQL via GET /api/admin/ratings
 *  4. The new "Supplier" column shows the joined supplier company name
 *  5. The "Publish/Unpublish" toggle button works (POST /api/admin/ratings/{id}/toggle-publish)
 *  6. The previously broken GET /api/ratings now returns JSON (not the SPA HTML shell)
 *
 * Run:  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 node test-rating-e2e.cjs
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8000';
const SCREENSHOT_DIR = path.join(__dirname, 'test-results', 'rating-e2e');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const ADMIN_EMAIL = 'admin@africhina.com';
const ADMIN_PASSWORD = 'password123';

// Expected seeded data from MySQL
const EXPECTED_BUYER = 'Updated Buyer Name';
const EXPECTED_BUYER_COMPANY = 'West Africa Traders Ltd';
const EXPECTED_SUPPLIER = 'Yiwu Smart Solar Technology Co., Ltd.';

let pass = 0;
let fail = 0;
const results = [];

function record(name, ok, detail = '') {
    if (ok) { pass++; }
    else { fail++; }
    const line = `${ok ? '[PASS]' : '[FAIL]'} ${name}${detail ? ' — ' + detail : ''}`;
    console.log(line);
    results.push({ name, ok, detail });
}

function shot(page, label) {
    return page.screenshot({ path: path.join(SCREENSHOT_DIR, `${Date.now()}-${label}.png`), fullPage: true });
}

(async () => {
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    // Surface all network failures
    page.on('requestfailed', req => {
        console.log(`[NET-FAIL] ${req.method()} ${req.url()} :: ${req.failure()?.errorText}`);
    });
    page.on('response', resp => {
        const u = resp.url();
        if (u.includes('/api/') && !u.includes('/auth/login')) {
            // console.log(`[API] ${resp.status()} ${resp.request().method()} ${u}`);
        }
    });
    page.on('pageerror', err => console.log('[PAGE-ERROR]', err.message));
    page.on('console', msg => {
        if (msg.type() === 'error') console.log('[CONSOLE-ERROR]', msg.text());
    });

    try {
        // ====== 1. Confirm previously-broken endpoint now returns JSON ======
        console.log('\n=== 1. Direct API check: /api/ratings now returns JSON (was HTML shell) ===');
        const apiResp = await ctx.request.get(`${BASE}/api/ratings`);
        const apiContentType = apiResp.headers()['content-type'] || '';
        const apiBody = await apiResp.text();
        const isJson = apiContentType.includes('application/json');
        const isHtml = apiBody.trim().startsWith('<');
        record('GET /api/ratings returns JSON (not HTML shell)', isJson && !isHtml,
            `status=${apiResp.status()} content-type=${apiContentType} startsWith=${apiBody.slice(0, 40)}`);

        // ====== 2. Admin login via UI ======
        console.log('\n=== 2. Admin login ===');
        await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(800);
        await shot(page, 'login');

        // Fill the login form (label-based, robust)
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        const passInput = page.locator('input[type="password"], input[name="password"]').first();
        await emailInput.fill(ADMIN_EMAIL);
        await passInput.fill(ADMIN_PASSWORD);
        await shot(page, 'login-filled');

        const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
        await submitBtn.click();

        // Wait for redirect away from /login
        try {
            await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 15000 });
        } catch (e) {
            record('Admin login redirects away from /login', false, 'still on ' + page.url());
            throw e;
        }
        record('Admin login redirects away from /login', true, 'now at ' + page.url());
        await page.waitForTimeout(1200);
        await shot(page, 'after-login');

        // ====== 3. Navigate to /admin/ratings ======
        console.log('\n=== 3. Navigate to /admin/ratings ===');
        await page.goto(`${BASE}/admin/ratings`, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(1500);
        await shot(page, 'ratings-page');

        // ====== 4. Verify table renders the rating from MySQL ======
        const bodyText = await page.locator('body').innerText();
        record('Page does NOT show "No buyer ratings found" empty state',
            !bodyText.includes('No buyer ratings found for moderation'),
            bodyText.includes('No buyer ratings found') ? 'empty state still showing' : 'table populated');
        record('Buyer name from DB is rendered', bodyText.includes(EXPECTED_BUYER),
            `expected "${EXPECTED_BUYER}" in body`);
        record('Buyer company from DB is rendered', bodyText.includes(EXPECTED_BUYER_COMPANY),
            `expected "${EXPECTED_BUYER_COMPANY}"`);
        record('Supplier company from DB is rendered (NEW column)',
            bodyText.includes(EXPECTED_SUPPLIER),
            `expected "${EXPECTED_SUPPLIER}"`);
        record('Reviews count is 1 (not 0)', /\b1\s+reviews?\b/i.test(bodyText),
            'looking for "1 reviews" or "1 review"');

        // Verify Supplier column header exists
        const supplierHeader = await page.locator('th:has-text("Supplier")').count();
        record('Supplier column header exists', supplierHeader > 0, `found ${supplierHeader} <th>Supplier</th>`);

        // Star rating rendering
        const starRow = await page.locator('td:has-text("★")').count();
        record('Star rating rendered in table', starRow > 0, `star cells: ${starRow}`);

        // ====== 5. Toggle publish button ======
        console.log('\n=== 5. Toggle publish ===');
        const toggleBtn = page.locator('button:has-text("Unpublish"), button:has-text("Publish")').first();
        const toggleBefore = await toggleBtn.textContent();
        await toggleBtn.click();
        await page.waitForTimeout(1500);
        const toggleAfter = await page.locator('button:has-text("Unpublish"), button:has-text("Publish")').first().textContent();
        record('Publish/Unpublish button toggles',
            toggleBefore?.trim() !== toggleAfter?.trim(),
            `before="${toggleBefore?.trim()}" after="${toggleAfter?.trim()}"`);

        // Toggle back to original
        await page.locator('button:has-text("Unpublish"), button:has-text("Publish")').first().click();
        await page.waitForTimeout(1200);
        await shot(page, 'after-toggle-back');

        // ====== 6. Verify /api/ratings also returns data ======
        console.log('\n=== 6. Verify GET /api/ratings with admin token returns the same data ===');
        const token = await page.evaluate(() => localStorage.getItem('token') || localStorage.getItem('access_token') || '');
        if (token) {
            const r = await ctx.request.get(`${BASE}/api/ratings`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
            const arr = await r.json();
            const ok = Array.isArray(arr) && arr.length >= 1 && arr[0].supplier_company === EXPECTED_SUPPLIER;
            record('GET /api/ratings returns the same data (with supplier_company)', ok,
                `count=${Array.isArray(arr) ? arr.length : 'NOT-ARRAY'} first.supplier_company=${Array.isArray(arr) ? arr[0]?.supplier_company : 'n/a'}`);
        } else {
            record('GET /api/ratings with admin token', false, 'no token in localStorage');
        }

        // ====== 7. Verify /api/ratings/supplier/{id} also returns joined supplier_company ======
        console.log('\n=== 7. Verify GET /api/ratings/supplier/{id} ===');
        if (token) {
            // get supplier id from earlier API call
            const allResp = await ctx.request.get(`${BASE}/api/ratings`, { headers: { Authorization: `Bearer ${token}` } });
            const allArr = await allResp.json();
            const supId = allArr[0]?.supplier_id;
            if (supId) {
                const r = await ctx.request.get(`${BASE}/api/ratings/supplier/${supId}`, { headers: { Authorization: `Bearer ${token}` } });
                const arr = await r.json();
                const ok = Array.isArray(arr) && arr.length >= 1 && arr[0].supplier_company === EXPECTED_SUPPLIER;
                record('GET /api/ratings/supplier/{id} returns supplier_company', ok,
                    `count=${Array.isArray(arr) ? arr.length : 'NOT-ARRAY'}`);
            }
        }

        // ====== Done ======
        console.log(`\n=== SUMMARY ===`);
        console.log(`PASS: ${pass}`);
        console.log(`FAIL: ${fail}`);
        fs.writeFileSync(
            path.join(SCREENSHOT_DIR, 'rating-e2e-report.json'),
            JSON.stringify({ pass, fail, results, timestamp: new Date().toISOString() }, null, 2)
        );

        if (fail > 0) {
            console.log('\n❌ TEST FAILED');
            process.exitCode = 1;
        } else {
            console.log('\n✅ TEST PASSED');
        }
    } catch (err) {
        console.error('TEST ERROR:', err);
        await shot(page, 'error');
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
})();
