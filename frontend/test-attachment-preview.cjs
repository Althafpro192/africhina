/**
 * E2E Verification Test for Attachment Image Preview Fix
 *
 * Tests that:
 *  1. Admin can log in
 *  2. Admin can navigate to a Request Detail page that has an image attachment
 *  3. The attachment is rendered as an actual <img> element (NOT just "Click to view" text)
 *  4. The image actually loads (naturalWidth > 0) — confirming valid base64 / URL
 *  5. Clicking the image opens the ImageLightbox for full-screen preview
 *
 * Run via:
 *   PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 node frontend/test-attachment-preview.cjs
 *
 * Locale strategy:
 *   We force `localStorage.locale = 'en'` BEFORE the SPA boots via
 *   context.addInitScript(). vue-i18n (configured in main.js) reads the locale
 *   from localStorage on import. Pinning English makes any heading text
 *   assertion locale-agnostic; class-based selectors are already locale-free.
 */

const { chromium } = require('playwright');

// Vite dev server serves the live source with HMR — port 8000 is the stale
// production bundle (see vite.config.js). Always test against :5173.
const BASE = 'http://0.0.0.0:5173';
// Backend API stays on :8000 (Laravel), with Vite proxying /api in dev.
const API = 'http://0.0.0.0:8000/api';

const fs = require('fs');
const path = require('path');

const RESULTS = [];
let totalChecks = 0;
let passedChecks = 0;

function assert(name, condition, details = '') {
    totalChecks += 1;
    if (condition) {
        passedChecks += 1;
        RESULTS.push({ name, status: 'PASS', details });
        console.log(`  ✅ ${name}`);
    } else {
        RESULTS.push({ name, status: 'FAIL', details });
        console.error(`  ❌ ${name}${details ? '  → ' + details : ''}`);
    }
}

async function getToken() {
    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            email: 'admin@africhina.com',
            password: 'password123',
        }),
    });
    const json = await res.json();
    if (!res.ok || !json.token) {
        throw new Error(`Login failed: ${res.status} ${JSON.stringify(json)}`);
    }
    return json.token;
}

