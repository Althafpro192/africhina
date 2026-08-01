/**
 * Page Navigation Test
 * Tests if different pages render correctly
 */

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    let errors = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console error: ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        errors.push(`Page error: ${err.message}`);
    });

    try {
        console.log('=== Page Navigation Test ===\n');

        // 1. Login
        console.log('1. Logging in...');
        await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        await page.fill('input[type="email"]', 'buyer@test.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        console.log('   ✓ Login successful\n');

        // 2. Navigate to Dashboard
        console.log('2. Navigating to Dashboard...');
        await page.goto('http://localhost:8000/buyer/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        let bodyText = await page.textContent('body');
        let hasWelcome = bodyText.includes('Welcome') || bodyText.includes('welcome');
        console.log(`   Dashboard - Has welcome text: ${hasWelcome}`);

        await page.screenshot({ path: 'test-dashboard.png' });

        // 3. Navigate to RFQ Create
        console.log('\n3. Navigating to RFQ Create...');
        await page.goto('http://localhost:8000/buyer/rfq/create', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        bodyText = await page.textContent('body');
        hasWelcome = bodyText.includes('Welcome') || bodyText.includes('welcome');
        let hasCreateRequest = bodyText.includes('Create') || bodyText.includes('create');
        let bodyLength = bodyText.trim().length;

        console.log(`   RFQ Create - Has welcome text: ${hasWelcome}`);
        console.log(`   RFQ Create - Has create text: ${hasCreateRequest}`);
        console.log(`   RFQ Create - Body text length: ${bodyLength}`);

        await page.screenshot({ path: 'test-rfq-create.png' });

        // 4. Report errors
        console.log('\n4. Console errors:');
        if (errors.length === 0) {
            console.log('   ✓ No errors');
        } else {
            errors.forEach(e => console.log(`   - ${e}`));
        }

        console.log('\n=== DONE ===');
        console.log('Screenshots saved: test-dashboard.png, test-rfq-create.png');

    } catch (err) {
        console.error('Test failed:', err.message);
    } finally {
        await browser.close();
    }
})();
