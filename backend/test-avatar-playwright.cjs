const { chromium } = require('playwright');

async function testAvatarUpload() {
  console.log('🧪 Testing Avatar Upload Flow...\n');
  
  const browser = await chromium.launch({
    headless: false,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  let passed = 0;
  let failed = 0;
  
  try {
    // 1. Go to login page
    console.log('📍 Step 1: Navigate to login page');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // 2. Login as buyer
    console.log('📍 Step 2: Login as buyer');
    await page.fill('input[type="email"]', 'buyer@africhina.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Check if redirected to dashboard
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    if (currentUrl.includes('dashboard')) {
      console.log('   ✅ Login successful');
      passed++;
    } else {
      console.log('   ❌ Login may have failed');
      failed++;
    }
    
    // 3. Navigate to Settings
    console.log('📍 Step 3: Navigate to Settings');
    await page.goto('http://localhost:5173/buyer/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take a screenshot to see what's there
    await page.screenshot({ path: 'test-results/settings-page-01.png', fullPage: true });
    console.log('   Screenshot saved');
    
    // 4. Find avatar section - look for file input directly
    console.log('📍 Step 4: Looking for avatar upload elements');
    
    // Try multiple selectors
    const fileInputs = await page.locator('input[type="file"]').all();
    console.log(`   Found ${fileInputs.length} file input(s)`);
    
    // Check for avatar-related buttons
    const allButtons = await page.locator('button').all();
    console.log(`   Found ${allButtons.length} buttons total`);
    
    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      const text = await allButtons[i].textContent();
      if (text && text.trim()) {
        console.log(`   Button ${i}: "${text.trim().substring(0, 50)}"`);
      }
    }
    
    // Look for specific avatar button by icon or text
    const avatarButtons = await page.locator('button').filter({ hasText: /avatar|photo|camera|upload|change/i }).all();
    console.log(`   Found ${avatarButtons.length} avatar-related buttons`);
    
    if (avatarButtons.length > 0) {
      console.log('   ✅ Avatar button found');
      passed++;
      
      // Click it
      await avatarButtons[0].click();
      await page.waitForTimeout(500);
      
      // Now try file input
      const fileInput = await page.locator('input[type="file"]').first();
      if (await fileInput.isVisible() || await fileInput.count() > 0) {
        console.log('   ✅ File input available');
        passed++;
        
        // Upload the screenshot3.png
        const filePath = '/home/althaf/project/cedric/program/africhina-web/screenshot3.png';
        await fileInput.setInputFiles(filePath);
        console.log('   ✅ File selected');
        passed++;
        
        // Wait for upload
        await page.waitForTimeout(3000);
        
        // Take screenshot after upload
        await page.screenshot({ path: 'test-results/settings-page-02-after-upload.png', fullPage: true });
        console.log('   Screenshot saved after upload');
        
        // Check if avatar image changed
        const avatarImg = await page.locator('img').first();
        if (await avatarImg.isVisible()) {
          const src = await avatarImg.getAttribute('src');
          console.log(`   Avatar src length: ${src?.length || 0}`);
          if (src && src.length > 100) {
            console.log('   ✅ Avatar appears to have data');
            passed++;
          }
        }
      }
    } else {
      // Try clicking on the avatar image itself
      const avatarImg = await page.locator('img').first();
      if (await avatarImg.isVisible()) {
        console.log('   Found avatar image, clicking on it...');
        await avatarImg.click();
        await page.waitForTimeout(500);
        
        const fileInput = await page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          const filePath = '/home/althaf/project/cedric/program/africhina-web/screenshot3.png';
          await fileInput.setInputFiles(filePath);
          console.log('   ✅ File uploaded via avatar click');
          passed++;
          
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'test-results/settings-page-03-after-upload.png', fullPage: true });
        }
      } else {
        console.log('   ❌ No avatar button or image found');
        failed++;
      }
    }
    
    // Final screenshot
    console.log('📍 Step 5: Taking final screenshot');
    await page.screenshot({ path: 'test-results/settings-final.png', fullPage: true });
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failed++;
  } finally {
    await browser.close();
  }
  
  // Summary
  console.log('\n========== TEST SUMMARY ==========');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  
  return failed === 0;
}

testAvatarUpload()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
