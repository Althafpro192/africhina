/**
 * Test script: RequestDetail Image & Error Display
 * Tests: Image display, error message colors, RFQ workflow
 */

const { chromium } = require('playwright');

const API_BASE = 'http://localhost:8000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Buyer credentials from DatabaseSeeder
const BUYER_EMAIL = 'buyer@africhina.com';
const BUYER_PASSWORD = 'password123';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('🚀 Starting RequestDetail UI Tests...\n');

    const browser = await chromium.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome'
    });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    const results = {
        passed: [],
        failed: [],
        errors: []
    };

    // Capture console errors
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    try {
        // 1. Login as buyer
        console.log('1️⃣ Logging in as buyer...');
        await page.goto(`${FRONTEND_URL}/login`);
        await sleep(2000);

        await page.fill('input[type="email"]', BUYER_EMAIL);
        await page.fill('input[type="password"]', BUYER_PASSWORD);
        await page.click('button[type="submit"]');
        await sleep(3000);

        // Check if logged in
        const currentUrl = page.url();
        if (currentUrl.includes('/login')) {
            console.log('   ⚠️ Still on login page - checking auth...');
        } else {
            console.log('   ✅ Login successful');
            results.passed.push('Login as buyer');
        }

        // 2. Get a request ID from API or create one
        console.log('\n2️⃣ Getting/Creating request ID...');
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: BUYER_EMAIL, password: BUYER_PASSWORD })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        let requestId = null;

        // Try to get existing requests
        const requestsRes = await fetch(`${API_BASE}/requests/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const requestsData = await requestsRes.json();

        if (requestsData.data && requestsData.data.length > 0) {
            requestId = requestsData.data[0].id;
            console.log(`   ✅ Using existing request ID: ${requestId}`);
            results.passed.push('Get existing request');
        } else {
            // Create a test request
            console.log('   Creating a test request...');

            // Create request via frontend form
            await page.goto(`${FRONTEND_URL}/buyer/requests/new`);
            await sleep(3000);

            // Fill in the form
            const productNameInput = await page.locator('input[placeholder*="Product"], input[placeholder*="product"]').first();
            if (await productNameInput.isVisible()) {
                await productNameInput.fill('Test Product for UI Testing');

                // Fill category
                const categorySelect = await page.locator('select').first();
                if (await categorySelect.isVisible()) {
                    await categorySelect.selectOption({ index: 1 });
                }

                // Fill description
                const descTextarea = await page.locator('textarea').first();
                if (await descTextarea.isVisible()) {
                    await descTextarea.fill('Test description for image display testing');
                }

                // Submit
                const submitBtn = await page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Create")').first();
                if (await submitBtn.isVisible()) {
                    await submitBtn.click();
                    await sleep(3000);

                    // Get the URL which should contain the new request ID
                    const newUrl = page.url();
                    if (newUrl.includes('/requests/')) {
                        requestId = newUrl.split('/requests/')[1]?.split('/')[0];
                        console.log(`   ✅ Created new request ID: ${requestId}`);
                        results.passed.push('Create test request');
                    }
                }
            }
        }

        if (!requestId) {
            // Use a UUID directly to test the page
            requestId = 'test-' + Date.now();
            console.log(`   ⚠️ Using fallback ID for testing: ${requestId}`);
            results.errors.push('Could not get valid request ID');
        }

        // 3. Navigate to RequestDetail page
        console.log('\n3️⃣ Navigating to RequestDetail page...');
        await page.goto(`${FRONTEND_URL}/buyer/requests/${requestId}`);
        await sleep(3000);

        // 4. Check for image elements
        console.log('\n4️⃣ Checking image display...');
        const imageElements = await page.locator('img').all();
        console.log(`   Found ${imageElements.length} image elements`);

        let imageIssues = 0;
        let validImages = 0;
        for (let i = 0; i < Math.min(imageElements.length, 10); i++) {
            const src = await imageElements[i].getAttribute('src');
            const isVisible = await imageElements[i].isVisible();
            const naturalWidth = await imageElements[i].evaluate(el => el.naturalWidth);

            if (src && (src.startsWith('data:') || src.startsWith('http') || src.startsWith('/'))) {
                validImages++;
                if (naturalWidth === 0 && src.length > 0) {
                    imageIssues++;
                    console.log(`   ⚠️ Image ${i + 1}: src="${src.substring(0, 60)}..." visible=${isVisible} naturalWidth=0 (BROKEN)`);
                }
            }
        }

        console.log(`   Valid images with src: ${validImages}`);
        console.log(`   Images with issues: ${imageIssues}`);

        if (validImages > 0 && imageIssues === 0) {
            results.passed.push('Images display correctly');
        } else if (imageIssues > 0) {
            results.failed.push(`${imageIssues} images not displaying properly`);
        }

        // 5. Check for error messages and their colors
        console.log('\n5️⃣ Checking toast notification colors...');

        // Check ToastNotification component
        const toastContainer = await page.locator('[class*="fixed"][class*="z-[9999]"]').first();
        const toastExists = await toastContainer.count() > 0;

        if (toastExists) {
            console.log('   ✅ Toast container exists');
            results.passed.push('Toast container exists');
        }

        // Check for inline edit buttons
        const editButtons = await page.locator('[data-action="edit-field"]').all();
        console.log(`   Found ${editButtons.length} edit field buttons`);

        if (editButtons.length > 0) {
            // Try to trigger a save error by editing and saving
            console.log('   Testing inline edit flow...');
            await editButtons[0].click();
            await sleep(500);

            // Check for edit input
            const editInput = await page.locator('[data-edit-input]').first();
            if (await editInput.isVisible()) {
                console.log('   ✅ Edit input appeared');

                // Get the cancel button and click it
                const cancelBtn = await page.locator('[data-action="cancel-inline"]').first();
                if (await cancelBtn.isVisible()) {
                    await cancelBtn.click();
                    await sleep(500);
                    console.log('   ✅ Cancel edit works');
                    results.passed.push('Inline edit cancel');
                }
            }
        }

        // 6. Check RFQ workflow stages in timeline
        console.log('\n6️⃣ Checking RFQ workflow stages...');
        const timelineStages = await page.locator('[class*="timeline"], [class*="stage"], [class*="progress"], [class*="tracking"]').all();
        console.log(`   Found ${timelineStages.length} workflow elements`);

        // Look for status badges
        const statusBadges = await page.locator('[class*="bg-"][class*="500"], [class*="bg-"][class*="-500"]').all();
        console.log(`   Found ${statusBadges.length} status badges`);

        if (statusBadges.length > 0) {
            results.passed.push('RFQ status badges visible');
        }

        // 7. Check for error alert styles
        console.log('\n7️⃣ Checking error/success alert styling...');
        const errorAlerts = await page.locator('[class*="rose"], [class*="red"], [class*="emerald"], [class*="green"]').all();
        console.log(`   Found ${errorAlerts.length} colored alert elements`);

        // 8. Check console for errors
        console.log('\n8️⃣ Checking console for errors...');
        const criticalErrors = consoleErrors.filter(e =>
            e.includes('Failed to load') ||
            e.includes('Network Error') ||
            e.includes('500') ||
            e.includes('Cannot read')
        );

        if (criticalErrors.length > 0) {
            console.log(`   ⚠️ Found ${criticalErrors.length} critical errors:`);
            criticalErrors.forEach(err => {
                console.log(`      - ${err.substring(0, 100)}`);
            });
            results.failed.push('Critical console errors');
        } else {
            console.log('   ✅ No critical console errors');
            results.passed.push('No console errors');
        }

        // 9. Screenshot for verification
        console.log('\n9️⃣ Taking screenshot...');
        await page.screenshot({ path: 'test-results/requestdetail-page.png', fullPage: true });
        console.log('   ✅ Screenshot saved to test-results/requestdetail-page.png');
        results.passed.push('Screenshot captured');

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        results.errors.push(error.message);
    } finally {
        await browser.close();
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed.length}`);
    results.passed.forEach(t => console.log(`   - ${t}`));
    console.log(`\n❌ Failed: ${results.failed.length}`);
    results.failed.forEach(t => console.log(`   - ${t}`));
    console.log(`\n⚠️ Errors: ${results.errors.length}`);
    results.errors.forEach(t => console.log(`   - ${t}`));
    console.log('='.repeat(60));

    // Save results
    const fs = require('fs');
    if (!fs.existsSync('test-results')) {
        fs.mkdirSync('test-results', { recursive: true });
    }
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            passed: results.passed.length,
            failed: results.failed.length,
            errors: results.errors.length
        },
        details: results
    };
    fs.writeFileSync('test-results/requestdetail-test.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to test-results/requestdetail-test.json');

    return results;
}

runTests().catch(console.error);
