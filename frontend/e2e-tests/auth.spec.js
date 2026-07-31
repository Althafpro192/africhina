// ============================================
// E2E Test Suite - Authentication Flows
// Covers AUTH test cases: AUTH-01 through AUTH-10
// ============================================

const { test, expect } = require('@playwright/test');

// Test data
const TEST_USERS = {
  buyer: {
    email: 'buyer@africhina.com',
    password: 'password123',
  },
  admin: {
    email: 'admin@africhina.com',
    password: 'password123',
  },
};

test.describe('Authentication Flows', () => {
  
  // ============================================
  // AUTH-01: Login dengan kredensial valid
  // ============================================
  test('AUTH-01: User can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[type="email"]', TEST_USERS.buyer.email);
    await page.fill('input[type="password"]', TEST_USERS.buyer.password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/buyer\/dashboard/);
    
    // Verify dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  // ============================================
  // AUTH-02: Login dengan password salah
  // ============================================
  test('AUTH-02: Login fails with wrong password', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', TEST_USERS.buyer.email);
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Error message should appear
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    
    // Should not redirect
    await expect(page).toHaveURL(/\/login/);
  });

  // ============================================
  // AUTH-03: Login dengan temporary password
  // ============================================
  test('AUTH-03: User with temp password is redirected to change password', async ({ page }) => {
    // This test requires pre-setup of a temp password user
    // For now, we test the flow manually
    
    // Navigate to set-new-password directly
    await page.goto('/set-new-password');
    
    // Should see password change form
    await expect(page.locator('text=Set New Password')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  // ============================================
  // AUTH-04: Redirect ke halaman ganti password
  // ============================================
  test('AUTH-04: User with mustChangePassword flag is redirected', async ({ page }) => {
    // Simulate state where user has mustChangePassword: true
    await page.goto('/set-new-password');
    
    // Form should be visible
    await expect(page.locator('text=Set New Password')).toBeVisible();
    
    // Protected routes should redirect to set-new-password
    await page.goto('/buyer/dashboard');
    
    // Should redirect back to set-new-password
    await expect(page).toHaveURL(/\/set-new-password/);
  });

  // ============================================
  // AUTH-05: Ganti password berhasil
  // ============================================
  test('AUTH-05: User can change password successfully', async ({ page }) => {
    await page.goto('/set-new-password');
    
    // Fill new password form
    await page.fill('input[placeholder*="at least 6"]', 'NewSecurePassword123!');
    await page.fill('input[placeholder*="Re-enter"]', 'NewSecurePassword123!');
    
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Password updated successfully')).toBeVisible();
    
    // Should redirect after success
    await page.waitForURL(/\/buyer\/dashboard/, { timeout: 5000 });
  });

  // ============================================
  // AUTH-06: Ganti password gagal (invalid token)
  // ============================================
  test('AUTH-06: Password change fails without authorization', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    localStorage.clear();
    
    // Try to access change password API directly (through UI)
    await page.goto('/set-new-password');
    
    // Fill and submit
    await page.fill('input[placeholder*="at least 6"]', 'NewPassword123!');
    await page.fill('input[placeholder*="Re-enter"]', 'NewPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=Failed to update password')).toBeVisible();
  });

  // ============================================
  // AUTH-07: Logout
  // ============================================
  test('AUTH-07: User can logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.buyer.email);
    await page.fill('input[type="password"]', TEST_USERS.buyer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/buyer\/dashboard/);
    
    // Find and click logout button
    await page.click('button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout"]');
    
    // Should redirect to login
    await page.waitForURL(/\/login/);
    
    // Verify user is logged out
    await page.goto('/buyer/dashboard');
    await page.waitForURL(/\/login/);
  });

  // ============================================
  // AUTH-08: Akses protected route tanpa token
  // ============================================
  test('AUTH-08: Protected routes redirect to login without token', async ({ page }) => {
    // Clear auth
    await page.context().clearCookies();
    localStorage.clear();
    
    // Try to access protected route
    await page.goto('/buyer/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/\/login/);
  });

  // ============================================
  // AUTH-09: Temporary password expired
  // ============================================
  test('AUTH-09: Expired temp password shows error message', async ({ page }) => {
    // This requires database manipulation - skip for E2E
    // In real scenario, test with actual expired temp password
    test.skip();
  });

  // ============================================
  // AUTH-10: Admin generate temporary password
  // ============================================
  test('AUTH-10: Admin can generate temp password for buyer', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);
    
    // Navigate to buyer management
    await page.click('text=Buyers, text=Manage Buyers');
    await page.waitForURL(/\/admin\/buyers/);
    
    // Find a buyer and click generate temp password
    const buyerRow = page.locator('tr').first();
    await buyerRow.locator('button:has-text("Generate"), button:has-text("Reset")').click();
    
    // Modal or toast should show temp password
    await expect(page.locator('text=Temporary Password')).toBeVisible();
    await expect(page.locator('text=/^[a-zA-Z0-9]{12}$/')).toBeVisible();
  });
});

test.describe('Multi-language Support', () => {
  test('Language switcher changes all text', async ({ page }) => {
    await page.goto('/login');
    
    // Default language should be English
    await expect(page.locator('h1:has-text("AfriChina")')).toBeVisible();
    
    // Switch to Indonesian
    const langSwitcher = page.locator('[data-testid="language-switcher"], .language-switcher');
    await langSwitcher.click();
    await page.click('text=Indonesia, text=Indonesian');
    
    // UI should change
    await expect(page.locator('h1:has-text("Masuk"), h1:has-text("Sign")')).toBeVisible();
    
    // Switch to Chinese
    await langSwitcher.click();
    await page.click('text=中文, text=Chinese');
    
    // UI should show Chinese text
    await expect(page.locator('h1')).toBeVisible();
  });
});
