/**
 * Simple RFQ Create Page Test
 * Tests if the RFQ Create page loads and shows the upload component
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
        console.log('=== Simple RFQ Create Test ===\n');

        // 1. Login
        console.log('1. Logging in...');
        await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        await page.fill('input[type="email"]', 'buyer@test.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        console.log('   ✓ Login successful\n');

        // 2. Navigate to RFQ Create
        console.log('2. Navigating to RFQ Create...');
        await page.goto('http://localhost:8000/buyer/rfq/create', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        // 3. Get page content
        console.log('3. Checking page content...');
        const bodyText = await page.textContent('body');

        // Check for various upload-related elements
        const hasCloudUpload = bodyText.includes('cloud_upload') || bodyText.includes('Cloud Upload');
        const hasFileUpload = bodyText.includes('file-upload') || bodyText.includes('File Upload');
        const hasReferences = bodyText.includes('References') || bodyText.includes('references');
        const hasAddMore = bodyText.includes('addMore') || bodyText.includes('Add More');

        console.log(`   - Has cloud_upload text: ${hasCloudUpload}`);
        console.log(`   - Has file-upload class: ${hasFileUpload}`);
        console.log(`   - Has References text: ${hasReferences}`);
        console.log(`   - Has Add More text: ${hasAddMore}`);

        // 4. Check for specific elements
        console.log('\n4. Looking for upload elements...');

        // Check for the FileUpload component container
        const fileUploadContainer = await page.$('.file-upload-container');
        console.log(`   - .file-upload-container: ${fileUploadContainer ? 'FOUND' : 'NOT FOUND'}`);

        // Check for drop zone
        const dropZone = await page.$('.drop-zone');
        console.log(`   - .drop-zone: ${dropZone ? 'FOUND' : 'NOT FOUND'}`);

        // Check for any input type="file"
        const fileInput = await page.$('input[type="file"]');
        console.log(`   - input[type="file"]: ${fileInput ? 'FOUND' : 'NOT FOUND'}`);

        // 5. Report errors
        console.log('\n5. Console errors:');
        if (errors.length === 0) {
            console.log('   ✓ No errors');
        } else {
            errors.forEach(e => console.log(`   - ${e}`));
        }

        // 6. Take screenshot
        await page.screenshot({ path: 'frontend/test-results/rfq-create-simple-test.png' });
        console.log('\n6. Screenshot saved');

        // Summary
        console.log('\n=== SUMMARY ===');
        if (hasReferences && hasAddMore) {
            console.log('✓ RFQ Create page appears to be loading correctly');
        } else {
            console.log('✗ RFQ Create page may not be loading correctly');
        }

    } catch (err) {
        console.error('Test failed:', err.message);
    } finally {
        await browser.close();
    }
})();
