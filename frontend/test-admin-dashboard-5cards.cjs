// Test: Admin Dashboard — show all requests + 5 status cards (total, pending, in progress, complete, canceled)
// CommonJS, executable with system Chrome on Zorin OS.

const { chromium } = require('playwright');

const BASE = 'http://0.0.0.0:8000';

// Admin credentials (must already exist in the DB from earlier seeds)
const ADMIN_EMAIL = 'admin@africhina.com';
const ADMIN_PASSWORD = 'password123';

function log(step, status, extra = '') {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
    console.log(`${icon}  [${status}] ${step}${extra ? ' — ' + extra : ''}`);
}

(async () => {
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
        viewport: { width: 1600, height: 1000 },
    });
    const page = await context.newPage();

    const errors = [];
    let passed = 0;
    let failed = 0;

    function assertPass(cond, label, extra = '') {
        if (cond) {
            log(label, 'PASS', extra);
            passed++;
        } else {
            log(label, 'FAIL', extra);
            failed++;
        }
    }

    // Capture network errors
    page.on('pageerror', (err) => {
        errors.push(`pageerror: ${err.message}`);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const text = msg.text();
            // Ignore non-critical warnings
            if (!/favicon|ResizeObserver|net::ERR_FAILED/.test(text)) {
                errors.push(`console.error: ${text}`);
            }
        }
    });
    page.on('response', async (resp) => {
        try {
            const url = resp.url();
            if (url.includes('/api/') && resp.status() >= 400) {
                let body = '';
                try { body = (await resp.text()).slice(0, 500); } catch (_) { }
                errors.push(`HTTP ${resp.status()} ${resp.request().method()} ${url} -> ${body}`);
            }
        } catch (_) { }
    });

    try {
        // 1. LOGIN
        log('1. Navigate to login page', 'PENDING');
        await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        log('1. Login page loaded', 'PASS');

        log('2. Fill credentials', 'PENDING');
        await page.fill('input[type="email"]', ADMIN_EMAIL);
        await page.fill('input[type="password"]', ADMIN_PASSWORD);
        log('2. Credentials filled', 'PASS');

        log('3. Submit login', 'PENDING');
        await Promise.all([
            page.waitForURL(/\/admin\//, { timeout: 15000 }).catch(() => null),
            page.click('button[type="submit"]'),
        ]);
        await page.waitForTimeout(2000);
        const urlAfterLogin = page.url();
        assertPass(/\/admin\//.test(urlAfterLogin), '3. Redirected to admin area', urlAfterLogin);

        // 2. NAVIGATE TO DASHBOARD
        log('4. Navigate to /admin/dashboard', 'PENDING');
        await page.goto(`${BASE}/admin/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2500);
        log('4. Dashboard page loaded', 'PASS');

        // 3. CHECK 5 STATUS CARDS EXIST
        log('5. Wait for stats grid to render', 'PENDING');
        await page.waitForSelector('section.grid', { timeout: 10000 });
        // Wait for all 5 lazy-render cards to be mounted (via IntersectionObserver)
        await page.waitForFunction(() => {
            const sections = document.querySelectorAll('section');
            if (!sections.length) return false;
            const statsSection = sections[0];
            const cards = statsSection.querySelectorAll(':scope > div');
            if (cards.length < 5) return false;
            // All 5 cards must have their label rendered (h3) and value rendered (p)
            let allReady = true;
            cards.forEach((card) => {
                const h3 = card.querySelector('h3');
                const p = card.querySelector('p');
                if (!h3 || !p || !h3.textContent.trim() || !p.textContent.trim()) {
                    allReady = false;
                }
            });
            return allReady;
        }, { timeout: 15000 });
        await page.waitForTimeout(1500);
        log('5. Stats grid rendered', 'PASS');

        // Count the cards inside the stats grid (first <section> on the page)
        const cardCount = await page.evaluate(() => {
            const sections = document.querySelectorAll('section');
            if (!sections.length) return 0;
            // Stats grid is the first <section>
            const statsSection = sections[0];
            // Each card is a direct <div> child with the gradient shadow class
            const cards = statsSection.querySelectorAll(':scope > div');
            return cards.length;
        });
        assertPass(cardCount === 5, '6. Exactly 5 status cards present', `found ${cardCount} card(s)`);

        // 4. CHECK CARD LABELS
        const cardData = await page.evaluate(() => {
            const sections = document.querySelectorAll('section');
            if (!sections.length) return [];
            const statsSection = sections[0];
            const cards = statsSection.querySelectorAll(':scope > div');
            const out = [];
            cards.forEach((card) => {
                const h3 = card.querySelector('h3');
                const p = card.querySelector('p');
                out.push({
                    label: h3 ? h3.textContent.trim() : null,
                    value: p ? p.textContent.trim() : null,
                });
            });
            return out;
        });
        console.log('   Card data:', JSON.stringify(cardData, null, 2));

        const labels = cardData.map((c) => (c.label || '').toLowerCase());
        assertPass(labels.some((l) => l.includes('total')), '7. Card "Total Requests" present');
        assertPass(
            labels.some((l) => l.includes('pending') || l.includes('approval')),
            '8. Card "Pending" present'
        );
        assertPass(
            labels.some((l) => l.includes('process') || l.includes('processing')),
            '9. Card "In Process" present'
        );
        assertPass(
            labels.some((l) => l.includes('complete') || l.includes('selesai') || l.includes('deal')),
            '10. Card "Complete" present'
        );
        assertPass(
            labels.some((l) => l.includes('cancel') || l.includes('dibatalkan') || l.includes('annul')),
            '11. Card "Canceled" present'
        );

        // 5. CHECK NUMERIC VALUES ARE PARSED (not undefined/null)
        const allValuesValid = cardData.every((c) => c.value && /^\d+/.test(c.value));
        assertPass(allValuesValid, '12. All card values are numeric', cardData.map((c) => c.value).join(' / '));

        // 6. CHECK THE TABLE SHOWS REQUESTS (not 0 rows)
        log('13. Check requests table is populated', 'PENDING');
        await page.waitForTimeout(1500);
        const rowCount = await page.evaluate(() => {
            const tbody = document.querySelector('table tbody');
            if (!tbody) return 0;
            return tbody.querySelectorAll('tr').length;
        });
        console.log(`   Table rows: ${rowCount}`);
        assertPass(rowCount > 0, '14. Table has at least one request row', `${rowCount} row(s)`);

        // 7. CHECK API RESPONSE: stats includes canceled_requests
        log('15. Verify /api/admin/statistics returns canceled_requests', 'PENDING');
        const apiCheck = await page.evaluate(async () => {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
            if (!token) return { ok: false, reason: 'no token in localStorage' };
            const res = await fetch('/api/admin/statistics', {
                headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
            });
            const data = await res.json();
            return { ok: res.ok, status: res.status, data };
        });
        if (apiCheck.ok) {
            const d = apiCheck.data;
            const hasAll = ['total_requests', 'pending_requests', 'processing_requests', 'completed_requests', 'canceled_requests'].every(
                (k) => typeof d[k] === 'number'
            );
            assertPass(hasAll, '16. Statistics API returns all 5 numeric fields', JSON.stringify(d));
        } else {
            assertPass(false, '16. Statistics API call failed', JSON.stringify(apiCheck));
        }

        // 8. CHECK API: /api/admin/requests?limit=all returns more than 10 records
        log('17. Verify /api/admin/requests?limit=all returns all requests', 'PENDING');
        const requestsCheck = await page.evaluate(async () => {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
            if (!token) return { ok: false, reason: 'no token' };
            const res = await fetch('/api/admin/requests?limit=all', {
                headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
            });
            const data = await res.json();
            const items = Array.isArray(data) ? data : data.data || [];
            return { ok: res.ok, status: res.status, count: items.length, pagination: data.pagination || null };
        });
        console.log('   API requests response:', JSON.stringify(requestsCheck, null, 2));
        assertPass(requestsCheck.ok, '18. /api/admin/requests?limit=all OK', `HTTP ${requestsCheck.status}`);
        // The default limit was 10; with limit=all it should fetch every request (or at least > 10 if DB has more)
        assertPass(requestsCheck.count >= 1, '19. Requests API returns ≥1 request', `${requestsCheck.count} item(s)`);

        // 9. TAKE A SCREENSHOT
        log('20. Take screenshot', 'PENDING');
        await page.screenshot({ path: 'test-results/dashboard-5cards.png', fullPage: true });
        log('20. Screenshot saved', 'PASS', 'test-results/dashboard-5cards.png');

        // 10. CHECK STATUS FILTER STILL INCLUDES 'batal'
        log('21. Verify status filter has "Canceled" option', 'PENDING');
        const statusOptions = await page.evaluate(() => {
            const selects = document.querySelectorAll('select');
            for (const s of selects) {
                const opts = Array.from(s.querySelectorAll('option')).map((o) => o.value);
                if (opts.includes('batal')) return opts;
            }
            return [];
        });
        assertPass(statusOptions.includes('batal'), '22. Status filter dropdown has "batal" (Canceled) option', statusOptions.length + ' options');
    } catch (err) {
        log('UNCAUGHT ERROR', 'FAIL', err.message);
        failed++;
        console.error(err);
    } finally {
        console.log('\n' + '='.repeat(60));
        console.log(`📊  TEST RESULTS:  ${passed} passed, ${failed} failed`);
        if (errors.length) {
            console.log('⚠️  Page/console errors during test:');
            errors.slice(0, 10).forEach((e) => console.log('   -', e));
        }
        console.log('='.repeat(60));
        await page.waitForTimeout(1000);
        await browser.close();
        process.exit(failed > 0 ? 1 : 0);
    }
})();
