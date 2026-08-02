/**
 * Probe: capture every signal during PNG drop on the RFQ create page.
 */
const { chromium } = require('playwright');

const TEST_FILE = '/home/althaf/project/cedric/program/africhina-web/test-results/screenshot-admin-01-dashboard-1785508601022.png';

(async () => {
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
    });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    page.on('console', (msg) => {
        console.log(`[CONSOLE.${msg.type().toUpperCase()}]`, msg.text(), '@', msg.location()?.url);
    });
    page.on('pageerror', (err) => console.log('[PAGE_ERROR]', err.name, err.message, '\n', err.stack));
    page.on('requestfailed', (req) =>
        console.log('[REQ_FAIL]', req.method(), req.url().slice(0, 140), req.failure()?.errorText)
    );
    page.on('response', (resp) => {
        const url = resp.url();
        const status = resp.status();
        if (status >= 400 || url.includes('/api/') || url.includes('/upload')) {
            console.log('[RESP]', status, url.slice(0, 160));
        }
    });

    await page.goto('http://localhost:8000/login');
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'buyer@africhina.com');
    await page.fill('input[type="password"]', 'password123');
    await Promise.all([
        page.waitForURL(/\/buyer/, { timeout: 15000 }),
        page.click('button[type="submit"]'),
    ]);
    console.log('[LOGIN_OK]', page.url());

    await page.goto('http://localhost:8000/buyer/rfq/create');
    await page.waitForSelector('input[type="file"]', { timeout: 15000 });
    console.log('[RFQ_OK]');

    const env = await page.evaluate(() => ({
        hasCrypto: typeof crypto !== 'undefined',
        hasRandomUUID: typeof crypto?.randomUUID === 'function',
        hasSecureCtx: window.isSecureContext,
        href: location.href,
        proto: location.protocol,
    }));
    console.log('[ENV]', JSON.stringify(env));

    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
        console.log('[NO_FILE_INPUT]');
    } else {
        console.log('[UPLOAD]', 'setting file', TEST_FILE);
        await fileInput.setInputFiles(TEST_FILE);
        await page.waitForTimeout(4000);
    }

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('[POST.hasFailedText]', bodyText.includes('Failed to add files'));
    console.log('[POST.hasMaxText]', bodyText.includes('Maximum'));
    console.log('[POST.snippet]', bodyText.slice(0, 700));

    await page.screenshot({ path: '/home/althaf/project/cedric/program/africhina-web/frontend/test-results/probe-after-upload.png', fullPage: true });
    console.log('[DONE]');

    await browser.close();
})().catch((e) => {
    console.error('FATAL', e);
    process.exit(1);
});
