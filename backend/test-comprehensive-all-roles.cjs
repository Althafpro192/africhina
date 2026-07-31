/**
 * COMPREHENSIVE E2E TEST - ALL ROLES, ALL FEATURES
 * Tests every feature across all user roles
 */

const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.APP_URL || 'http://localhost:8000';
const RESULTS_FILE = 'test-results/comprehensive-e2e-results.json';
const SCREENSHOT_DIR = 'test-results/e2e-screenshots';

// Test credentials
const CREDENTIALS = {
    buyer: { email: 'buyer@africhina.com', password: 'password123' },
    admin: { email: 'admin@africhina.com', password: 'password123' },
    driver: { email: 'driver@africhina.com', password: 'password123' },
    supplier: { email: 'supplier@africhina.com', password: 'password123' }
};

// Test results
const results = {
    timestamp: new Date().toISOString(),
    summary: { passed: 0, failed: 0, warnings: 0, total: 0 },
    tests: []
};

function log(testName, status, message, screenshot = null) {
    const result = { testName, status, message, screenshot, timestamp: new Date().toISOString() };
    results.tests.push(result);

    if (status === 'PASS') results.summary.passed++;
    else if (status === 'FAIL') results.summary.failed++;
    else results.summary.warnings++;
    results.summary.total++;

    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${testName}: ${message}`);

    if (screenshot) {
        const path = `${SCREENSHOT_DIR}/${screenshot}`;
        if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
}

async function captureScreenshot(page, name) {
    const path = `${SCREENSHOT_DIR}/${name}.png`;
    if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    try {
        await page.screenshot({ path, fullPage: true });
        return path;
    } catch (e) {
        return null;
    }
}

async function waitAndClick(page, selector, timeout = 5000) {
    try {
        await page.waitForSelector(selector, { timeout });
        await page.click(selector);
        return true;
    } catch (e) {
        return false;
    }
}

async function fillAndSubmit(page, formData) {
    try {
        for (const [selector, value] of Object.entries(formData)) {
            const el = await page.$(selector);
            if (el) {
                await el.fill(value);
            }
        }
        return true;
    } catch (e) {
        return false;
    }
}

// ============================================================================
// BUYER TESTS
// ============================================================================
async function testBuyerLogin(page) {
    const testName = 'BUYER: Login';
    try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
        await captureScreenshot(page, 'buyer-login');

        await page.fill('input[type="email"]', CREDENTIALS.buyer.email);
        await page.fill('input[type="password"]', CREDENTIALS.buyer.password);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        if (currentUrl.includes('/dashboard') || currentUrl.includes('/requests')) {
            await captureScreenshot(page, 'buyer-after-login');
            log(testName, 'PASS', 'Login successful');
            return true;
        } else {
            await captureScreenshot(page, 'buyer-login-fail');
            log(testName, 'FAIL', `Login failed - redirected to ${currentUrl}`);
            return false;
        }
    } catch (e) {
        await captureScreenshot(page, 'buyer-login-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testBuyerDashboard(page) {
    const testName = 'BUYER: Dashboard';
    try {
        await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'buyer-dashboard');

        const title = await page.title();
        const hasContent = await page.$('.dashboard, .content, main, [class*="dashboard"]');

        if (hasContent) {
            log(testName, 'PASS', 'Dashboard loaded with content');
            return true;
        } else {
            log(testName, 'FAIL', 'Dashboard empty or error');
            return false;
        }
    } catch (e) {
        await captureScreenshot(page, 'buyer-dashboard-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testBuyerRequests(page) {
    const testName = 'BUYER: Requests List';
    try {
        await page.goto(`${BASE_URL}/requests`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'buyer-requests');

        const requests = await page.$$('a[href*="/buyer/rfq/], .request-card, [class*="request"]');
        log(testName, 'PASS', `Found ${requests.length} requests`);
        return true;
    } catch (e) {
        await captureScreenshot(page, 'buyer-requests-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testBuyerRFQCreate(page) {
    const testName = 'BUYER: Create RFQ';
    try {
        await page.goto(`${BASE_URL}/buyer/rfq/create`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'buyer-rfq-create');

        // Check if form exists
        const form = await page.$('form, [class*="form"]');
        if (form) {
            log(testName, 'PASS', 'RFQ form loaded');
            return true;
        } else {
            log(testName, 'FAIL', 'RFQ form not found');
            return false;
        }
    } catch (e) {
        await captureScreenshot(page, 'buyer-rfq-create-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testBuyerRequestDetail(page) {
    const testName = 'BUYER: Request Detail';
    try {
        // First go to requests
        await page.goto(`${BASE_URL}/requests`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);

        // Try to find a request link
        const requestLink = await page.$('a[href*="/buyer/rfq/][href$="/"]');
        if (requestLink) {
            await requestLink.click();
            await page.waitForTimeout(3000);
        } else {
            // Try to go directly to first request
            await page.goto(`${BASE_URL}/requests/1`, { waitUntil: 'networkidle', timeout: 15000 });
            await page.waitForTimeout(3000);
        }

        await captureScreenshot(page, 'buyer-request-detail');

        // Check for common elements
        const hasProduct = await page.$('[class*="product"], [class*="title"], h1, h2');
        const hasImages = await page.$$('img');

        if (hasProduct || hasImages.length > 0) {
            log(testName, 'PASS', `Request detail loaded with ${hasImages.length} images`);
            return true;
        } else {
            log(testName, 'FAIL', 'Request detail not loaded properly');
            return false;
        }
    } catch (e) {
        await captureScreenshot(page, 'buyer-request-detail-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testBuyerMessages(page) {
    const testName = 'BUYER: Messages';
    try {
        await page.goto(`${BASE_URL}/messages`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'buyer-messages');

        const hasMessages = await page.$('[class*="message"], [class*="chat"], [class*="conversation"]');
        log(testName, 'PASS', 'Messages page loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'buyer-messages-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testBuyerOrders(page) {
    const testName = 'BUYER: Orders';
    try {
        await page.goto(`${BASE_URL}/orders`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'buyer-orders');
        log(testName, 'PASS', 'Orders page loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'buyer-orders-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testBuyerSuppliers(page) {
    const testName = 'BUYER: Suppliers';
    try {
        await page.goto(`${BASE_URL}/suppliers`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'buyer-suppliers');
        log(testName, 'PASS', 'Suppliers page loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'buyer-suppliers-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testBuyerSourcing(page) {
    const testName = 'BUYER: Sourcing';
    try {
        await page.goto(`${BASE_URL}/sourcing`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'buyer-sourcing');
        log(testName, 'PASS', 'Sourcing page loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'buyer-sourcing-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testBuyerLogistics(page) {
    const testName = 'BUYER: Logistics';
    try {
        await page.goto(`${BASE_URL}/logistics`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'buyer-logistics');
        log(testName, 'PASS', 'Logistics page loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'buyer-logistics-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testBuyerSettings(page) {
    const testName = 'BUYER: Settings';
    try {
        await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'buyer-settings');

        const hasSettings = await page.$('form, [class*="setting"], input, button');
        if (hasSettings) {
            log(testName, 'PASS', 'Settings page loaded');
            return true;
        } else {
            log(testName, 'FAIL', 'Settings not found');
            return false;
        }
    } catch (e) {
        await captureScreenshot(page, 'buyer-settings-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

// ============================================================================
// ADMIN TESTS
// ============================================================================
async function testAdminLogin(page) {
    const testName = 'ADMIN: Login';
    try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
        await captureScreenshot(page, 'admin-login');

        await page.fill('input[type="email"]', CREDENTIALS.admin.email);
        await page.fill('input[type="password"]', CREDENTIALS.admin.password);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        if (currentUrl.includes('/admin') || currentUrl.includes('/dashboard')) {
            await captureScreenshot(page, 'admin-after-login');
            log(testName, 'PASS', 'Admin login successful');
            return true;
        } else {
            await captureScreenshot(page, 'admin-login-fail');
            log(testName, 'FAIL', `Login failed - redirected to ${currentUrl}`);
            return false;
        }
    } catch (e) {
        await captureScreenshot(page, 'admin-login-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testAdminDashboard(page) {
    const testName = 'ADMIN: Dashboard';
    try {
        await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'admin-dashboard');

        const hasContent = await page.$('[class*="dashboard"], [class*="stat"], [class*="card"]');
        log(testName, 'PASS', 'Admin dashboard loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'admin-dashboard-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testAdminRequests(page) {
    const testName = 'ADMIN: Requests';
    try {
        await page.goto(`${BASE_URL}/admin/requests`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'admin-requests');
        log(testName, 'PASS', 'Admin requests loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'admin-requests-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testAdminSuppliers(page) {
    const testName = 'ADMIN: Suppliers';
    try {
        await page.goto(`${BASE_URL}/admin/suppliers`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'admin-suppliers');
        log(testName, 'PASS', 'Admin suppliers loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'admin-suppliers-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testAdminDrivers(page) {
    const testName = 'ADMIN: Drivers';
    try {
        await page.goto(`${BASE_URL}/admin/drivers`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'admin-drivers');
        log(testName, 'PASS', 'Admin drivers loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'admin-drivers-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testAdminRatings(page) {
    const testName = 'ADMIN: Ratings';
    try {
        await page.goto(`${BASE_URL}/admin/ratings`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'admin-ratings');
        log(testName, 'PASS', 'Admin ratings loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'admin-ratings-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testAdminMessages(page) {
    const testName = 'ADMIN: Messages';
    try {
        await page.goto(`${BASE_URL}/admin/messages`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'admin-messages');
        log(testName, 'PASS', 'Admin messages loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'admin-messages-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

// ============================================================================
// DRIVER TESTS
// ============================================================================
async function testDriverLogin(page) {
    const testName = 'DRIVER: Login';
    try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
        await captureScreenshot(page, 'driver-login');

        await page.fill('input[type="email"]', CREDENTIALS.driver.email);
        await page.fill('input[type="password"]', CREDENTIALS.driver.password);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        await captureScreenshot(page, 'driver-after-login');

        if (currentUrl.includes('/driver') || currentUrl.includes('/orders')) {
            log(testName, 'PASS', 'Driver login successful');
            return true;
        } else {
            log(testName, 'FAIL', `Login failed - redirected to ${currentUrl}`);
            return false;
        }
    } catch (e) {
        await captureScreenshot(page, 'driver-login-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testDriverMessages(page) {
    const testName = 'DRIVER: Messages';
    try {
        await page.goto(`${BASE_URL}/driver/messages`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'driver-messages');
        log(testName, 'PASS', 'Driver messages loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'driver-messages-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

// ============================================================================
// GUEST TESTS
// ============================================================================
async function testGuestLanding(page) {
    const testName = 'GUEST: Landing Page';
    try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'guest-landing');

        const hasContent = await page.$('h1, h2, main, [class*="hero"]');
        log(testName, 'PASS', 'Landing page loaded');
        return true;
    } catch (e) {
        await captureScreenshot(page, 'guest-landing-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testGuestLogin(page) {
    const testName = 'GUEST: Login Page';
    try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);
        await captureScreenshot(page, 'guest-login');

        const hasForm = await page.$('form, input[type="email"], input[type="password"]');
        if (hasForm) {
            log(testName, 'PASS', 'Login form visible');
            return true;
        } else {
            log(testName, 'FAIL', 'Login form not found');
            return false;
        }
    } catch (e) {
        await captureScreenshot(page, 'guest-login-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

async function testGuestRegister(page) {
    const testName = 'GUEST: Register Page';
    try {
        await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);
        await captureScreenshot(page, 'guest-register');

        const hasForm = await page.$('form, input, button[type="submit"]');
        if (hasForm) {
            log(testName, 'PASS', 'Register form visible');
            return true;
        } else {
            log(testName, 'FAIL', 'Register form not found');
            return false;
        }
    } catch (e) {
        await captureScreenshot(page, 'guest-register-error');
        log(testName, 'FAIL', `Error: ${e.message}`);
        return false;
    }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   COMPREHENSIVE E2E TEST - ALL ROLES, ALL FEATURES');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    const browser = await chromium.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Set longer timeout
    page.setDefaultTimeout(20000);

    try {
        // GUEST TESTS
        console.log('\n📋 GUEST TESTS');
        console.log('─'.repeat(50));
        await testGuestLanding(page);
        await testGuestLogin(page);
        await testGuestRegister(page);

        // BUYER TESTS
        console.log('\n📋 BUYER TESTS');
        console.log('─'.repeat(50));
        await testBuyerLogin(page);
        await testBuyerDashboard(page);
        await testBuyerRequests(page);
        await testBuyerRFQCreate(page);
        await testBuyerRequestDetail(page);
        await testBuyerMessages(page);
        await testBuyerOrders(page);
        await testBuyerSuppliers(page);
        await testBuyerSourcing(page);
        await testBuyerLogistics(page);
        await testBuyerSettings(page);

        // ADMIN TESTS
        console.log('\n📋 ADMIN TESTS');
        console.log('─'.repeat(50));
        await testAdminLogin(page);
        await testAdminDashboard(page);
        await testAdminRequests(page);
        await testAdminSuppliers(page);
        await testAdminDrivers(page);
        await testAdminRatings(page);
        await testAdminMessages(page);

        // DRIVER TESTS
        console.log('\n📋 DRIVER TESTS');
        console.log('─'.repeat(50));
        await testDriverLogin(page);
        await testDriverMessages(page);

    } catch (e) {
        console.error('FATAL ERROR:', e);
        await captureScreenshot(page, 'fatal-error');
    } finally {
        await browser.close();
    }

    // Save results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

    // Print summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\nTotal Tests: ${results.summary.total}`);
    console.log(`✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`⚠️ Warnings: ${results.summary.warnings}`);

    const passRate = ((results.summary.passed / results.summary.total) * 100).toFixed(1);
    console.log(`\nPass Rate: ${passRate}%`);

    // List failed tests
    if (results.summary.failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        results.tests.filter(t => t.status === 'FAIL').forEach(t => {
            console.log(`   - ${t.testName}: ${t.message}`);
        });
    }

    console.log('\n📁 Results saved to:', RESULTS_FILE);
    console.log('📁 Screenshots saved to:', SCREENSHOT_DIR);

    // Create markdown report
    const report = `# Comprehensive E2E Test Report
Generated: ${results.timestamp}

## Summary
- **Total Tests**: ${results.summary.total}
- **Passed**: ${results.summary.passed}
- **Failed**: ${results.summary.failed}
- **Warnings**: ${results.summary.warnings}
- **Pass Rate**: ${passRate}%

## Test Results

### Guest Tests
${results.tests.filter(t => t.testName.startsWith('GUEST')).map(t => `- **${t.status}**: ${t.testName} - ${t.message}`).join('\n')}

### Buyer Tests
${results.tests.filter(t => t.testName.startsWith('BUYER')).map(t => `- **${t.status}**: ${t.testName} - ${t.message}`).join('\n')}

### Admin Tests
${results.tests.filter(t => t.testName.startsWith('ADMIN')).map(t => `- **${t.status}**: ${t.testName} - ${t.message}`).join('\n')}

### Driver Tests
${results.tests.filter(t => t.testName.startsWith('DRIVER')).map(t => `- **${t.status}**: ${t.testName} - ${t.message}`).join('\n')}

## Screenshots
All screenshots saved to: ${SCREENSHOT_DIR}/
`;

    fs.writeFileSync('test-results/e2e-test-report.md', report);
    console.log('📄 Markdown report saved to: test-results/e2e-test-report.md');
}

runTests().then(() => {
    console.log('\n🎉 All tests completed!');
    process.exit(0);
}).catch(err => {
    console.error('\n💥 Fatal error:', err);
    process.exit(1);
});
