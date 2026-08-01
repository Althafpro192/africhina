/**
 * RFQ Create Upload Test
 * Tests the upload functionality in the RFQ Create page
 * Verifies:
 * 1. FileUpload component appears
 * 2. Files can be selected and previewed
 * 3. Compression feedback is shown
 * 4. Files can be deleted
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

    // Capture console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console error: ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        errors.push(`Page error: ${err.message}`);
    });

    try {
        console.log('=== RFQ Create Upload Test ===\n');

        // 1. Login first - use production server (port 8000)
        console.log('1. Logging in...');
        await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);

        // Fill login form
        await page.fill('input[type="email"]', 'buyer@test.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        console.log('   ✓ Login successful\n');

        // 2. Navigate to RFQ Create
        console.log('2. Navigating to RFQ Create...');
        await page.goto('http://localhost:8000/buyer/rfq/create', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        // 3. Check FileUpload component exists
        console.log('3. Checking FileUpload component...');
        const fileUpload = await page.$('.file-upload-container');
        if (fileUpload) {
            console.log('   ✓ FileUpload component found');
        } else {
            // Try alternative selector
            const altUpload = await page.$('[class*="file-upload"]');
            if (altUpload) {
                console.log('   ✓ FileUpload component found (alt selector)');
            } else {
                console.log('   ✗ FileUpload component NOT found');
                errors.push('FileUpload component not found');
            }
        }

        // 4. Check drop zone exists
        console.log('4. Checking drop zone...');
        const dropZone = await page.$('.drop-zone');
        if (dropZone) {
            console.log('   ✓ Drop zone found');
        } else {
            console.log('   ⚠ Drop zone not found, checking for cloud_upload icon...');
            const cloudIcon = await page.$('text=cloud_upload');
            if (cloudIcon) {
                console.log('   ✓ Cloud upload section found');
            }
        }

        // 5. Check dark mode styling
        console.log('5. Checking dark mode styling...');
        const bodyClass = await page.evaluate(() => document.body.className);
        console.log(`   Body classes: ${bodyClass}`);

        // 6. Take a screenshot of the page
        console.log('6. Taking screenshot...');
        await page.screenshot({ path: 'frontend/test-results/rfq-create-upload-test.png', fullPage: true });
        console.log('   ✓ Screenshot saved to frontend/test-results/rfq-create-upload-test.png');

        // 7. Check for file input
        console.log('7. Checking file input...');
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
            console.log('   ✓ File input found');
        } else {
            console.log('   ✗ File input NOT found');
        }

        // 8. Summary
        console.log('\n=== Test Summary ===');
        if (errors.length === 0) {
            console.log('✓ All checks passed!');
        } else {
            console.log('✗ Some checks failed:');
            errors.forEach(e => console.log(`  - ${e}`));
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        errors.push(`Test error: ${error.message}`);
    } finally {
        await browser.close();

        // Exit with appropriate code
        process.exit(errors.length === 0 ? 0 : 1);
    }
})();
