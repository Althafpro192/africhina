const { chromium } = require('playwright');

const BASE_URL = 'http://127.0.0.1:5173';
const API_URL = 'http://127.0.0.1:8000/api';
const CHROME_PATH = '/usr/bin/google-chrome';

function assert(condition, message) {
    if (!condition) throw new Error(message);
    console.log(`PASS: ${message}`);
}

async function api(page, path, options = {}) {
    return page.evaluate(async ({ path, options, apiUrl }) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}${path}`, {
            ...options,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...(options.headers || {}),
            },
        });
        const body = await response.json().catch(() => ({}));
        return { status: response.status, body };
    }, { path, options, apiUrl: API_URL });
}

async function login(page, email, password, expectedPath) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    const visibleLoginForm = page.locator('form:visible').filter({ has: page.locator('input[type="password"]') }).first();
    await visibleLoginForm.locator('input[type="email"]').fill(email);
    await visibleLoginForm.locator('input[type="password"]').fill(password);
    await visibleLoginForm.locator('button[type="submit"]').click();
    await page.waitForURL(new RegExp(`${expectedPath.replaceAll('/', '\\/')}(?:$|\\?)`), { timeout: 15000 });
    assert(page.url().includes(expectedPath), `${email} logged in and reached ${expectedPath}`);
}

(async () => {
    const browser = await chromium.launch({
        executablePath: CHROME_PATH,
        headless: false,
    });
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    const stamp = Date.now();

    try {
        await login(page, 'test@buyer.com', 'password123', '/buyer/dashboard');

        const created = await api(page, '/requests', {
            method: 'POST',
            body: JSON.stringify({
                product_name: `E2E Discussion RFQ ${stamp}`,
                category: 'general',
                sub_category: 'general',
                specifications: 'Automated discussion-flow verification',
                quantity: 100,
                unit: 'pcs',
                budget_range: '1000-5000',
                currency: 'USD',
                delivery_timeline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                shipping_terms: 'FOB',
                payment_terms: 'T/T',
                quality_requirements: 'E2E quality requirement',
            }),
        });
        assert(created.status === 201, `buyer created RFQ (HTTP ${created.status})`);
        const requestId = created.body.request?.id;
        assert(Boolean(requestId), `created RFQ has an ID (${requestId})`);
        assert(created.body.request.status === 'menunggu_penawaran_admin', 'new RFQ starts in menunggu_penawaran_admin');

        await page.goto(`${BASE_URL}/buyer/rfq/${requestId}`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        assert(await page.locator('textarea').count() > 0, 'buyer chat is visible at initial RFQ status');

        await context.clearCookies();
        await page.evaluate(() => localStorage.clear());
        await login(page, 'test@admin.com', 'admin123', '/admin/dashboard');
        await page.goto(`${BASE_URL}/admin/request/${requestId}`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        const discussionButton = page.locator('button').filter({ hasText: /Open Discussion|Buka Diskusi|Ouvrir la discussion|开启讨论/i });
        await discussionButton.waitFor({ state: 'visible', timeout: 15000 });
        assert(await discussionButton.isVisible(), 'admin Open Discussion button is visible');

        page.once('dialog', dialog => dialog.accept());
        await discussionButton.click();
        await page.waitForFunction(async ({ apiUrl, requestId }) => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/requests/${requestId}`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });
            if (!response.ok) return false;
            const data = await response.json();
            const request = data.request || data;
            return request.status === 'menunggu_kesepakatan_final';
        }, { apiUrl: API_URL, requestId }, { timeout: 15000 });

        const detail = await api(page, `/requests/${requestId}`);
        const request = detail.body.request || detail.body;
        assert(detail.status === 200, 'admin can reload RFQ detail after opening discussion');
        assert(request.status === 'menunggu_kesepakatan_final', 'RFQ transitions to menunggu_kesepakatan_final');
        assert(request.tracking_logs?.some(log => log.status === 'menunggu_kesepakatan_final'), 'discussion transition is present in tracking logs');
        assert(await discussionButton.count() === 0, 'Open Discussion button disappears after transition');

        await context.clearCookies();
        await page.evaluate(() => localStorage.clear());
        await login(page, 'test@buyer.com', 'password123', '/buyer/dashboard');
        await page.goto(`${BASE_URL}/buyer/rfq/${requestId}`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        assert((await page.locator('body').innerText()).includes('Final Agreement'), 'buyer sees translated final-agreement status in English');

        await page.evaluate(() => {
            localStorage.setItem('locale', 'id');
            localStorage.setItem('language', 'id');
        });
        await page.reload({ waitUntil: 'networkidle' });
        const bodyText = await page.locator('body').innerText();
        assert(/kesepakatan final/i.test(bodyText), 'buyer status label changes to Indonesian translation');

        console.log(`E2E_RESULT=PASS request_id=${requestId}`);
    } catch (error) {
        console.error('E2E_RESULT=FAIL');
        console.error(error.stack || error);
        process.exitCode = 1;
    } finally {
        await page.screenshot({ path: 'e2e-3h-discussion-result.png', fullPage: true }).catch(() => { });
        await browser.close();
    }
})();
