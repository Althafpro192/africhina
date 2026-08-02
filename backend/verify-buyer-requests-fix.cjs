// verify-buyer-requests-fix.cjs
// Autonomous verification that the previously-empty buyer requests list now
// renders. Uses the seeded buyer account, logs in via the real UI, then
// navigates to /buyer/requests and asserts:
//   1. login succeeds
//   2. /buyer/requests page loads with no 5xx from /api/requests
//   3. at least one RFQ row is rendered in the DOM
//   4. no Vue runtime errors appear in the console
//   5. screenshot the page for visual evidence
//
// Run with: PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 node verify-buyer-requests-fix.cjs

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:8000';
const BUYER = { email: 'buyer@africhina.com', password: 'password123' };
const SCREEN_DIR = path.resolve('/home/althaf/project/cedric/program/africhina-web/test-results/fix-buyer-requests');
const SCREEN_PREFIX = path.join(SCREEN_DIR, 'fix-buyer-requests');

const results = { passed: 0, failed: 0, errors: [] };
function assert(name, cond, info = '') {
    if (cond) {
        results.passed++;
        console.log(`  [PASS] ${name}`);
    } else {
        results.failed++;
        results.errors.push({ name, info });
        console.log(`  [FAIL] ${name} ${info}`);
    }
}

