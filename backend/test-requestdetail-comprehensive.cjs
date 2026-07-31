/**
 * Comprehensive RequestDetail UI Test
 * Tests: Image display, error colors, RFQ workflow stages
 */

const { chromium } = require('playwright');
const fs = require('fs');

const API_BASE = 'http://localhost:8000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Buyer credentials from DatabaseSeeder
const BUYER_EMAIL = 'buyer@africhina.com';
const BUYER_PASSWORD = 'password123';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getValidRequestId() {
    try {
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: BUYER_EMAIL, password: BUYER_PASSWORD })
        });

        if (!loginRes.ok) return null;

        const loginData = await loginRes.json();
        const token = loginData.token;

        const requestsRes = await fetch(`${API_BASE}/requests/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!requestsRes.ok) return null;

        const requestsData = await requestsRes.json();

        if (requestsData.data && requestsData.data.length > 0) {
            return { id: requestsData.data[0].id, token, data: requestsData.data[0] };
        }

        // Check for request_details if available
        if (requestsData.request) {
            return { id: requestsData.request.id, token, data: requestsData.request };
        }

        return null;
    } catch (e) {
        console.error('Error getting request ID:', e.message);
        return null;
    }
}

async function runTests() {
    console.log('🚀 Starting Comprehensive RequestDetail UI Tests...\n');

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

    // Capture all console messages
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push({ type: msg.type(), text: msg.text() });
    });

    try {
        // 1. Get a valid request from API
        console.log('1️⃣ Getting valid request from API...');
        const requestInfo = await getValidRequestId();

        if (requestInfo) {
            console.log(`   ✅ Found request ID: ${requestInfo.id}`);
            console.log(`   Request data:`, JSON.stringify(requestInfo.data, null, 2).substring(0, 500));
            results.passed.push('Get valid request from API');
        } else {
            console.log('   ⚠️ No requests found in API');
        }

        // 2. Login via frontend to inject auth
        console.log('\n2️⃣ Logging in via frontend...');
        await page.goto(`${FRONTEND_URL}/login`);
        await sleep(2000);

        await page.fill('input[type="email"]', BUYER_EMAIL);
        await page.fill('input[type="password"]', BUYER_PASSWORD);
        await page.click('button[type="submit"]');
        await sleep(3000);

        const afterLoginUrl = page.url();
        console.log(`   Current URL: ${afterLoginUrl}`);

        if (!afterLoginUrl.includes('/login')) {
            console.log('   ✅ Login successful');
            results.passed.push('Frontend login');

            // Inject auth token from API
            if (requestInfo?.token) {
                await page.evaluate((token) => {
                    localStorage.setItem('token', token);
                }, requestInfo.token);
                console.log('   ✅ Injected auth token');
            }
        }

        // 3. Navigate to RequestDetail or create a request
        console.log('\n3️⃣ Testing RequestDetail page...');

        if (requestInfo) {
            // Navigate to existing request
            console.log(`   Navigating to request: ${requestInfo.id}`);
            await page.goto(`${FRONTEND_URL}/buyer/requests/${requestInfo.id}`);
            await sleep(4000);
        } else {
            // Try to create a new request
            console.log('   Creating new request...');
            await page.goto(`${FRONTEND_URL}/buyer/requests/new`);
            await sleep(3000);

            // Fill the form
            const productInput = await page.locator('input').first();
            if (await productInput.isVisible()) {
                await productInput.fill('Test Product');

                const submitBtn = await page.locator('button[type="submit"]').first();
                if (await submitBtn.isVisible()) {
                    await submitBtn.click();
                    await sleep(3000);
                }
            }
        }

        // 4. Check page structure
        console.log('\n4️⃣ Analyzing page structure...');

        const pageTitle = await page.title();
        console.log(`   Page title: ${pageTitle}`);

        const h1Elements = await page.locator('h1, h2').all();
        console.log(`   Found ${h1Elements.length} headings`);
        for (const h of h1Elements.slice(0, 5)) {
            const text = await h.textContent();
            console.log(`      - ${text?.substring(0, 50)}`);
        }

        // 5. Check image elements
        console.log('\n5️⃣ Checking image elements...');
        const allImages = await page.locator('img').all();
        console.log(`   Total images found: ${allImages.length}`);

        let brokenImages = 0;
        for (let i = 0; i < Math.min(allImages.length, 10); i++) {
            const src = await allImages[i].getAttribute('src');
            const alt = await allImages[i].getAttribute('alt');
            const isVisible = await allImages[i].isVisible();

            if (src) {
                // Check if it's a valid image source
                const isValidSrc = src.startsWith('data:') ||
                    src.startsWith('http://') ||
                    src.startsWith('https://') ||
                    src.startsWith('/');

                console.log(`   Image ${i + 1}: src="${src?.substring(0, 60)}..." valid=${isValidSrc}`);

                if (isValidSrc && isVisible) {
                    results.passed.push(`Image ${i + 1} displays correctly`);
                } else if (isValidSrc && !isVisible) {
                    console.log(`      ⚠️ Image exists but not visible`);
                } else {
                    brokenImages++;
                }
            } else {
                console.log(`   Image ${i + 1}: NO SRC`);
                brokenImages++;
            }
        }

        if (brokenImages > 0) {
            results.failed.push(`${brokenImages} images have broken sources`);
        }

        // 6. Check edit buttons and inline editing
        console.log('\n6️⃣ Checking edit functionality...');
        const editButtons = await page.locator('[data-action="edit-field"]').all();
        console.log(`   Found ${editButtons.length} edit buttons`);

        if (editButtons.length > 0) {
            results.passed.push('Edit buttons present');

            // Test one edit
            await editButtons[0].click();
            await sleep(500);

            const editInputs = await page.locator('[data-edit-input]').all();
            console.log(`   Edit inputs visible: ${editInputs.length}`);

            if (editInputs.length > 0) {
                results.passed.push('Inline edit input appears');

                // Cancel edit
                const cancelBtn = await page.locator('[data-action="cancel-inline"]').first();
                if (await cancelBtn.isVisible()) {
                    await cancelBtn.click();
                    await sleep(300);
                    results.passed.push('Cancel inline edit works');
                }
            }
        }

        // 7. Check RFQ workflow stages
        console.log('\n7️⃣ Checking RFQ workflow stages...');
        const timeline = await page.locator('[class*="timeline"], .tracking-log, .status-timeline').all();
        console.log(`   Timeline elements: ${timeline.length}`);

        // Check for status badges
        const statusBadges = await page.locator('[class*="rounded-full"][class*="px-"], span[class*="bg-"]').all();
        console.log(`   Status badges: ${statusBadges.length}`);

        // Look for specific stage names
        const stageNames = ['RFQ Sent', 'Options', 'Negotiate', 'Payment', 'Process', 'Shipped', 'Complete'];
        for (const stage of stageNames) {
            const stageElement = await page.locator(`text=${stage}`).first();
            const found = await stageElement.count() > 0;
            console.log(`   ${stage}: ${found ? '✅' : '❌'}`);
            if (found) {
                results.passed.push(`Stage "${stage}" visible`);
            }
        }

        // 8. Check toast notification colors
        console.log('\n8️⃣ Checking toast notification colors...');

        // Check ToastNotification.vue component styles
        const toastStyles = await page.evaluate(() => {
            // Find any toast elements
            const toasts = document.querySelectorAll('[class*="fixed"][class*="z-"]');
            const styles = [];
            toasts.forEach(t => {
                const classList = Array.from(t.classList);
                const bg = classList.find(c => c.includes('bg-') && !c.includes('hover'));
                const text = classList.find(c => c.includes('text-') && !c.includes('hover'));
                styles.push({ classList, bg, text });
            });
            return styles;
        });

        console.log(`   Toast elements found: ${toastStyles.length}`);

        // 9. Check for success/error message styling
        console.log('\n9️⃣ Checking success/error styling...');

        const errorElements = await page.locator('[class*="rose"], [class*="red-"], [class*="red/"]').all();
        const successElements = await page.locator('[class*="emerald"], [class*="green-"], [class*="green/"]').all();

        console.log(`   Error-styled elements: ${errorElements.length}`);
        console.log(`   Success-styled elements: ${successElements.length}`);

        // 10. Check for console errors
        console.log('\n🔟 Checking console errors...');
        const errors = consoleLogs.filter(l => l.type === 'error');

        if (errors.length > 0) {
            console.log(`   Found ${errors.length} console errors:`);
            errors.slice(0, 5).forEach(e => {
                console.log(`      - ${e.text.substring(0, 100)}`);
            });
            results.errors.push(`${errors.length} console errors`);
        } else {
            console.log('   ✅ No console errors');
            results.passed.push('No console errors');
        }

        // 11. Screenshot
        console.log('\n1️⃣1️⃣ Taking screenshot...');
        await page.screenshot({ path: 'test-results/requestdetail-comprehensive.png', fullPage: true });
        console.log('   ✅ Screenshot saved');

        // 12. Get page HTML for analysis
        console.log('\n1️⃣2️⃣ Page analysis...');
        const pageAnalysis = await page.evaluate(() => {
            return {
                url: window.location.href,
                title: document.title,
                bodyText: document.body.innerText.substring(0, 500),
                hasRequestDetail: document.body.innerHTML.includes('request') || document.body.innerHTML.includes('Request'),
                hasTimeline: document.body.innerHTML.includes('timeline') || document.body.innerHTML.includes('Timeline'),
                hasEdit: document.body.innerHTML.includes('edit') || document.body.innerHTML.includes('Edit'),
                hasImage: document.querySelectorAll('img').length,
                imageSources: Array.from(document.querySelectorAll('img')).slice(0, 5).map(img => ({
                    src: img.src.substring(0, 80),
                    alt: img.alt,
                    complete: img.complete,
                    naturalWidth: img.naturalWidth
                }))
            };
        });

        console.log(`   URL: ${pageAnalysis.url}`);
        console.log(`   Has "request": ${pageAnalysis.hasRequestDetail}`);
        console.log(`   Has "timeline": ${pageAnalysis.hasTimeline}`);
        console.log(`   Has "edit": ${pageAnalysis.hasEdit}`);
        console.log(`   Images: ${pageAnalysis.hasImage}`);

        if (pageAnalysis.imageSources.length > 0) {
            console.log('   Image sources:');
            pageAnalysis.imageSources.forEach(img => {
                console.log(`      src="${img.src}" complete=${img.complete} width=${img.naturalWidth}`);
            });
        }

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.error(error.stack);
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

    // Save detailed report
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            passed: results.passed.length,
            failed: results.failed.length,
            errors: results.errors.length
        },
        details: results
    };

    fs.writeFileSync('test-results/requestdetail-comprehensive.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to test-results/requestdetail-comprehensive.json');

    return results;
}

runTests().catch(console.error);
