import { test, expect } from '@playwright/test';

test.describe('AlmostNode Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have title', async ({ page }) => {
    const title = page.locator('h1');
    await expect(title).toHaveText('AlmostNode');
  });

  test('should execute code', async ({ page }) => {
    const codeInput = page.locator('#codeInput');
    const runButton = page.locator('button:has-text("Run Code")');
    const output = page.locator('#codeOutput');

    await codeInput.fill('console.log("Test");');
    await runButton.click();

    await expect(output).toContainText('Test');
  });

  test('should show file system demo', async ({ page }) => {
    const fsInput = page.locator('#fsInput');
    const runFsButton = page.locator('button:has-text("Run FS Demo")');
    const output = page.locator('#fsOutput');

    await fsInput.fill('console.log("FS test");');
    await runFsButton.click();

    await expect(output).toContainText('FS test');
  });

  test('should display features section', async ({ page }) => {
    const features = page.locator('.feature');
    await expect(features).toHaveCount(6);
  });
});
