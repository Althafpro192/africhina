/**
 * Playwright Test: Upload Image (screenshot1.png)
 * Tests the image upload feature with a real PNG file
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const API_BASE = process.env.API_URL || 'http://localhost:8000';
const TEST_IMAGE = '/tmp/screenshot1.png';

async function runTest() {
    console.log('='.repeat(60));
    console.log('  Playwright Test: Upload Image');
    console.log('='.repeat(60));
    console.log(`\nTest Image: ${TEST_IMAGE}`);
    console.log(`API Base: ${API_BASE}`);

    // Check if test image exists
    if (!fs.existsSync(TEST_IMAGE)) {
        console.error('❌ Test image not found!');
        process.exit(1);
    }

    const stats = fs.statSync(TEST_IMAGE);
    console.log(`Image Size: ${(stats.size / 1024).toFixed(2)} KB`);

    const browser = await chromium.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();

        // Go to login page
        console.log('\n[1/4] Opening login page...');
        await page.goto(`${API_BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.screenshot({ path: 'test-results/01-login-page.png' });
        console.log('   ✅ Login page loaded');

        // Login
        console.log('\n[2/4] Logging in...');
        await page.fill('input[type="email"]', 'admin@africhina.com');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/02-after-login.png' });
        console.log('   ✅ Login attempted');

        // Go to Settings page (for avatar upload)
        console.log('\n[3/4] Navigating to Settings...');
        await page.goto(`${API_BASE}/buyer/settings`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/03-settings-page.png' });
        console.log('   ✅ Settings page loaded');

        // Upload avatar
        console.log('\n[4/4] Uploading avatar...');
        const avatarInput = await page.$('input[type="file"]');
        if (avatarInput) {
            await avatarInput.setInputFiles(TEST_IMAGE);
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'test-results/04-after-upload.png' });
            console.log('   ✅ Avatar upload attempted');
        } else {
            console.log('   ⚠️ Avatar input not found on page');
        }

        // Check if avatar is displayed
        console.log('\n[5/5] Verifying avatar display...');
        await page.waitForTimeout(1000);
        const avatarImg = await page.$('img[alt="Profile"]');
        if (avatarImg) {
            const src = await avatarImg.getAttribute('src');
            if (src && src.startsWith('data:image')) {
                console.log('   ✅ Avatar displayed as base64 data URL');
            } else {
                console.log(`   ⚠️ Avatar src: ${src?.substring(0, 50)}...`);
            }
        } else {
            console.log('   ⚠️ Avatar image element not found');
        }

        console.log('\n' + '='.repeat(60));
        console.log('Test Complete! Screenshots saved to test-results/');
        console.log('='.repeat(60));

        await page.waitForTimeout(2000);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

runTest().catch(console.error);