(async () => {
    fs.mkdirSync(SCREEN_DIR, { recursive: true });

    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await ctx.newPage();

    const consoleErrors = [];
    const pageErrors = [];
    const apiCalls = [];
    page.on('console', (m) => {
        const t = m.type();
        if (t === 'error' || t === 'warning') {
            const txt = m.text();
            // filter out the predictable axios 401 noise before login completes
            if (!/401 \(Unauthorized\)/.test(txt) && !/Request failed with status code 401/.test(txt)) {
                consoleErrors.push({ type: t, text: txt });
            }
        }
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('response', (res) => {
        const u = res.url();
        if (/\/api\/requests(\b|\?|\/)/.test(u) && !/\/api\/requests\//.test(u)) {
            apiCalls.push({ url: u, status: res.status() });
        }
    });

    try {
        console.log('\n=== STEP 1: open login page ===');
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.screenshot({ path: `${SCREEN_PREFIX}-01-login.png` });
        assert('login page loaded', true);

        console.log('\n=== STEP 2: fill credentials ===');
        // Wait for either email input rendered by app
        await page.waitForSelector('input[type="email"]', { timeout: 15000 });
        await page.fill('input[type="email"]', BUYER.email);
        await page.fill('input[type="password"]', BUYER.password);
        await page.screenshot({ path: `${SCREEN_PREFIX}-02-filled.png` });
        assert('credentials filled', true);

        console.log('\n=== STEP 3: submit login ===');
        // capture POST /api/auth/login response
        const loginResp = page.waitForResponse(
            (r) => /\/api\/auth\/login/.test(r.url()) && r.request().method() === 'POST',
            { timeout: 15000 }
        );
        await page.click('button[type="submit"]');
        let loginOk = false;
        try {
            const r = await loginResp;
            loginOk = r.status() === 200 || r.status() === 201;
            console.log(`  login HTTP=${r.status()}`);
        } catch (e) {
            console.log(`  login response wait failed: ${e.message}`);
        }
        // wait for navigation away from /login
        await page.waitForURL((u) => !/\/login/.test(u.toString()), { timeout: 20000 }).catch(() => { });
        await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => { });
        await page.screenshot({ path: `${SCREEN_PREFIX}-03-after-login.png` });
        assert('login succeeded (HTTP 200)', loginOk);

        console.log('\n=== STEP 4: navigate to /buyer/requests ===');
        // First clear any stale apiCalls from the login flow
        apiCalls.length = 0;
        const requestsCalls = [];
        const reqListener = (res) => {
            const u = res.url();
            // List endpoint (not detail)
            if (new URL(u).pathname === '/api/requests') {
                requestsCalls.push({ url: u, status: res.status(), method: res.request().method() });
            }
        };
        page.on('response', reqListener);
        await page.goto(`${BASE_URL}/buyer/requests`, { waitUntil: 'networkidle', timeout: 30000 });
        // Also wait for the list call explicitly
        try {
            await page.waitForResponse(
                (r) => new URL(r.url()).pathname === '/api/requests' && r.request().method() === 'GET',
                { timeout: 15000 }
            );
        } catch (e) {
            console.log(`  waitForResponse timeout: ${e.message}`);
        }
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${SCREEN_PREFIX}-04-list.png`, fullPage: true });
        page.off('response', reqListener);

        console.log('\n=== STEP 5: inspect list result ===');
        console.log(`  /api/requests calls: ${JSON.stringify(requestsCalls)}`);
        const listOk = requestsCalls.some((c) => c.status === 200);
        const listFailed = requestsCalls.some((c) => c.status >= 500);
        assert('GET /api/requests returned 200', listOk);
        assert('GET /api/requests had no 5xx', !listFailed);

        // Look for any visible "Request not found" / 500 / HY001 / error toast
        const bodyText = await page.evaluate(() => document.body && document.body.innerText);
        const leakedError =
            /Out of sort memory/i.test(bodyText) ||
            /HY001/.test(bodyText) ||
            /500 \(Internal Server Error\)/.test(bodyText) ||
            /Request not found/.test(bodyText) ||
            /SQLSTATE/i.test(bodyText);
        assert('page does not show SQL/500/HY001 errors', !leakedError, leakedError ? bodyText.slice(0, 200) : '');

        // Try to count RFQ rows. Each card shows product_name + a status badge.
        // The buyer Requests.vue page never displays the UUID in text, so we look
        // for the structural evidence (a "TARGET QTY" label is unique to each RFQ
        // card on this view, plus a known seeded product name and the status
        // badge).
        const html = await page.content();
        const renderedCount = {
            // count distinct "TARGET QTY" labels – one per RFQ card
            targetQty: (html.match(/TARGET QTY/g) || []).length,
            // specific products we know exist (from the API probe of /api/requests)
            hasSolar: /Solar Inverter/i.test(bodyText),
            hasAwaiting: /Awaiting Admin Quote|Awaiting Final Agreement/i.test(bodyText),
            // generic row-by class name in the list
            rfqCards: (html.match(/cursor-pointer flex flex-col gap-3/g) || []).length,
        };
        console.log('  rendered evidence:', JSON.stringify(renderedCount));
        const rowsRendered =
            renderedCount.targetQty >= 1 ||
            renderedCount.rfqCards >= 1 ||
            renderedCount.hasSolar;
        assert('at least one RFQ card is rendered', rowsRendered, JSON.stringify(renderedCount));

        console.log('\n=== STEP 6: console/page errors ===');
        const realPageErrors = pageErrors.filter((s) => !/NetworkError|AbortError/.test(s));
        const realConsoleErrors = consoleErrors.filter(
            (c) =>
                !/Network|401|403|sourcemap|favicon|net::ERR_/i.test(c.text) &&
                !/Request failed with status code 401/.test(c.text)
        );
        assert('no Vue pageerrors', realPageErrors.length === 0, JSON.stringify(realPageErrors));
        assert(
            'no relevant console errors',
            realConsoleErrors.length === 0,
            JSON.stringify(realConsoleErrors.slice(0, 3))
        );

        console.log('\n=== STEP 7: inspect full API log summary ===');
        console.log(`  total /api/requests calls observed: ${apiCalls.length}`);
        for (const c of apiCalls) console.log(`    ${c.method} ${c.url} -> ${c.status}`);
    } finally {
        await page.screenshot({ path: `${SCREEN_PREFIX}-99-final.png`, fullPage: true }).catch(() => { });
        await browser.close();
    }

    console.log('\n========================================');
    console.log(` PASSED: ${results.passed}`);
    console.log(` FAILED: ${results.failed}`);
    console.log('========================================');
    if (results.failed > 0) {
        console.log('FAILURES:');
        for (const f of results.errors) console.log(`  - ${f.name} :: ${f.info}`);
        process.exit(1);
    } else {
        console.log('ALL CHECKS PASSED.');
        process.exit(0);
    }
})();
