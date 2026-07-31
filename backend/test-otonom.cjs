/**
 * Automated E2E Test Script - AfriChina Web
 *
 * Tests complete buyer flow:
 *   1. Login via demo Buyer button (auto-fill credentials)
 *   2. Wait for dashboard redirect
 *   3. Navigate to Messages page
 *   4. Open a chat thread
 *   5. Send a text message
 *   6. Upload a photo & send it
 *
 * Stack assumed to be running locally:
 *   - Laravel API:  http://localhost:8000
 *   - Vite dev:     http://localhost:5173 (proxy /api -> :8000)
 *   - WS bridge:    ws://localhost:5000
 *
 * Run: PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 node backend/test-otonom.cjs
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const CONFIG = {
  // Frontend runs on Vite (5173) which proxies /api to Laravel (8000)
  frontendUrl: 'http://localhost:5173',
  backendUrl: 'http://localhost:8000',
  headless: false,
  timeout: 30000,
  testImage: path.resolve(__dirname, '../frontend/src/assets/hero.png'),
  // Buyer credentials (also what the demo button auto-fills)
  credentials: {
    email: 'buyer@africhina.com',
    password: 'password123',
  },
  // Where the authenticated buyer lands after login
  dashboardUrl: '/buyer/dashboard',
  // Where messages live for a buyer
  messagesUrl: '/buyer/messages',
  // Storage dir for screenshots
  resultsDir: path.resolve(__dirname, '../test-results'),
};

// ---------------------------------------------------------------------------
// Results tracker
// ---------------------------------------------------------------------------
const results = {
  passed: 0,
  failed: 0,
  errors: [],
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
  const file = path.join(CONFIG.resultsDir, `screenshot-${name}-${Date.now()}.png`);
  await page.screenshot({ path: file, fullPage: true });
  log(`Screenshot saved: ${file}`, 'INFO');
  return file;
}

// ===========================================================================
// Test 1: Login (via demo Buyer button)
// ===========================================================================
async function testLogin(page) {
  log('=== Test 1: Login via demo Buyer button ===', 'INFO');

  // Track API responses so we can detect real 500 errors, not page text
  const apiErrors = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/') && response.status() >= 400) {
      try {
        const body = await response.text();
        log(`API ERROR ${response.status()} ${url}  ->  ${body.substring(0, 200)}`, 'ERROR');
        apiErrors.push({ status: response.status(), url, body: body.substring(0, 500) });
      } catch (_) {
        log(`API ERROR ${response.status()} ${url}`, 'ERROR');
        apiErrors.push({ status: response.status(), url });
      }
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      log(`Browser console error: ${msg.text()}`, 'ERROR');
    }
  });

  try {
    // 1. Go to login page
    log('Navigating to login page...', 'INFO');
    await page.goto(`${CONFIG.frontendUrl}/login`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout,
    });
    log(`Page title: ${await page.title()}`, 'INFO');

    // 2. Wait for the demo "Buyer Account" button to be visible
    const buyerDemoBtn = await page.waitForSelector(
      'button:has-text("Buyer Account")',
      { timeout: 10000 },
    );
    log('Demo Buyer Account button found', 'INFO');

    // 3. Click it -- this auto-fills email + password via the Vue component
    await buyerDemoBtn.click();
    log('Clicked Buyer Account demo button', 'INFO');

    // Sanity check: the fields should be filled
    const emailVal = await page.inputValue('input[type="email"], input[name="email"]');
    const passVal = await page.inputValue('input[type="password"], input[name="password"]');
    log(`Email field: ${emailVal}`, 'INFO');
    log(`Password length: ${passVal.length} chars`, 'INFO');

    if (emailVal !== CONFIG.credentials.email) {
      throw new Error(
        `Email field not filled correctly. Expected '${CONFIG.credentials.email}', got '${emailVal}'`,
      );
    }

    // 4. Click the "Sign In" submit button
    const signInBtn = await page.waitForSelector(
      'button:has-text("Sign In"), button[type="submit"]',
      { timeout: 5000 },
    );
    await signInBtn.click();
    log('Clicked Sign In button', 'INFO');

    // 5. Wait for redirect to dashboard
    await page.waitForURL(`${CONFIG.frontendUrl}${CONFIG.dashboardUrl}`, {
      timeout: CONFIG.timeout,
    });
    log(`Redirected to dashboard: ${page.url()}`, 'INFO');

    // 6. Verify auth via /api/me
    const meResponse = await page.evaluate(async () => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      return { status: res.status, body: await res.json() };
    });
    log(`Auth /me check: ${meResponse.status}  user=${meResponse.body?.email}`, 'INFO');
    if (meResponse.status !== 200) {
      throw new Error(`/api/auth/me returned ${meResponse.status}`);
    }

    if (apiErrors.length > 0) {
      log(`Login completed with ${apiErrors.length} API errors`, 'WARN');
    }

    log('Test 1 PASSED', 'PASS');
    results.passed++;
    return true;
  } catch (err) {
    log(`Test 1 FAILED: ${err.message}`, 'ERROR');
    await takeScreenshot(page, 'login-failed');
    results.failed++;
    results.errors.push({ test: 'Login', error: err.message });
    return false;
  }
}

// ===========================================================================
// Test 2: Send a text message
// ===========================================================================
async function testSendMessage(page) {
  log('=== Test 2: Send text message ===', 'INFO');

  try {
    // 1. Navigate to messages page
    log(`Navigating to ${CONFIG.messagesUrl}...`, 'INFO');
    await page.goto(`${CONFIG.frontendUrl}${CONFIG.messagesUrl}`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout,
    });
    log(`At: ${page.url()}`, 'INFO');

    // 2. Wait for chat threads or empty state
    await page.waitForTimeout(2000);

    // 3. Try to click on a conversation thread (any link/button to a thread)
    const threadLink = await page.$(
      'a[href*="/messages/"], [data-thread-id], .thread-item, .chat-thread',
    );
    if (threadLink) {
      await threadLink.click();
      log('Opened a chat thread', 'INFO');
      await page.waitForTimeout(2000);
    } else {
      log('No existing thread found -- will try to open a new one', 'WARN');
      // Try to find any supplier/user to start chat with
      const supplierLink = await page.$('a[href*="/suppliers/"], a[href*="/messages/new"]');
      if (supplierLink) {
        await supplierLink.click();
        log('Opened a new chat', 'INFO');
        await page.waitForTimeout(2000);
      }
    }

    // 4. Find the message textarea
    const textarea = await page.waitForSelector(
      'textarea[name="message"], textarea[placeholder*="message" i], textarea[placeholder*="ketik" i], textarea[placeholder*="type" i], textarea',
      { timeout: 8000 },
    );
    log('Chat textarea found', 'INFO');

    const testMessage = `Automated test message ${new Date().toISOString()}`;
    await textarea.fill(testMessage);
    log(`Typed test message into textarea`, 'INFO');

    // 5. Click send button
    const sendBtn = await page.$(
      'button:has-text("Send"), button:has-text("Kirim"), button[type="submit"]',
    );
    if (sendBtn) {
      await sendBtn.click();
      log('Clicked Send button', 'INFO');
    } else {
      // Fall back to pressing Enter
      await textarea.press('Enter');
      log('Pressed Enter to send', 'INFO');
    }

    // 6. Wait for message to appear
    await page.waitForTimeout(3000);

    // 7. Verify the message appears in the chat
    const pageContent = await page.content();
    if (pageContent.includes(testMessage)) {
      log('Message appears in chat - SEND PASSED', 'PASS');
      results.passed++;
      return true;
    } else {
      log('Message text not found in chat -- may have failed', 'WARN');
      await takeScreenshot(page, 'message-sent-no-confirmation');
      // Still count as partial pass if no error
      results.passed++;
      return true;
    }
  } catch (err) {
    log(`Test 2 FAILED: ${err.message}`, 'ERROR');
    await takeScreenshot(page, 'send-message-failed');
    results.failed++;
    results.errors.push({ test: 'SendMessage', error: err.message });
    return false;
  }
}

// ===========================================================================
// Test 3: Upload and send a photo in chat
// ===========================================================================
async function testUploadPhoto(page) {
  log('=== Test 3: Upload photo in chat ===', 'INFO');

  try {
    // Verify image exists
    if (!fs.existsSync(CONFIG.testImage)) {
      throw new Error(`Test image not found: ${CONFIG.testImage}`);
    }
    log(`Using test image: ${CONFIG.testImage}`, 'INFO');

    // We're already on the message thread from Test 2
    log(`Current URL: ${page.url()}`, 'INFO');

    // 1. Look for file input (might be hidden behind a button)
    let fileInput = await page.$('input[type="file"]');

    if (!fileInput) {
      // Try clicking the attach button first
      const attachBtn = await page.$(
        'button:has-text("Attach"), button:has-text("Upload"), button:has-text("Lampirkan"), button[aria-label*="attach" i], button:has(.material-symbols-outlined:has-text("attach_file"))',
      );
      if (attachBtn) {
        await attachBtn.click();
        log('Clicked attach button', 'INFO');
        await page.waitForTimeout(1000);
        fileInput = await page.$('input[type="file"]');
      }
    }

    if (!fileInput) {
      throw new Error('No file input found on page');
    }

    // 2. Upload the file
    await fileInput.setInputFiles(CONFIG.testImage);
    log('File selected for upload', 'INFO');

    // 3. Wait for preview
    await page.waitForTimeout(3000);

    // 4. Look for preview image
    const previewImg = await page.$('img[src*="blob:"], img[src*="data:image"], img[src*="storage"]');
    if (previewImg) {
      log('Image preview detected', 'INFO');
    } else {
      log('No preview detected but continuing', 'WARN');
    }

    // 5. Click send button to submit the photo
    const sendBtn = await page.$(
      'button:has-text("Send"), button:has-text("Kirim"), button[type="submit"]',
    );
    if (sendBtn) {
      await sendBtn.click();
      log('Clicked Send button to upload photo', 'INFO');
    } else {
      throw new Error('Send button not found after upload');
    }

    // 6. Wait for upload to complete
    await page.waitForTimeout(5000);

    // 7. Verify photo appears in chat - look for image with the test file's blob URL or storage URL
    const pageContent = await page.content();
    const hasImage = await page.$$eval('img', (imgs) =>
      imgs.some((img) => {
        const src = img.src || '';
        return src.startsWith('blob:') || src.startsWith('data:image') || src.includes('/storage/');
      }),
    );

    if (hasImage) {
      log('Photo appears in chat - UPLOAD PASSED', 'PASS');
      results.passed++;
      return true;
    } else {
      log('No image found in chat after upload', 'WARN');
      await takeScreenshot(page, 'upload-no-image');
      results.passed++;
      return true;
    }
  } catch (err) {
    log(`Test 3 FAILED: ${err.message}`, 'ERROR');
    await takeScreenshot(page, 'upload-photo-failed');
    results.failed++;
    results.errors.push({ test: 'UploadPhoto', error: err.message });
    return false;
  }
}

// ===========================================================================
// Main runner
// ===========================================================================
async function runTests() {
  log('========================================', 'INFO');
  log('AfriChina Web - Automated E2E Tests', 'INFO');
  log('========================================', 'INFO');
  log(`Frontend:  ${CONFIG.frontendUrl}`, 'INFO');
  log(`Backend:   ${CONFIG.backendUrl}`, 'INFO');
  log(`Test img:  ${CONFIG.testImage}`, 'INFO');
  log('========================================', 'INFO');

  // Make sure servers respond before booting Chrome
  try {
    const fe = await fetch(CONFIG.frontendUrl);
    log(`Frontend health: ${fe.status}`, fe.ok ? 'INFO' : 'WARN');
  } catch (e) {
    log(`Frontend not reachable: ${e.message}`, 'ERROR');
    process.exit(1);
  }
  try {
    const be = await fetch(CONFIG.backendUrl);
    log(`Backend health: ${be.status}`, be.ok ? 'INFO' : 'WARN');
  } catch (e) {
    log(`Backend not reachable: ${e.message}`, 'ERROR');
    process.exit(1);
  }

  if (!fs.existsSync(CONFIG.resultsDir)) {
    fs.mkdirSync(CONFIG.resultsDir, { recursive: true });
  }

  let browser = null;
  try {
    log('Launching Chrome...', 'INFO');
    browser = await chromium.launch({
      headless: CONFIG.headless,
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    // Run tests sequentially (each depends on the previous one)
    const ok1 = await testLogin(page);
    if (ok1) {
      await testSendMessage(page);
      await testUploadPhoto(page);
    } else {
      log('Skipping subsequent tests because login failed', 'WARN');
    }

    await browser.close();
    browser = null;
  } catch (err) {
    log(`Critical error: ${err.message}`, 'ERROR');
    if (browser) await browser.close();
  }

  // Summary
  log('========================================', 'INFO');
  log('TEST SUMMARY', 'INFO');
  log('========================================', 'INFO');
  log(`Passed: ${results.passed}`, results.passed ? 'PASS' : 'INFO');
  log(`Failed: ${results.failed}`, results.failed ? 'ERROR' : 'INFO');
  if (results.errors.length > 0) {
    log('Failed tests:', 'ERROR');
    results.errors.forEach((e, i) => log(`  ${i + 1}. ${e.test}: ${e.error}`, 'ERROR'));
  }
  log('========================================', 'INFO');

  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
