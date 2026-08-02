/**
 * One-shot diagnostic for the login timeout in verify-rfq-upload-optimization.cjs.
 *
 * Hypothesis:
 *   The test fills password="password" but the seeded buyer uses password="password123".
 *   That makes authService.login() reject with 401, the handler sets errorMsg, and
 *   page.waitForURL('buyer route glob') never resolves -> Timeout 10000ms exceeded.
 *
 * What this script does:
 *   1. Captures every network response, especially /api/auth/login.
 *   2. Submits the SAME form values as the failing test.
 *   3. After 5s, prints: url, status, response body, visible errorMsg text,
 *      localStorage token, and a screenshot.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8000';
const OUT_DIR = path.join(__dirname, '..', 'test-results');

(async () => {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const browser = await chromium.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();

    const apiLog = [];
    page.on('response', async (resp) => {
        const u = resp.url();
        if (u.includes('/api/')) {
            let body = null;
            try { body = await resp.text(); } catch (_) { body = '<unreadable>'; }
            apiLog.push({
                url: u,
                status: resp.status(),
                method: resp.request().method(),
                body: body ? body.slice(0, 400) : null,
            });
        }
    });
    page.on('pageerror', (e) => console.log('[pageerror]', e.message));

    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'buyer@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Give it 5s - enough for a 401 response to land.
    await page.waitForTimeout(5000);

    const url = page.url();
    const errorVisible = await page
        .$eval('.bg-rose-50', (n) => n.textContent.trim())
        .catch(() => null);
    const tokenInStorage = await page.evaluate(() => localStorage.getItem('token'));
    const userInStorage = await page.evaluate(() => localStorage.getItem('user'));
    const screenshot = path.join(OUT_DIR, 'rfq-login-debug.png');
    await page.screenshot({ path: screenshot, fullPage: true });

    console.log('--- LOGIN DEBUG ---');
    console.log('URL after submit :', url);
    console.log('Visible errorMsg :', errorVisible);
    console.log('localStorage.token:', tokenInStorage);
    console.log('localStorage.user :', userInStorage);
    console.log('Screenshot        :', screenshot);
    console.log('--- API LOG ---');
    for (const r of apiLog) {
        console.log(`${r.status} ${r.method} ${r.url}`);
        if (r.body) console.log('   body:', r.body);
    }

    await browser.close();
})();
