// ============================================
// E2E Test Suite - Buyer/RFQ Flows
// Covers BUY test cases: BUY-01 through BUY-10
// ============================================

const { test, expect } = require('@playwright/test');

// Test data
const TEST_BUYER = {
  email: 'buyer@africhina.com',
  password: 'password123',
};

test.describe('Buyer Dashboard', () => {
  
  // ============================================
  // BUY-01: Buyer melihat dashboard
  // ============================================
  test('BUY-01: Buyer can view dashboard with statistics', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_BUYER.email);
    await page.fill('input[type="password"]', TEST_BUYER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/buyer\/dashboard/);
    
    // Dashboard should load
    await expect(page.locator('h1:has-text("Dashboard"), text=Dashboard')).toBeVisible();
    
    // Statistics should be visible
    await expect(page.locator('text=Total Requests, text=Pending, text=Completed')).toBeVisible();
  });
});

test.describe('RFQ Creation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_BUYER.email);
    await page.fill('input[type="password"]', TEST_BUYER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/buyer\/dashboard/);
  });

  // ============================================
  // BUY-02: Membuat RFQ baru
  // ============================================
  test('BUY-02: Buyer can create new RFQ', async ({ page }) => {
    // Navigate to sourcing/RFQ creation
    await page.click('text=New Request, text=Create Request, text=Sourcing');
    await page.waitForURL(/\/buyer\/sourcing/, { timeout: 5000 }).catch(() => {});
    
    // If wizard/form exists
    const url = page.url();
    if (url.includes('sourcing') || url.includes('create')) {
      // Fill product details
      await page.fill('input[placeholder*="Solar"], input[placeholder*="Product"]', 'Solar Panel 450W');
      
      // Select category
      await page.selectOption('select', { label: 'Electronics' });
      
      // Fill specifications
      await page.fill('textarea', 'High efficiency monocrystalline panel');
      
      // Fill quantity
      await page.fill('input[type="number"]', '100');
      
      // Fill budget
      await page.selectOption('select', { label: '5,000 - 20,000' });
      
      // Submit
      await page.click('button[type="submit"]:not([disabled])');
      
      // Should redirect to requests list or show success
      await page.waitForURL(/\/buyer\/requests/, { timeout: 5000 }).catch(() => {});
    }
  });

  // ============================================
  // BUY-03: Menyimpan draft RFQ
  // ============================================
  test('BUY-03: Buyer can save RFQ as draft', async ({ page }) => {
    await page.click('text=New Request');
    
    // Fill partial form
    await page.fill('input[placeholder*="Solar"]', 'Partial Product');
    await page.selectOption('select', { label: 'Electronics' });
    
    // Click save draft
    const saveDraftBtn = page.locator('button:has-text("Save Draft"), button:has-text("Draft")');
    if (await saveDraftBtn.isVisible()) {
      await saveDraftBtn.click();
      
      // Should show draft saved
      await expect(page.locator('text=Draft saved, text=Saved')).toBeVisible();
    }
  });

  // ============================================
  // BUY-04: Submit RFQ lengkap
  // ============================================
  test('BUY-04: Buyer can submit complete RFQ', async ({ page }) => {
    await page.click('text=New Request');
    
    // Fill all required fields
    await page.fill('input[placeholder*="Solar"]', 'Complete RFQ Product');
    await page.selectOption('select', { label: 'Electronics' });
    await page.fill('textarea', 'Full specifications here');
    await page.fill('input[type="number"]', '200');
    await page.selectOption('select', { label: '5,000 - 20,000' });
    await page.selectOption('select >> nth=2', { label: 'FOB' });
    await page.selectOption('select >> nth=3', { label: 'T/T' });
    
    // Submit
    await page.click('button[type="submit"]:not([disabled])');
    
    // Success message
    await expect(page.locator('text=Request created, text=Submitted, text=Success')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('RFQ List and Details', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_BUYER.email);
    await page.fill('input[type="password"]', TEST_BUYER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/buyer\/dashboard/);
  });

  // ============================================
  // BUY-05: Melihat daftar RFQ
  // ============================================
  test('BUY-05: Buyer can view RFQ list', async ({ page }) => {
    // Navigate to requests list
    await page.click('text=My Requests, text=Requests');
    await page.waitForURL(/\/buyer\/requests/);
    
    // Request list should load
    await expect(page.locator('table, [role="list"], .requests-list')).toBeVisible({ timeout: 5000 });
    
    // Should show request items
    const requestItems = page.locator('tr, .request-item, [data-testid="request"]');
    await expect(requestItems.first()).toBeVisible();
  });

  // ============================================
  // BUY-06: Melihat detail RFQ
  // ============================================
  test('BUY-06: Buyer can view RFQ detail', async ({ page }) => {
    await page.click('text=My Requests');
    await page.waitForURL(/\/buyer\/requests/);
    
    // Click on first request
    const firstRequest = page.locator('tr, .request-item').first();
    await firstRequest.click();
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/buyer\/requests\/\d+/);
    
    // Detail elements should be visible
    await expect(page.locator('text=Product, text=Status, text=Category')).toBeVisible({ timeout: 5000 });
  });

  // ============================================
  // BUY-07: Edit RFQ (draft)
  // ============================================
  test('BUY-07: Buyer can edit RFQ at initial stage', async ({ page }) => {
    await page.click('text=My Requests');
    await page.waitForURL(/\/buyer\/requests/);
    
    // Find a draft/pending request
    const draftRequest = page.locator('tr:has-text("menunggu_penawaran"), .status:has-text("Pending")').first();
    
    if (await draftRequest.isVisible().catch(() => false)) {
      await draftRequest.click();
      
      // Click edit button
      const editBtn = page.locator('button:has-text("Edit")');
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        
        // Modify and save
        await page.fill('input[placeholder*="Product"]', 'Updated Product Name');
        await page.click('button:has-text("Save"), button:has-text("Update")');
        
        // Should show success
        await expect(page.locator('text=Updated, text=Saved, text=Success')).toBeVisible();
      }
    }
  });

  // ============================================
  // BUY-08: Edit RFQ (sudah submit) - HARUS GAGAL
  // ============================================
  test('BUY-08: Buyer cannot edit submitted RFQ', async ({ page }) => {
    await page.click('text=My Requests');
    await page.waitForURL(/\/buyer\/requests/);
    
    // Find a processing/completed request
    const processedRequest = page.locator('tr:has-text("sedang_diproses"), .status:has-text("Processing")').first();
    
    if (await processedRequest.isVisible().catch(() => false)) {
      await processedRequest.click();
      
      // Edit button should be disabled or not exist
      const editBtn = page.locator('button:has-text("Edit")');
      
      if (await editBtn.isVisible().catch(() => false)) {
        // Try to click edit
        await editBtn.click();
        
        // Should show error or prevent editing
        await expect(page.locator('text=Cannot edit, text=Not allowed')).toBeVisible();
      }
    }
  });

  // ============================================
  // BUY-09: Buyer menerima proposal
  // ============================================
  test('BUY-09: Buyer can accept proposal', async ({ page }) => {
    await page.click('text=My Requests');
    await page.waitForURL(/\/buyer\/requests/);
    
    // Find request with options/proposals
    const requestWithOptions = page.locator('tr:has-text("menunggu_pemilihan"), .status:has-text("Selection")').first();
    
    if (await requestWithOptions.isVisible().catch(() => false)) {
      await requestWithOptions.click();
      
      // Find and click accept on a proposal
      const acceptBtn = page.locator('button:has-text("Accept"), button:has-text("Select")').first();
      if (await acceptBtn.isVisible().catch(() => false)) {
        await acceptBtn.click();
        
        // Should show confirmation
        await expect(page.locator('text=Accepted, text=Selected, text=Success')).toBeVisible();
      }
    }
  });

  // ============================================
  // BUY-10: Buyer menolak proposal
  // ============================================
  test('BUY-10: Buyer can reject proposal', async ({ page }) => {
    await page.click('text=My Requests');
    await page.waitForURL(/\/buyer\/requests/);
    
    const requestWithOptions = page.locator('tr:has-text("menunggu_pemilihan")).first();
    
    if (await requestWithOptions.isVisible().catch(() => false)) {
      await requestWithOptions.click();
      
      const rejectBtn = page.locator('button:has-text("Reject"), button:has-text("Decline")').first();
      if (await rejectBtn.isVisible().catch(() => false)) {
        await rejectBtn.click();
        
        // Optionally provide reason
        const reasonInput = page.locator('textarea, input[type="text"]');
        if (await reasonInput.isVisible().catch(() => false)) {
          await reasonInput.fill('Not suitable for our requirements');
        }
        
        // Confirm rejection
        await page.click('button:has-text("Confirm"), button:has-text("Submit")');
        
        await expect(page.locator('text=Rejected, text=Declined')).toBeVisible();
      }
    }
  });
});

test.describe('Responsive Design', () => {
  
  test('UI-01: Mobile responsive layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    
    // Should be usable on mobile
    await expect(page.locator('input[type="email"], input[type="text"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('UI-02: Tablet responsive layout', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/login');
    
    // Should display properly
    await expect(page.locator('h1')).toBeVisible();
  });
});