// Create a buyer-token request with a base64 image attached.
// We need this because /admin/requests LIST endpoint excludes image_urls
// (heavy base64 column triggers sort memory overflow), and the existing
// requests in the DB don't have image attachments.
async function createBuyerRequestWithImage(buyerEmail = 'buyer@africhina.com', buyerPassword = 'password123') {
    const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: buyerEmail, password: buyerPassword }),
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok || !loginJson.token) {
        throw new Error(`Buyer login failed: ${loginRes.status} ${JSON.stringify(loginJson)}`);
    }
    const buyerToken = loginJson.token;

    // Deterministic valid 32x32 image fixture. Generate the base64 payload from
    // source to avoid fragile/corrupt hardcoded binary PNG bytes.
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ef4444"/></svg>';
    const RED_IMAGE_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

    const formData = new FormData();
    formData.append('product_name', 'Image Preview Test Fixture ' + Date.now());
    formData.append('category', 'electronics');
    formData.append('specifications', 'Autonomous fixture for verifying image preview.');
    formData.append('quantity', '1');
    formData.append('budget_range', '1k-5k');
    formData.append('sub_category', 'Test Sub');
    formData.append('unit', 'pcs');
    formData.append('currency', 'USD');
    formData.append('shipping_terms', 'FOB');
    formData.append('payment_terms', 'TT');
    formData.append('images[]', RED_IMAGE_DATA_URL);

    const createRes = await fetch(`${API}/requests`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${buyerToken}`,
            Accept: 'application/json',
        },
        body: formData,
    });
    const createJson = await createRes.json();
    if (!createRes.ok) {
        throw new Error(`Create request failed: ${createRes.status} ${JSON.stringify(createJson)}`);
    }
    const requestId = createJson?.request?.id || createJson?.id;
    if (!requestId) {
        throw new Error(`Create request did not return an id: ${JSON.stringify(createJson)}`);
    }
    return { requestId, imageUrl: RED_IMAGE_DATA_URL };
}

async function fetchAdminRequestDetail(token, id) {
    const res = await fetch(`${API}/admin/requests/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Admin detail fetch failed: ${res.status}`);
    return res.json();
}

(async () => {
    console.log('\n══════════════════════════════════════════════════════════════');
    console.log('  ATTACHMENT IMAGE PREVIEW — E2E VERIFICATION TEST');
    console.log('══════════════════════════════════════════════════════════════\n');

    let token;
    try {
        console.log('▶ STEP 1: Admin login via API');
        token = await getToken();
        assert('Admin login API returns token', typeof token === 'string' && token.length > 0);
    } catch (e) {
        console.error('FATAL: ' + e.message);
        process.exit(1);
    }

    let requestInfo;
    try {
        console.log('\n▶ STEP 2: Create a buyer request with image attachment (fixture)');
        const created = await createBuyerRequestWithImage();
        requestInfo = { id: created.requestId, image_urls: [created.imageUrl] };
        assert('Buyer created request with image attachment', !!requestInfo.id, `id=${requestInfo.id}`);

        const detail = await fetchAdminRequestDetail(token, requestInfo.id);
        const ok = Array.isArray(detail.image_urls) && detail.image_urls.length > 0
            && detail.image_urls.some((f) => (f || '').startsWith('data:image/'));
        assert('Admin detail endpoint returns image_urls', ok, `image_urls=${JSON.stringify(detail.image_urls).slice(0, 200)}`);
        console.log(`   • Request ID: ${requestInfo.id}`);
        console.log('   • Attachment diagnostics:', (detail.image_urls || []).map((file) => ({
            type: typeof file,
            length: typeof file === 'string' ? file.length : null,
            prefix: typeof file === 'string' ? JSON.stringify(file.slice(0, 100)) : JSON.stringify(file),
        })));
    } catch (e) {
        console.error('FATAL: ' + e.message);
        process.exit(1);
    }

    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
    });
    const ctx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
    });

    // Pin English locale BEFORE the SPA boots.
    await ctx.addInitScript(() => {
        try {
            localStorage.setItem('locale', 'en');
            localStorage.setItem('i18n_locale', 'en');
        } catch (e) { /* private mode etc. — ignore */ }
    });

    const page = await ctx.newPage();

    // Capture page errors / console errors
    page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message));
    page.on('console', (msg) => {
        if (msg.type() === 'error') console.error('CONSOLE ERROR:', msg.text());
    });

    // Also capture API responses for the admin request detail so we can see
    // whether auth is being rejected.
    page.on('response', async (resp) => {
        const u = resp.url();
        if (u.includes('/api/admin/requests/') || u.includes('/api/auth/me')) {
            console.log(`   HTTP ${resp.status()}  ${u}`);
        }
    });

    try {
        console.log('\n▶ STEP 3: Login via UI (Admin demo button)');
        await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.evaluate(() => {
            try { localStorage.setItem('locale', 'en'); } catch (e) { }
        });
        await page.waitForSelector('form', { timeout: 15000 });
        await page.locator('button:has-text("Admin Account")').first().click();
        await page.locator('form').first().evaluate((f) => f.requestSubmit());
        await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15000 });
        assert('UI login redirects away from /login', !page.url().includes('/login'), `url=${page.url()}`);

        console.log('\n▶ STEP 4: Navigate to Request Detail page');
        // Wait for the auth token to be persisted (login() writes to localStorage).
        // Use a longer settle window for the SPA to hydrate.
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => { });
        // Router route is /admin/request/:id (singular) — see router/index.js:60
        await page.goto(`${BASE}/admin/request/${requestInfo.id}`, {
            waitUntil: 'networkidle',
            timeout: 60000,
        });
        // Generous SPA-hydration window — Vite dev chunks can take a while.
        await page.waitForTimeout(4000);

        // ──────────────────────────────────────────────────────────────
        // CLASS-BASED WAIT — locale-agnostic.
        // The image-preview container has the unique class `cursor-zoom-in`
        // (not shared with non-image file links which use `<a>` tags).
        // ──────────────────────────────────────────────────────────────
        try {
            await page.waitForSelector('div.cursor-zoom-in', { timeout: 20000, state: 'attached' });
            console.log('   • Image preview container rendered (div.cursor-zoom-in)');
        } catch (e) {
            // Save a debug screenshot + dump page state for diagnosis
            const debugDir = path.join(__dirname, 'test-results');
            fs.mkdirSync(debugDir, { recursive: true });
            await page.screenshot({ path: path.join(debugDir, 'admin-attachment-debug.png'), fullPage: true });
            console.error('   ⚠ Saved debug screenshot to test-results/admin-attachment-debug.png');
            const debug = await page.evaluate(() => {
                const headings = Array.from(document.querySelectorAll('h2')).map((h) => (h.textContent || '').trim());
                const hasImg = !!document.querySelector('div.cursor-zoom-in');
                const appRoot = document.querySelector('#app');
                const links = Array.from(document.querySelectorAll('a')).map((a) => ({
                    href: a.getAttribute('href'),
                    text: (a.textContent || '').trim(),
                })).filter((a) => a.text.toLowerCase().includes('click to view'));
                // Pull the loaded request data via the exposed Vue Router, if any.
                let reqPayload = null;
                try {
                    const r = window.router?.currentRoute?.value;
                    if (r && r.params && r.params.id) {
                        reqPayload = { routeId: r.params.id, routePath: r.fullPath };
                    }
                } catch (_) { }
                // Also try to locate any Vue 3 internal root for attached request data.
                const app = document.querySelector('#app');
                let vueInspected = false;
                let vueRequestImageUrls = null;
                try {
                    const root = app && app.__vue_app__;
                    if (root) {
                        vueInspected = true;
                    }
                } catch (_) { }
                return {
                    vueInspected,
                    routeInfo: reqPayload,
                    url: location.href,
                    title: document.title,
                    h2s: headings,
                    hasImgPreview: hasImg,
                    clickViewLinks: links,
                    appRootChildCount: appRoot ? appRoot.children.length : -1,
                    bodySnippet: (document.body.textContent || '').slice(0, 800),
                    storageKeys: Object.keys(localStorage),
                };
            });
            console.error('   PAGE DEBUG:', JSON.stringify(debug, null, 2));
            throw e;
        }

        console.log('\n▶ STEP 5: Verify attachment is rendered as <img> (NOT "Click to view")');
        const imgCount = await page.locator('div.cursor-zoom-in img').count();
        console.log(`   • <img> elements found inside image-preview containers: ${imgCount}`);
        assert(
            'At least one <img> preview rendered in attachments section',
            imgCount > 0,
            `imgCount=${imgCount}`
        );

        const clickViewInImages = await page.evaluate(() => {
            const containers = Array.from(document.querySelectorAll('div.cursor-zoom-in'));
            let n = 0;
            containers.forEach((c) => {
                const text = (c.textContent || '').toLowerCase();
                if (text.includes('click to view')) n += 1;
            });
            return n;
        });
        assert(
            'Image preview does NOT contain "Click to view" text',
            clickViewInImages === 0,
            `clickViewInImages=${clickViewInImages}`
        );

        console.log('\n▶ STEP 6: Verify image actually loaded (naturalWidth > 0)');
        const imageLoadInfo = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('div.cursor-zoom-in img'));
            const data = imgs.map((img) => ({
                src: (img.src || '').slice(0, 60),
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                complete: img.complete,
            }));
            const loaded = imgs.filter((img) => img.complete && img.naturalWidth > 0);
            return { ok: loaded.length > 0, total: imgs.length, loaded: loaded.length, data };
        });
        console.log(`   • ${imageLoadInfo.loaded}/${imageLoadInfo.total} images loaded with naturalWidth > 0`);
        if (imageLoadInfo.data) {
            imageLoadInfo.data.forEach((d, i) => {
                console.log(`     [${i}] naturalWidth=${d.naturalWidth} naturalHeight=${d.naturalHeight} src=${d.src}...`);
            });
        }
        assert(
            'At least one attachment image actually loaded (naturalWidth > 0)',
            imageLoadInfo.ok,
            JSON.stringify(imageLoadInfo)
        );

        console.log('\n▶ STEP 7: Take screenshot of admin request detail page');
        const shotDir = path.join(__dirname, 'test-results');
        fs.mkdirSync(shotDir, { recursive: true });
        const screenshotPath = path.join(shotDir, 'admin-attachment-image-preview.png');
        await page.evaluate(() => {
            const c = document.querySelector('div.cursor-zoom-in');
            if (c) c.scrollIntoView({ block: 'center' });
        });
        await page.waitForTimeout(500);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`   • Screenshot saved: ${screenshotPath}`);
        assert('Screenshot saved', fs.existsSync(screenshotPath));

        console.log('\n▶ STEP 8: Click image to open lightbox');
        await page.locator('div.cursor-zoom-in').first().click();
        await page.waitForTimeout(800);

        // ImageLightbox renders a fixed overlay covering the viewport.
        const lightboxVisible = await page.evaluate(() => {
            const overlays = Array.from(document.querySelectorAll('div.fixed'));
            return overlays.some((el) => {
                const r = el.getBoundingClientRect();
                return r.width >= window.innerWidth * 0.9 && r.height >= window.innerHeight * 0.9;
            });
        });
        assert('Lightbox opens when clicking attachment image', lightboxVisible);

        const lightboxShot = path.join(shotDir, 'admin-attachment-lightbox.png');
        await page.screenshot({ path: lightboxShot, fullPage: false });
        console.log(`   • Lightbox screenshot saved: ${lightboxShot}`);
        assert('Lightbox screenshot saved', fs.existsSync(lightboxShot));

    } catch (e) {
        console.error('\nFATAL during UI test:', e.message);
        try {
            const errDir = path.join(__dirname, 'test-results');
            fs.mkdirSync(errDir, { recursive: true });
            await page.screenshot({ path: path.join(errDir, 'admin-attachment-error.png'), fullPage: true });
        } catch { }
    } finally {
        await browser.close();
    }

    console.log('\n══════════════════════════════════════════════════════════════');
    console.log(`  RESULTS: ${passedChecks} / ${totalChecks} checks passed`);
    console.log('══════════════════════════════════════════════════════════════\n');

    const failed = RESULTS.filter((r) => r.status === 'FAIL');
    if (failed.length > 0) {
        console.error('FAILED CHECKS:');
        failed.forEach((r) => console.error(`  • ${r.name}${r.details ? ' — ' + r.details : ''}`));
        process.exit(1);
    }
    process.exit(0);
})();
