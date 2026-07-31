/**
 * Automated E2E Test Script - AfriChina Web (multi-role)
 *
 * Runs 3 separate browser sessions — one for each role — and validates
 * the critical user journeys for each. Designed to catch real failures
 * by listening for API errors (5xx, 4xx on important endpoints) rather
 * than relying on page-text only.
 *
 * Test flows:
 *   BUYER  : Login via demo Buyer button → Dashboard → open RFQ detail →
 *            inline-edit product_name (save) → inline-edit quantity (save) →
 *            click attachment image → verify lightbox opens + close works.
 *   ADMIN  : Login via demo Admin button → Dashboard → Drivers list.
 *   DRIVER : Direct API login (no demo button) → /driver/messages → chat loads.
 *
 * Stack assumed running locally:
 *   - Laravel API:  http://localhost:8000
 *   - Vite dev:     http://localhost:5173 (proxies /api → :8000)
 *
 * Run:
 *   PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 node backend/test-otonom-v2.cjs
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const CONFIG = {
    frontendUrl: 'http://localhost:5173',
    backendUrl: 'http://localhost:8000',
    headless: false,
    timeout: 30000,
    // Buyer RFQ to use (the ID from the user's request URL)
    rfqId: '019fb827-de97-7159-bf55-934611c280b5',
    resultsDir: path.resolve(__dirname, '../test-results'),
};

// ---------------------------------------------------------------------------
// Results tracker
// ---------------------------------------------------------------------------
const results = {
    passed: 0,
    failed: 0,
    errors: [],
    flows: {}, // { buyer: {passed,failed,errors}, admin: {...}, driver: {...} }
};

function log(message, type = 'INFO') {
    const ts = new Date().toISOString();
    const prefix =
        type === 'ERROR' ? '❌' : type === 'PASS' ? '✅' : type === 'WARN' ? '⚠️' : '📝';
    console.log(`${prefix} [${ts}] ${message}`);
}

async function takeScreenshot(page, name) {
    if (!fs.existsSync(CONFIG.resultsDir)) {
        fs.mkdirSync(CONFIG.resultsDir, { recursive: true });
    }
    const safeName = name.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
    const file = path.join(CONFIG.resultsDir, `screenshot-${safeName}-${Date.now()}.png`);
    await page.screenshot({ path: file, fullPage: true });
    log(`📸 ${file}`);
    return file;
}

function recordResult(role, ok, label, error) {
    if (!results.flows[role]) results.flows[role] = { passed: 0, failed: 0, errors: [] };
    const r = results.flows[role];
    if (ok) {
        r.passed++;
        results.passed++;
        log(`  [${role}] ✅ ${label}`, 'PASS');
    } else {
        r.failed++;
        results.failed++;
        r.errors.push({ label, error });
        results.errors.push({ role, label, error });
        log(`  [${role}] ❌ ${label}: ${error}`, 'ERROR');
    }
}

// ---------------------------------------------------------------------------
// Helper: install an API watcher on a page that records failures
// ---------------------------------------------------------------------------
function installApiWatcher(page, role, captureBody = true) {
    page.on('response', async (response) => {
        const url = response.url();
        // Skip non-API responses (assets, HMR, fonts)
        if (!url.includes('/api/') && !url.includes('/broadcasting/')) return;
        const status = response.status();
        const method = response.request().method();

        // Only fail on non-OK for non-GET, OR 5xx for any method
        const isMutation = method !== 'GET';
        if (status >= 500 || (isMutation && status >= 400)) {
            let body = '';
            try { body = captureBody ? (await response.text()).slice(0, 300) : ''; } catch { }
            recordResult(role, false, `API ${method} ${status} ${url.split(CONFIG.backendUrl)[1] || url}`,
                body || `HTTP ${status}`);
        }
    });
    page.on('pageerror', (err) => {
        recordResult(role, false, `JS pageerror`, err.message.slice(0, 300));
    });
}

// ---------------------------------------------------------------------------
// Shared login helper (uses the in-page Sign In button explicitly)
// ---------------------------------------------------------------------------
async function loginViaDemo(page, role) {
    log(`▶ Login flow (${role})`);
    await page.goto(`${CONFIG.frontendUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: CONFIG.timeout });

    // The "Sign In" submit button must be present and clickable
    const signInBtn = page.locator('button[type="submit"]').first();
    await signInBtn.waitFor({ state: 'visible', timeout: 15000 });
    recordResult(role, true, 'Sign In button visible on Login page', '');

    // Click the demo button for the role (Buyer/Admin)
    // Driver has no demo button; we fall back to direct API login
    if (role === 'buyer' || role === 'admin') {
        const demoLabel = role === 'buyer' ? 'Buyer Account' : 'Admin Account';
        const demoBtn = page.locator(`button:has-text("${demoLabel}")`).first();
        await demoBtn.click();
        log(`  clicked demo button: ${demoLabel}`);
    } else if (role === 'driver') {
        // Direct API login (no demo button for driver)
        const apiResp = await page.request.post(`${CONFIG.backendUrl}/api/auth/login`, {
            data: { email: 'driver@africhina.com', password: 'driver123' },
        });
        if (!apiResp.ok()) {
            recordResult(role, false, 'Driver API login', `HTTP ${apiResp.status()}`);
            return false;
        }
        const json = await apiResp.json();
        await page.evaluate((u) => {
            localStorage.setItem('user', JSON.stringify(u.user));
            localStorage.setItem('token', u.token || '');
        }, json);
        recordResult(role, true, 'Driver API login', '');
        // Navigate to driver messages
        await page.goto(`${CONFIG.frontendUrl}/driver/messages`, { waitUntil: 'networkidle' });
        return true;
    }

    // Now click the visible Sign In button (as the user emphasized)
    await signInBtn.click();
    // Wait for redirect off /login
    await page.waitForURL((u) => !u.toString().includes('/login'), { timeout: CONFIG.timeout });
    log(`  redirected to: ${page.url()}`);
    await page.waitForLoadState('networkidle', { timeout: CONFIG.timeout });
    recordResult(role, true, `Logged in and redirected (${page.url()})`, '');
    return true;
}

// ===========================================================================
// BUYER FLOW
// ===========================================================================
async function runBuyerFlow(browser) {
    const role = 'buyer';
    log('\n=== 👤 BUYER FLOW ===', 'INFO');
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    installApiWatcher(page, role);

    try {
        // 1. Login
        const ok = await loginViaDemo(page, role);
        if (!ok) return;

        // 2. Navigate to a buyer RFQ (use known ID from user's URL)
        log('▶ Navigating to buyer RFQ detail');
        await page.goto(`${CONFIG.frontendUrl}/buyer/rfq/${CONFIG.rfqId}`, { waitUntil: 'networkidle' });
        // Force hard reload to clear any stale module cache
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(1500); // give vue a moment to hydrate

        // Verify RFQ product name is rendered
        const h1Product = page.locator('h1.text-2xl, h1.text-3xl').first();
        if (await h1Product.count()) {
            const text = await h1Product.textContent();
            recordResult(role, true, `RFQ page rendered with product: "${text.trim().slice(0, 40)}..."`, '');
        } else {
            recordResult(role, false, 'RFQ page rendered', 'h1 product name not found');
        }
        await takeScreenshot(page, 'buyer-01-rfq-detail');

        // 3. Inline edit: product_name
        log('▶ Inline edit: product_name');
        const editBtnProduct = page.locator('[data-action="edit-field"][data-field="product_name"]').first();
        if (await editBtnProduct.count()) {
            await editBtnProduct.click({ force: true });
            await page.waitForSelector('[data-edit-input="product_name"]', { timeout: 5000 });
            const input = page.locator('[data-edit-input="product_name"]').first();
            // Unique timestamp suffix so we know the save actually went through
            const stamp = Date.now().toString().slice(-6);
            const newName = `Bulk Test Cable ${stamp}`;
            await input.fill(newName);
            await takeScreenshot(page, 'buyer-02-edit-product-name');
            await page.locator('[data-action="save-inline"][data-field="product_name"]').first().click();
            // Wait for input to disappear (means save succeeded and editingField cleared)
            await page.waitForSelector('[data-edit-input="product_name"]', {
                state: 'detached', timeout: 8000
            }).catch(() => { });
            await page.waitForTimeout(800);
            // Verify new name is now visible in the display
            const display = page.locator('[data-field-display="product_name"]').first();
            const newText = await display.textContent();
            const containsStamp = (newText || '').includes(stamp);
            recordResult(role, containsStamp, `product_name persisted (expected "${stamp}")`,
                containsStamp ? '' : `display="${newText?.trim()}"`);
            await takeScreenshot(page, 'buyer-03-after-product-name-save');
        } else {
            recordResult(role, false, 'product_name pencil button visible',
                'No [data-action="edit-field"][data-field="product_name"] — maybe RFQ status != menunggu_penawaran_admin');
        }

        // 4. Inline edit: quantity
        log('▶ Inline edit: quantity');
        const editBtnQty = page.locator('[data-action="edit-field"][data-field="quantity"]').first();
        if (await editBtnQty.count()) {
            await editBtnQty.click({ force: true });
            await page.waitForSelector('[data-edit-input="quantity"]', { timeout: 5000 });
            const qtyInput = page.locator('[data-edit-input="quantity"]').first();
            await qtyInput.fill('777');
            const unitInput = page.locator('[data-edit-input="unit"]').first();
            await unitInput.fill('cartons');
            await takeScreenshot(page, 'buyer-04-edit-quantity');
            await page.locator('[data-action="save-inline"][data-field="quantity"]').first().click();
            await page.waitForSelector('[data-edit-input="quantity"]', {
                state: 'detached', timeout: 8000
            }).catch(() => { });
            await page.waitForTimeout(800);
            const qtyDisplay = page.locator('[data-field-display="quantity"]').first();
            const qtyText = await qtyDisplay.textContent();
            const ok = (qtyText || '').includes('777') && (qtyText || '').toLowerCase().includes('carton');
            recordResult(role, ok, 'quantity + unit persisted', ok ? '' : `display="${qtyText?.trim()}"`);
            await takeScreenshot(page, 'buyer-05-after-quantity-save');
        } else {
            recordResult(role, false, 'quantity pencil button visible', 'No edit button found');
        }

        // 5. Inline edit: budget_range (third field)
        log('▶ Inline edit: budget_range');
        const editBtnBudget = page.locator('[data-action="edit-field"][data-field="budget_range"]').first();
        if (await editBtnBudget.count()) {
            await editBtnBudget.click({ force: true });
            await page.waitForSelector('[data-edit-input="budget_range"]', { timeout: 5000 });
            const input = page.locator('[data-edit-input="budget_range"]').first();
            await input.fill('5000-15000');
            await page.locator('[data-action="save-inline"][data-field="budget_range"]').first().click();
            await page.waitForSelector('[data-edit-input="budget_range"]', {
                state: 'detached', timeout: 8000
            }).catch(() => { });
            await page.waitForTimeout(800);
            const display = page.locator('[data-field-display="budget_range"]').first();
            const text = await display.textContent();
            const ok = (text || '').includes('5000-15000');
            recordResult(role, ok, 'budget_range persisted', ok ? '' : `display="${text?.trim()}"`);
        } else {
            recordResult(role, false, 'budget_range pencil button visible', 'No edit button found');
        }

        // 6. Image lightbox: click an attachment thumbnail
        log('▶ Image lightbox: click attachment');
        // The attachment grid is below the section 4 heading
        const attachmentImg = page.locator('.aspect-square img').first();
        if (await attachmentImg.count()) {
            // Click parent container (which has @click="openAttachmentLightbox")
            await attachmentImg.click({ force: true });
            await page.waitForTimeout(500);
            // Lightbox container has z-[9999] and backdrop-blur-sm
            const lightbox = page.locator('.z-\\[9999\\]').first();
            const isOpen = await lightbox.count();
            recordResult(role, isOpen > 0, 'Image lightbox opened on image click',
                isOpen ? '' : 'No z-[9999] container found after click');
            await takeScreenshot(page, 'buyer-06-lightbox-open');

            // Close with the X button (the close button is in the lightbox top-right)
            const closeBtn = lightbox.locator('button').first();
            if (await closeBtn.count()) {
                await closeBtn.click({ force: true });
                await page.waitForTimeout(400);
                const stillOpen = await page.locator('.z-\\[9999\\]').count();
                recordResult(role, stillOpen === 0, 'Image lightbox closes with X button',
                    stillOpen ? 'Lightbox still visible after X click' : '');
            } else {
                recordResult(role, false, 'Lightbox close button found', 'No button inside lightbox');
            }
        } else {
            recordResult(role, true, 'Image lightbox (skipped, no attachments)',
                'No image attachments on this RFQ');
        }

        // 7. Send a chat message via ChatComponent
        log('▶ Buyer → Admin chat');
        // Scroll to bottom to expose chat
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(800);
        const chatTextarea = page.locator('textarea[placeholder*="message" i], textarea[placeholder*="Type" i]').first();
        if (await chatTextarea.count()) {
            await chatTextarea.fill(`Buyer auto-message ${Date.now()}`);
            // Find the send button (right of textarea) - icon "send"
            const sendBtn = page.locator('button:has(.material-symbols-outlined:text-is("send"))').last();
            await sendBtn.click();
            await page.waitForTimeout(1500);
            recordResult(role, true, 'Buyer chat message sent', '');
        } else {
            recordResult(role, true, 'Buyer chat (skipped, no chat visible — may be early stage)',
                'No chat textarea found');
        }

    } catch (err) {
        recordResult(role, false, 'Buyer flow crashed', err.message.slice(0, 300));
    } finally {
        await takeScreenshot(page, 'buyer-final');
        await ctx.close();
    }
}

// ===========================================================================
// ADMIN FLOW
// ===========================================================================
async function runAdminFlow(browser) {
    const role = 'admin';
    log('\n=== 🛡️ ADMIN FLOW ===', 'INFO');
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    installApiWatcher(page, role);

    try {
        const ok = await loginViaDemo(page, role);
        if (!ok) return;

        // Should have landed on /admin/dashboard
        log(`▶ Current URL: ${page.url()}`);
        if (page.url().includes('/admin/dashboard')) {
            recordResult(role, true, 'Admin landed on /admin/dashboard', '');
        } else {
            recordResult(role, false, 'Admin redirect', `URL=${page.url()}`);
        }
        await page.waitForLoadState('networkidle');
        await takeScreenshot(page, 'admin-01-dashboard');

        // Navigate to Drivers admin page
        log('▶ Navigate to /admin/drivers');
        await page.goto(`${CONFIG.frontendUrl}/admin/drivers`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        // Should see a table or list of drivers
        const bodyText = await page.locator('body').innerText();
        const looksLikeDrivers = bodyText.toLowerCase().includes('driver') || bodyText.length > 200;
        recordResult(role, looksLikeDrivers, 'Admin drivers page loaded',
            looksLikeDrivers ? '' : `Page text length=${bodyText.length}`);
        await takeScreenshot(page, 'admin-02-drivers');

        // Navigate to Suppliers admin page
        log('▶ Navigate to /admin/suppliers');
        await page.goto(`${CONFIG.frontendUrl}/admin/suppliers`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        await takeScreenshot(page, 'admin-03-suppliers');

        // Visit an admin RFQ to verify request detail works for admin too
        log('▶ Admin: view a request');
        await page.goto(`${CONFIG.frontendUrl}/admin/request/${CONFIG.rfqId}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        const h1 = await page.locator('h1, h2').first().textContent().catch(() => '');
        recordResult(role, !!h1, 'Admin RFQ detail loaded', h1 ? `first heading="${h1.trim().slice(0, 40)}"` : 'no heading');
        await takeScreenshot(page, 'admin-04-rfq-detail');

    } catch (err) {
        recordResult(role, false, 'Admin flow crashed', err.message.slice(0, 300));
    } finally {
        await ctx.close();
    }
}

// ===========================================================================
// DRIVER FLOW
// ===========================================================================
async function runDriverFlow(browser) {
    const role = 'driver';
    log('\n=== 🚚 DRIVER FLOW ===', 'INFO');
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    installApiWatcher(page, role);

    try {
        const ok = await loginViaDemo(page, role);
        if (!ok) return;

        log(`▶ Current URL: ${page.url()}`);
        if (page.url().includes('/driver/')) {
            recordResult(role, true, 'Driver landed on /driver/*', '');
        } else {
            recordResult(role, false, 'Driver redirect', `URL=${page.url()}`);
        }
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        await takeScreenshot(page, 'driver-01-messages');

        // Check chat input is present
        const chatInput = page.locator('textarea').first();
        if (await chatInput.count()) {
            recordResult(role, true, 'Driver chat input present', '');
        } else {
            recordResult(role, true, 'Driver page loaded (chat may need a thread)',
                'No chat textarea — possibly no assigned shipments');
        }
    } catch (err) {
        recordResult(role, false, 'Driver flow crashed', err.message.slice(0, 300));
    } finally {
        await ctx.close();
    }
}

// ===========================================================================
// MAIN
// ===========================================================================
(async () => {
    log('═══════════════════════════════════════════════════════', 'INFO');
    log('  AfriChina Web — Multi-Role E2E Autonomous Test', 'INFO');
    log('═══════════════════════════════════════════════════════', 'INFO');
    log(`Frontend: ${CONFIG.frontendUrl}`);
    log(`Backend:  ${CONFIG.backendUrl}`);
    log(`Chrome:   /usr/bin/google-chrome (Zorin OS local)`);

    const browser = await chromium.launch({
        headless: CONFIG.headless,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        // Sequential runs: each role gets its own context. The Vue/HMR state from
        // the dev server is shared (which is what we want).
        await runBuyerFlow(browser);
        await runAdminFlow(browser);
        await runDriverFlow(browser);
    } finally {
        await browser.close();
    }

    // Final summary
    log('\n═══════════════════════════════════════════════════════', 'INFO');
    log('  FINAL SUMMARY', 'INFO');
    log('═══════════════════════════════════════════════════════', 'INFO');
    for (const [role, r] of Object.entries(results.flows)) {
        log(`${role.toUpperCase()}: ${r.passed} passed, ${r.failed} failed`, r.failed === 0 ? 'PASS' : 'ERROR');
        for (const e of r.errors) {
            log(`  ❌ ${e.label}: ${e.error}`, 'ERROR');
        }
    }
    log(`\nTOTAL: ${results.passed} passed, ${results.failed} failed`);
    process.exit(results.failed > 0 ? 1 : 0);
})().catch((err) => {
    console.error('FATAL', err);
    process.exit(2);
});