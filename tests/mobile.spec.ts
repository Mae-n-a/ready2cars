import { test, expect } from '@playwright/test';

// desktop project skips this file entirely (see testIgnore in playwright.config.ts)
test.describe('mobile 390x844', () => {
  test('hamburger opens the nav panel', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('#navPanel');
    const toggle = page.locator('#navToggle');
    await expect(toggle).toBeVisible();
    await expect(panel).toBeHidden();
    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('the sheet opens anchored to the bottom of the viewport', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Richiedi preventivo' }).click();
    await expect(page.locator('#sheet')).toBeVisible();
    await page.waitForTimeout(700); // slide-up tween

    const box = (await page.locator('#sheet').boundingBox())!;
    const vp = page.viewportSize()!;
    expect(Math.round(box.x)).toBe(0);
    expect(Math.round(box.width)).toBe(vp.width);
    expect(Math.abs(box.y + box.height - vp.height), 'sheet is not flush with the viewport bottom').toBeLessThanOrEqual(1);
    expect(box.y, 'sheet fills the whole screen, not a bottom sheet').toBeGreaterThan(0);
  });
});
