// Autonomous end-to-end test for the FIX:
// "CREATE page cannot upload images but EDIT page works"
//
// Bug Root Cause: XHR in useFileUpload.js did not send Bearer token,
// so the pre-upload POST /api/upload returned 401 Unauthenticated and
// submitRequest() aborted with "Some files failed to upload".
//
// Fix applied: useFileUpload.js now sends
//   xhr.withCredentials = true
//   xhr.setRequestHeader('Authorization', `Bearer ${getStoredToken()}`)
//
// This test exercises the full UI flow:
//   1. Login as buyer
//   2. Navigate to /buyer/rfq/create
//   3. Fill required fields
//   4. Upload a file via the hidden input
//   5. Submit
//   6. Verify redirect to /buyer/requests and that the new request shows
//      the image (i.e. the uploaded URL made it into the DB)

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CONFIG = {
    baseUrl: 'http://localhost:8000',
    apiUrl: 'http://localhost:8000/api',
    headless: false,
    slowMo: 250,
    timeout: 60000,
    screenshotDir: path.join(__dirname, 'test-results', 'rfq-create-upload'),
    credentials: {
        buyer: { email: 'buyer@africhina.com', password: 'password123' },
    },
    fixture: '/tmp/fixture-rfq-upload.png',
};

function ts() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function log(step, msg) {
    const line = `  [${step}] ${msg}`;
    console.log(line);
}

async function shot(page, name) {
    if (!fs.existsSync(CONFIG.screenshotDir)) {
        fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
    }
    const file = path.join(CONFIG.screenshotDir, `${name}-${ts()}.png`);
    await page.screenshot({ path: file, fullPage: true });
    log('SHOT', file);
    return file;
}

async function login(page) {
    log('LOGIN', 'Opening /login');
    await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', CONFIG.credentials.buyer.email);
    await page.fill('input[type="password"]', CONFIG.credentials.buyer.password);
    await shot(page, '01-login-filled');
    log('LOGIN', 'Submitting credentials');
    await Promise.all([
        page.waitForURL(/\/(buyer|admin)\/dashboard/, { timeout: CONFIG.timeout }),
        page.click('button[type="submit"]'),
    ]);
    log('LOGIN', `Logged in -> ${page.url()}`);
    await shot(page, '02-after-login');
}

async function gotoCreatePage(page) {
    log('NAV', 'Goto /buyer/rfq/create');
    const resp = await page.goto(`${CONFIG.baseUrl}/buyer/rfq/create`, {
        waitUntil: 'networkidle',
    });
    log('NAV', `HTTP ${resp ? resp.status() : 'n/a'} for /buyer/rfq/create`);
    await shot(page, '03-rfq-create-loaded');
    // Wait for our form input to appear (not the select with options)
    await page.waitForSelector('input[placeholder*="Solar Panel"]', { timeout: CONFIG.timeout });
    log('NAV', 'Form is visible');
}

async function fillForm(page) {
    log('FILL', 'Product Name');
    await page.fill('input[placeholder*="Solar Panel"]', 'VerifyUpload Fixture Laptop');

    log('FILL', 'Category (select first non-placeholder option)');
    // First select with required on the page is the category
    const categorySelect = page.locator('select').first();
    const categoryOptions = await categorySelect.locator('option').allTextContents();
    log('FILL', `Category options: ${JSON.stringify(categoryOptions)}`);
    // Pick the first non-disabled, non-empty value
    await categorySelect.selectOption({ index: 1 });

    log('FILL', 'Sub Category');
    await page.fill('input[placeholder*="Solar Panels"]', 'Test Fixture Subcategory');

    log('FILL', 'Specifications');
    await page.fill(
        'textarea[placeholder*="technical specs"]',
        'Autonomous test fixture used to verify the CREATE-page upload fix.',
    );

    log('FILL', 'Quantity');
    await page.fill('input[type="number"]', '25');

    log('FILL', 'Budget Range');
    // Budget select is the 3rd <select> on the page (category, unit, currency, budget, ...).
    // To be robust, find by its first option text.
    const budgetSelect = page.locator('select', { has: page.locator('option[value="1k-5k"]') }).first();
    await budgetSelect.selectOption('1k-5k');

    log('FILL', 'Delivery Date');
    // Today + 30 days -> YYYY-MM-DD
    const dt = new Date();
    dt.setDate(dt.getDate() + 30);
    const isoDate = dt.toISOString().slice(0, 10);
    await page.fill('input[type="date"]', isoDate);
    log('FILL', `Delivery date = ${isoDate}`);

    log('FILL', 'Shipping Terms');
    const shippingSelect = page.locator('select', { has: page.locator('option[value="FOB"]') }).first();
    await shippingSelect.selectOption('FOB');

    log('FILL', 'Payment Terms');
    const paymentSelect = page.locator('select', { has: page.locator('option[value="TT"]') }).first();
    await paymentSelect.selectOption('TT');

    await shot(page, '04-form-filled');
}

