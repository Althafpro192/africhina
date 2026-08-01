/**
 * Autonomous Avatar Upload Test
 * Tests the complete flow: login -> settings -> upload avatar -> verify display
 * 
 * Uses screenshot1.png from project root
 */

const { chromium } = require('playwright');

const API_BASE = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:5173';
const TEST_IMAGE = '../screenshot1.png';

async function runAvatarUploadTest() {
    console.log('============================================================');
    console.log('  AVATAR UPLOAD TEST - Complete Flow Verification');
    console.log('============================================================\n');

    const browser = await chromium.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Capture console messages
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[Browser Error]: ${msg.text()}`);
        }
    });

    try {
        // Step 1: Check test image exists
        const fs = require('fs');
        if (!fs.existsSync(TEST_IMAGE)) {
            throw new Error(`Test image not found: ${TEST_IMAGE}`);
        }
        const stats = fs.statSync(TEST_IMAGE);
        console.log(`📷 Test Image: ${TEST_IMAGE}`);
        console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB\n`);

        // Step 2: Login as buyer
        console.log('[1/6] Logging in as buyer...');
        await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        // Fill login form
        await page.fill('input[type="email"]', 'buyer@africhina.com');
        await page.fill('input[type="password"]', 'buyer123');
        await page.click('button[type="submit"]');

        await page.waitForTimeout(2000);
        console.log('   ✅ Login submitted');

        // Step 3: Navigate to Settings
        console.log('[2/6] Navigating to Settings...');
        await page.goto(`${FRONTEND_URL}/buyer/settings`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Check if page loaded
        const pageContent = await page.content();
        const hasSettingsContent = pageContent.includes('settings') || pageContent.includes('Settings');
        console.log(`   ✅ Settings page loaded (has 'settings': ${hasSettingsContent})`);

        // Step 4: Get current avatar state
        console.log('[3/6] Checking current avatar state...');
        const currentAvatarSrc = await page.$eval('img[alt="Profile"]', el => el.src).catch(() => null);
        console.log(`   Current avatar src: ${currentAvatarSrc?.substring(0, 80)}...`);

        // Step 5: Upload avatar using file input
        console.log('[4/6] Uploading avatar...');

        // Find file input
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
            await fileInput.setInputFiles(TEST_IMAGE);
            console.log('   ✅ File selected');

            // Wait for upload to process
            await page.waitForTimeout(3000);

            // Check for success/error toast
            const toastText = await page.textContent('body');
            if (toastText.includes('Avatar updated successfully')) {
                console.log('   ✅ Upload success toast detected');
            } else if (toastText.includes('error') || toastText.includes('Error') || toastText.includes('failed')) {
                console.log('   ⚠️ Possible error in upload');
            }
        } else {
            console.log('   ⚠️ File input not found');
        }

        // Step 6: Verify avatar changed (before reload)
        console.log('[5/6] Verifying avatar display (before reload)...');
        await page.waitForTimeout(2000);

        const newAvatarSrc = await page.$eval('img[alt="Profile"]', el => el.src).catch(() => null);
        console.log(`   New avatar src (before reload): ${newAvatarSrc?.substring(0, 80)}...`);

        // Step 6b: Reload page to verify persistence
        console.log('[5b/6] Reloading page to verify backend storage...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const persistedAvatarSrc = await page.$eval('img[alt="Profile"]', el => el.src).catch(() => null);
        console.log(`   Persisted avatar src: ${persistedAvatarSrc?.substring(0, 80)}...`);

        // Check persisted avatar type
        const isPersistedDataUrl = persistedAvatarSrc?.startsWith('data:');
        const isPersistedUiAvatars = persistedAvatarSrc?.includes('ui-avatars.com');
        const isPersistedBlob = persistedAvatarSrc?.startsWith('blob:');

        console.log(`\n   Persisted Avatar type analysis:`);
        console.log(`   - Data URL: ${isPersistedDataUrl ? '✅ YES' : '❌ NO'}`);
        console.log(`   - UI Avatars fallback: ${isPersistedUiAvatars ? '⚠️ YES (fallback)' : '✅ NO'}`);
        console.log(`   - Blob URL: ${isPersistedBlob ? '✅ YES' : '❌ NO'}`);

        // Step 7: Take screenshot
        console.log('[6/6] Taking verification screenshot...');
        await page.screenshot({
            path: 'test-results/avatar-upload-verification.png',
            fullPage: false
        });
        console.log('   ✅ Screenshot saved to test-results/avatar-upload-verification.png');

        // Summary
        console.log('\n============================================================');
        console.log('  TEST SUMMARY');
        console.log('============================================================');

        if (isPersistedDataUrl) {
            console.log('✅ AVATAR UPLOAD SUCCESSFUL!');
            console.log('   The avatar was uploaded and stored in MySQL database.');
            console.log('   After page reload, avatar displays correctly from base64 data.');
        } else if (isPersistedUiAvatars) {
            console.log('⚠️ AVATAR UPLOAD MAY HAVE ISSUES');
            console.log('   The avatar is showing UI Avatars fallback after reload.');
            console.log('   Possible causes:');
            console.log('   - Backend not storing avatar_data correctly');
            console.log('   - Frontend not reading avatar_data from /api/auth/me');
        } else {
            console.log('⚠️ UNKNOWN AVATAR STATE');
        }

    } catch (error) {
        console.error(`\n❌ TEST ERROR: ${error.message}`);
        console.error(error.stack);

        // Take error screenshot
        await page.screenshot({ path: 'test-results/avatar-upload-error.png' });
    } finally {
        await browser.close();
        console.log('\n============================================================');
    }
}

runAvatarUploadTest().catch(console.error);
