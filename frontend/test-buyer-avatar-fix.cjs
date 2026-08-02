/**
 * E2E verification: buyer profile avatar renders correctly in admin section.
 *
 * Bug being verified: avatar_data was being base64_encode()'d TWICE
 *   (once on upload in AuthController, once again in AdminController::getBuyerProfile
 *    and AdminController::getBuyerList). The double-encoded base64 is not a valid
 *   image when the browser tries to render it as a data URL, so the photo area
 *   showed a broken-image / "image failed to process" placeholder.
 *
 * Fix: AdminController no longer re-encodes avatar_data. It is already base64 in
 *   MySQL (set by AuthController::uploadAvatar at upload time).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://0.0.0.0:8000';
const BUYER_USER_ID = '019fb827-d97c-722c-b2a8-4e5e619da454';
const RESULTS_DIR = path.join(__dirname, '..', 'backend', 'test-results', 'buyer-avatar-fix');
fs.mkdirSync(RESULTS_DIR, { recursive: true });

const assertions = [];
function assert(name, cond, detail = '') {
    assertions.push({ name, pass: !!cond, detail });
    console.log(`${cond ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
}

(async () => {
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
        args: ['--no-sandbox']
    });
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') console.log('  [console.error]', msg.text());
    });
    page.on('pageerror', err => console.log('  [pageerror]', err.message));

    try {
        // === 1. LOGIN via demo Admin button (reliable path used in previous tests) ===
        await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
        await page.waitForSelector('input[type=email]', { timeout: 20000 });

        // Use the demo "Admin" button (Login.vue line 73-79) — it auto-fills the form
        // with the correct admin credentials (email + password123). Then we click the
        // submit button in the main login form (skipping the forgot-password form).
        await page.click('button:has-text("Admin")');
        await page.waitForTimeout(500);
        // Submit the main login form. Use the specific form selector to avoid the
        // forgot-password submit button (which is in a different form / modal).
        await page.locator('form').first().evaluate(f => f.requestSubmit());
        // Wait for navigation away from /login (router pushes to /admin/dashboard for admin role)
        try {
            await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });
        } catch (e) {
            // fall through; will be caught by the assertion below
        }
        await page.waitForTimeout(2000);
        console.log('  [info] URL after login:', page.url());
        assert('Admin login navigates away from /login', !page.url().includes('/login'), `url=${page.url()}`);

        // === 2. Direct API check — verify avatar_data is decodable to a real JPEG ===
        const apiCheck = await page.evaluate(async (userId) => {
            const token = localStorage.getItem('token');
            const resp = await fetch(`http://0.0.0.0:8000/api/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const ct = resp.headers.get('content-type') || '';
            const text = await resp.text();
            let json = null;
            try { json = JSON.parse(text); } catch (e) { return { status: resp.status, contentType: ct, parseError: e.message, bodyHead: text.slice(0, 200) }; }
            const b64 = json.avatar_data || '';
            const mime = json.avatar_mime_type || '';
            let decodable = false;
            let headerHex = '';
            try {
                const decoded = atob(b64);
                const bytes = new Uint8Array(Math.min(8, decoded.length));
                for (let i = 0; i < bytes.length; i++) bytes[i] = decoded.charCodeAt(i);
                headerHex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
                // JPEG magic bytes: ffd8ff ; PNG: 89504e47
                decodable = headerHex.startsWith('ffd8ff') || headerHex.startsWith('89504e47');
            } catch (e) {
                decodable = false;
            }
            return { status: resp.status, mime, b64Length: b64.length, b64Head: b64.slice(0, 60), decodable, headerHex };
        }, BUYER_USER_ID);
        console.log('API CHECK:', JSON.stringify(apiCheck, null, 2));
        assert('API GET /admin/buyers/profile returns 200', apiCheck.status === 200, `status=${apiCheck.status}`);
        assert('avatar_data present in response', apiCheck.b64Length > 1000, `len=${apiCheck.b64Length}`);
        assert('avatar_mime_type is image/*', apiCheck.mime.startsWith('image/'), `mime=${apiCheck.mime}`);
        assert('avatar_data decodes to a real image (JPEG/PNG header)', apiCheck.decodable, `header=${apiCheck.headerHex}`);

        // === 3. Navigate to admin messages → click on buyer → open profile modal ===
        await page.goto(`${BASE}/admin/messages`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(4000);
        await page.screenshot({ path: path.join(RESULTS_DIR, '01-messages-page.png'), fullPage: false });

        // Click on the buyer card — Messages.vue uses BuyerProfileModal
        let clicked = false;
        const buyerCandidates = [
            'text=West Africa Traders Ltd',
            'text=buyer@africhina.com',
            'div:has(p:has-text("buyer@africhina.com"))',
            'div:has(p:has-text("West Africa"))',
            '[class*="cursor-pointer"]:has-text("buyer@")'
        ];
        for (const sel of buyerCandidates) {
            try {
                const el = await page.$(sel);
                if (el) {
                    await el.click({ timeout: 3000 });
                    clicked = true;
                    console.log(`  [info] Clicked using selector: ${sel}`);
                    break;
                }
            } catch (e) { /* try next */ }
        }
        await page.waitForTimeout(2500);
        await page.screenshot({ path: path.join(RESULTS_DIR, '02-after-click.png'), fullPage: false });

        if (!clicked) console.log('  [warn] No buyer row found to click — checking if modal already visible');

        // === 4. Check avatar <img> in the modal renders (naturalWidth > 0) ===
        const imgCheck = await page.evaluate(() => {
            // Find any visible modal (look for backdrop / opacity)
            const candidates = Array.from(document.querySelectorAll('.fixed'));
            for (const m of candidates) {
                const style = window.getComputedStyle(m);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
                const img = m.querySelector('img');
                if (img) {
                    return {
                        found: true,
                        srcHead: img.src.slice(0, 90),
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        complete: img.complete
                    };
                }
            }
            // Fallback: any img on the page with a data: URL
            const allImgs = Array.from(document.querySelectorAll('img'));
            const profileImgs = allImgs.filter(i => i.src.startsWith('data:image'));
            return {
                found: false,
                dataUrlImgCount: profileImgs.length,
                firstSrcHead: profileImgs[0] ? profileImgs[0].src.slice(0, 90) : null,
                firstNaturalWidth: profileImgs[0] ? profileImgs[0].naturalWidth : null,
                firstComplete: profileImgs[0] ? profileImgs[0].complete : null
            };
        });
        console.log('IMG CHECK:', JSON.stringify(imgCheck, null, 2));

        if (imgCheck.found) {
            assert('Avatar <img> exists in profile modal', true);
            assert('Avatar <img> src is a data: URL', imgCheck.srcHead.startsWith('data:image'), `src=${imgCheck.srcHead}`);
            assert('Avatar image has non-zero naturalWidth (renders successfully)', imgCheck.naturalWidth > 0, `naturalWidth=${imgCheck.naturalWidth}`);
        } else if (imgCheck.dataUrlImgCount > 0) {
            assert('Avatar <img> exists on page (data URL)', true, `count=${imgCheck.dataUrlImgCount}`);
            assert('Avatar <img> src is a data: URL', (imgCheck.firstSrcHead || '').startsWith('data:image'), `src=${imgCheck.firstSrcHead}`);
            assert('Avatar image has non-zero naturalWidth (renders successfully)', imgCheck.firstNaturalWidth > 0, `naturalWidth=${imgCheck.firstNaturalWidth}`);
        } else {
            assert('Avatar <img> found on page', false, 'no data URL imgs found');
        }

        await page.screenshot({ path: path.join(RESULTS_DIR, '03-final-state.png'), fullPage: false });

        // === Summary ===
        const passed = assertions.filter(a => a.pass).length;
        const failed = assertions.filter(a => !a.pass).length;
        console.log(`\n${'='.repeat(50)}\nSUMMARY: ${passed} passed, ${failed} failed (of ${assertions.length})`);
        fs.writeFileSync(
            path.join(RESULTS_DIR, 'report.json'),
            JSON.stringify({ passed, failed, total: assertions.length, assertions, apiCheck, imgCheck }, null, 2)
        );
        process.exit(failed === 0 ? 0 : 1);

    } catch (e) {
        console.error('TEST ERROR:', e.message, e.stack);
        try { await page.screenshot({ path: path.join(RESULTS_DIR, 'error.png'), fullPage: false }); } catch { }
        process.exit(2);
    } finally {
        await browser.close();
    }
})();