async function uploadFile(page) {
    log('UPLOAD', `Setting file on hidden input: ${CONFIG.fixture}`);
    if (!fs.existsSync(CONFIG.fixture)) {
        throw new Error(`Fixture not found: ${CONFIG.fixture}`);
    }
    // The hidden file input is in the FileUpload component
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CONFIG.fixture);
    // Wait for the FileUpload component to render a preview tile
    await page.waitForTimeout(800);
    await shot(page, '05-file-selected');
    log('UPLOAD', 'File selected (preview should now be visible)');
}

async function submitForm(page) {
    log('SUBMIT', 'Clicking the submit button');
    const submitBtn = page.locator('button[type="submit"]').last();
    // Click then wait for redirect to /buyer/requests
    await Promise.all([
        page.waitForURL(/\/buyer\/requests($|\/)/, { timeout: CONFIG.timeout }),
        submitBtn.click(),
    ]);
    log('SUBMIT', `Redirected to ${page.url()}`);
    // Wait for the list to settle
    await page.waitForLoadState('networkidle');
    await shot(page, '06-requests-list');
}

async function verifyImagePersisted(page) {
    log('VERIFY', 'GET /api/requests to confirm latest request has image_urls');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    if (!token) throw new Error('No token in localStorage after submit');

    const apiResp = await page.evaluate(async (args) => {
        const res = await fetch(`${args.api}/requests`, {
            headers: {
                Authorization: `Bearer ${args.token}`,
                Accept: 'application/json',
            },
        });
        return { status: res.status, body: await res.text() };
    }, { api: CONFIG.apiUrl, token });

    log('VERIFY', `GET /requests HTTP ${apiResp.status}`);
    if (apiResp.status !== 200) {
        throw new Error(`Expected 200 from /requests/buyer, got ${apiResp.status}`);
    }
    const json = JSON.parse(apiResp.body);
    const list = Array.isArray(json) ? json : (json.data || json.requests || []);
    log('VERIFY', `List size: ${list.length}`);
    const latest = list[0];
    if (!latest) throw new Error('Request list is empty');
    log('VERIFY', `Latest request: id=${latest.id} product="${latest.product_name}"`);

    // Probe the detail endpoint to inspect image_urls
    const detailResp = await page.evaluate(async (args) => {
        const res = await fetch(`${args.api}/requests/${args.id}`, {
            headers: { Authorization: `Bearer ${args.token}`, Accept: 'application/json' },
        });
        return { status: res.status, body: await res.text() };
    }, { api: CONFIG.apiUrl, id: latest.id, token });

    log('VERIFY', `GET /requests/${latest.id} HTTP ${detailResp.status}`);
    if (detailResp.status !== 200) {
        throw new Error(`Expected 200 from detail, got ${detailResp.status}`);
    }
    const detail = JSON.parse(detailResp.body);
    const data = detail.data || detail;
    const urls = data.image_urls || data.images || [];
    log('VERIFY', `image_urls on latest request: ${JSON.stringify(urls)}`);
    if (!urls || urls.length === 0) {
        throw new Error('Latest request has NO image_urls -> upload did not persist');
    }
    log('VERIFY', 'FIX CONFIRMED: image URLs persisted on the new request');
    return { id: latest.id, urls };
}

async function main() {
    const results = { steps: [], passed: false, error: null };
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: CONFIG.headless,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    const ctx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        acceptDownloads: true,
    });
    const page = await ctx.newPage();

    // Capture every API call to /api/upload for the forensics line
    const uploadCalls = [];
    page.on('request', (req) => {
        if (req.url().includes('/api/upload')) {
            const headers = req.headers();
            uploadCalls.push({
                method: req.method(),
                url: req.url(),
                auth: headers.authorization || '(none)',
                cookie: headers.cookie || '(none)',
            });
        }
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') console.log('  [console.error]', msg.text());
    });

    try {
        results.steps.push({ name: 'login', ok: true });
        await login(page);

        results.steps.push({ name: 'goto_create', ok: true });
        await gotoCreatePage(page);

        results.steps.push({ name: 'fill_form', ok: true });
        await fillForm(page);

        results.steps.push({ name: 'upload_file', ok: true });
        await uploadFile(page);

        results.steps.push({ name: 'submit_form', ok: true });
        await submitForm(page);

        results.steps.push({ name: 'verify_image', ok: true });
        const persisted = await verifyImagePersisted(page);

        log('FORENSICS', `uploadCalls length: ${uploadCalls.length}`);
        uploadCalls.forEach((c, i) => {
            log('FORENSICS', `  #${i} ${c.method} ${c.url}  Authorization=${c.auth.slice(0, 40)}`);
        });

        await shot(page, '07-final-verified');

        results.passed = true;
        results.persisted = persisted;
        console.log('\n========================================');
        console.log('RESULT: PASS');
        console.log('========================================');
    } catch (err) {
        results.error = String(err && err.stack || err);
        console.log('\n========================================');
        console.log('RESULT: FAIL');
        console.log('Reason:', results.error);
        console.log('========================================');
        try { await shot(page, '99-failure'); } catch (_) { }
    } finally {
        await ctx.close();
        await browser.close();
        fs.writeFileSync(
            path.join(CONFIG.screenshotDir, 'result.json'),
            JSON.stringify({ ...results, uploadCalls }, null, 2),
        );
        process.exit(results.passed ? 0 : 1);
    }
}

main().catch((e) => {
    console.error('Uncaught error:', e);
    process.exit(1);
});
