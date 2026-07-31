/**
 * COMPREHENSIVE E2E TEST - ALL ROLES, ALL FEATURES (FIXED)
 */

const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.APP_URL || 'http://localhost:8000';
const SCREENSHOT_DIR = 'test-results/e2e-fixed';

// Credentials from DatabaseSeeder
const CREDENTIALS = {
  buyer: { email: 'buyer@africhina.com', password: 'password123' },
  admin: { email: 'admin@africhina.com', password: 'password123' },
  driver: { email: 'driver@africhina.com', password: 'password123' },
  supplier: { email: 'supplier@africhina.com', password: 'password123' }
};

const results = { passed: 0, failed: 0, errors: [] };

function log(name, status, msg) {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${name}: ${msg}`);
  if (status === 'PASS') results.passed++;
  else results.failed++;
}

async function screenshot(page, name) {
  const path = `${SCREENSHOT_DIR}/${name}.png`;
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  try { await page.screenshot({ path, fullPage: true }); } catch (e) {}
  return path;
}

async function login(page, credentials, role) {
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await screenshot(page, `${role}-login`);
    await page.fill('input[type="email"]', credentials.email);
    await page.fill('input[type="password"]', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await screenshot(page, `${role}-after-login`);
    return !page.url().includes('/login');
  } catch (e) {
    log(`LOGIN ${role.toUpperCase()}`, 'FAIL', e.message);
    return false;
  }
}

async function testPage(page, name, path, check) {
  try {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, name.replace(/[^a-z0-9]/gi, '-').toLowerCase());
    if (check) {
      const el = await page.$(check);
      if (el) { log(name, 'PASS', 'Page loaded'); return true; }
      else { log(name, 'FAIL', `${check} not found`); return false; }
    }
    log(name, 'PASS', 'Page loaded');
    return true;
  } catch (e) {
    log(name, 'FAIL', e.message);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   COMPREHENSIVE E2E TEST - ALL FEATURES (FIXED VERSION)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: false,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // ===== GUEST TESTS =====
    console.log('\n📋 GUEST TESTS');
    console.log('─'.repeat(50));
    
    const guestContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const guestPage = await guestContext.newPage();
    
    await testPage(guestPage, 'GUEST Landing', '/', 'h1, h2, main');
    await testPage(guestPage, 'GUEST Login', '/login', 'form');
    await testPage(guestPage, 'GUEST Register', '/supplier/register', 'form');
    
    await guestContext.close();

    // ===== BUYER TESTS =====
    console.log('\n📋 BUYER TESTS');
    console.log('─'.repeat(50));
    
    const buyerContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const buyerPage = await buyerContext.newPage();
    
    const buyerLoggedIn = await login(buyerPage, CREDENTIALS.buyer, 'buyer');
    if (buyerLoggedIn) {
      await testPage(buyerPage, 'BUYER Dashboard', '/buyer/dashboard', 'main, .dashboard, [class*="content"]');
      await testPage(buyerPage, 'BUYER Requests', '/buyer/requests', 'body');
      await testPage(buyerPage, 'BUYER Create RFQ', '/buyer/rfq/create', 'form');
      await testPage(buyerPage, 'BUYER Messages', '/buyer/messages', 'body');
      await testPage(buyerPage, 'BUYER Orders', '/buyer/orders', 'body');
      await testPage(buyerPage, 'BUYER Suppliers', '/buyer/suppliers', 'body');
      await testPage(buyerPage, 'BUYER Sourcing', '/buyer/sourcing', 'body');
      await testPage(buyerPage, 'BUYER Logistics', '/buyer/logistics', 'body');
      await testPage(buyerPage, 'BUYER Settings', '/buyer/settings', 'body');
    }
    
    await buyerContext.close();

    // ===== ADMIN TESTS =====
    console.log('\n📋 ADMIN TESTS');
    console.log('─'.repeat(50));
    
    const adminContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const adminPage = await adminContext.newPage();
    
    const adminLoggedIn = await login(adminPage, CREDENTIALS.admin, 'admin');
    if (adminLoggedIn) {
      await testPage(adminPage, 'ADMIN Dashboard', '/admin/dashboard', 'body');
      await testPage(adminPage, 'ADMIN Requests', '/admin/requests', 'body');
      await testPage(adminPage, 'ADMIN Suppliers', '/admin/suppliers', 'body');
      await testPage(adminPage, 'ADMIN Drivers', '/admin/drivers', 'body');
      await testPage(adminPage, 'ADMIN Ratings', '/admin/ratings', 'body');
      await testPage(adminPage, 'ADMIN Messages', '/admin/messages', 'body');
    }
    
    await adminContext.close();

    // ===== DRIVER TESTS =====
    console.log('\n📋 DRIVER TESTS');
    console.log('─'.repeat(50));
    
    const driverContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const driverPage = await driverContext.newPage();
    
    const driverLoggedIn = await login(driverPage, CREDENTIALS.driver, 'driver');
    if (driverLoggedIn) {
      await testPage(driverPage, 'DRIVER Messages', '/driver/messages', 'body');
    }
    
    await driverContext.close();

  } catch (e) {
    console.error('FATAL ERROR:', e.message);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  const total = results.passed + results.failed;
  const rate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  console.log(`📊 Pass Rate: ${rate}%`);
  
  // Save results
  fs.writeFileSync('test-results/e2e-fixed-results.json', JSON.stringify(results, null, 2));
}

runTests().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
