/**
 * Image Upload Test - Verify screenshot3.png displays correctly
 * Run: PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 node backend/test-upload-image.cjs
 */

const { chromium } = require('playwright');
const path = require('path');

const CONFIG = {
    headless: false,
    executablePath: '/usr/bin/google-chrome',
    slowMo: 500,
    timeout: 60000
};

const BASE_URL = 'http://localhost:5173';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testImageUpload() {
    console.log('🧪 Testing Image Upload with screenshot3.png\n');

    const browser = await chromium.launch(CONFIG);
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Step 1: Login as buyer
        console.log('📍 Step 1: Login as buyer');
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', 'buyer@africhina.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard**', { timeout: 15000 });
        console.log('✅ Logged in');

        // Step 2: Go to Settings
        console.log('\n📍 Step 2: Go to Settings page');
        await page.goto(`${BASE_URL}/buyer/settings`);
        await page.waitForLoadState('networkidle');
        await sleep(2000);
        console.log('✅ On Settings page');

        // Step 3: Look for avatar upload section
        console.log('\n📍 Step 3: Find avatar upload element');

        // Try various selectors for avatar upload
        const selectors = [
            'input[type="file"]',
            'input[accept*="image"]',
            '[class*="avatar"] input',
            '[class*="upload"] input',
            'input[name*="avatar"]',
            'input[name*="photo"]'
        ];

        let fileInput = null;
        for (const selector of selectors) {
            const count = await page.locator(selector).count();
            if (count > 0) {
                fileInput = page.locator(selector).first();
                console.log(`✅ Found file input with selector: ${selector}`);
                break;
            }
        }

        if (!fileInput) {
            console.log('❌ No file input found');

            // Take screenshot to see what the page looks like
            await page.screenshot({ path: './test-results/settings-page.png', fullPage: true });
            console.log('📸 Screenshot saved to test-results/settings-page.png');

            // Check page content
            const content = await page.textContent('body');
            console.log('\nPage contains avatar-related text:', content.includes('avatar') || content.includes('photo') || content.includes('profile'));

            await browser.close();
            return false;
        }

        // Step 4: Upload the image
        console.log('\n📍 Step 4: Upload screenshot3.png');
        const imagePath = path.resolve('./screenshot3.png');
        await fileInput.setInputFiles(imagePath);
        console.log(`✅ File selected: ${imagePath}`);

        // Wait for upload to process
        await sleep(3000);

        // Step 5: Check if image is displayed
        console.log('\n📍 Step 5: Verify image displays');

        // Look for img tags with the uploaded image
        const images = await page.locator('img').count();
        console.log(`Found ${images} images on page`);

        // Check if any img has a data URL (base64) or uploaded URL
        const imgSrcs = await page.locator('img').evaluateAll(imgs =>
            imgs.map(img => ({ src: img.src.substring(0, 100), alt: img.alt }))
        );
        console.log('\nImages found:');
        imgSrcs.forEach((img, i) => {
            console.log(`  ${i + 1}. ${img.src}... (alt: ${img.alt || 'none'})`);
        });

        // Take final screenshot
        await page.screenshot({ path: './test-results/upload-result.png', fullPage: true });
        console.log('\n📸 Screenshot saved to test-results/upload-result.png');

        // Check for success/error messages
        const bodyText = await page.textContent('body');
        const hasSuccess = bodyText.toLowerCase().includes('success') || bodyText.toLowerCase().includes('updated') || bodyText.toLowerCase().includes('terupload');
        const hasError = bodyText.toLowerCase().includes('error') || bodyText.toLowerCase().includes('failed');

        console.log('\n📊 Results:');
        console.log(`  - Success message found: ${hasSuccess}`);
        console.log(`  - Error message found: ${hasError}`);
        console.log(`  - Total images on page: ${images}`);

        const success = images > 0 && !hasError;
        console.log(`\n${success ? '✅ TEST PASSED' : '❌ TEST FAILED'}`);

        return success;

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        await page.screenshot({ path: './test-results/upload-error.png', fullPage: true });
        console.log('📸 Error screenshot saved');
        return false;
    } finally {
        await browser.close();
    }
}

testImageUpload()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
