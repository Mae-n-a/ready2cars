import { test, expect, type Page } from '@playwright/test';

const trigger = (page: Page) => page.getByRole('button', { name: 'Richiedi preventivo' });
const isModal = (page: Page) => page.evaluate(() => document.getElementById('sheet')!.matches(':modal'));

test('trigger opens the sheet as a real modal dialog', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#sheet')).toBeHidden();
  await trigger(page).click();
  await expect(page.locator('#sheet')).toBeVisible();
  expect(await isModal(page), 'dialog is open but not :modal').toBe(true);
});

test('Escape closes the sheet and returns focus to the trigger', async ({ page }) => {
  await page.goto('/');
  const btn = trigger(page);
  await btn.click();
  await expect(page.locator('#sheet')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#sheet')).toBeHidden();
  expect(await isModal(page)).toBe(false);
  await expect(btn).toBeFocused();
});

test('backdrop click closes the sheet and returns focus to the trigger', async ({ page }) => {
  await page.goto('/');
  const btn = trigger(page);
  await btn.click();
  await expect(page.locator('#sheet')).toBeVisible();
  await page.waitForTimeout(600); // let the open tween finish before clicking outside
  await page.mouse.click(5, 5);   // ::backdrop clicks retarget to the <dialog>
  await expect(page.locator('#sheet')).toBeHidden();
  await expect(btn).toBeFocused();
});

test('choosing Vendi shows only the vendi fieldset and disables the others', async ({ page }) => {
  await page.goto('/');
  await trigger(page).click();
  await page.locator('#sheet [data-intent="vendi"]').check();

  const state = await page.$$eval('#sheet .fset', (fs) =>
    fs.map((f) => ({
      k: (f as HTMLFieldSetElement).dataset.for,
      hidden: (f as HTMLFieldSetElement).hidden,
      disabled: (f as HTMLFieldSetElement).disabled,
    }))
  );
  expect(state).toEqual([
    { k: 'importa', hidden: true, disabled: true },
    { k: 'vendi', hidden: false, disabled: false },
    { k: 'commercia', hidden: true, disabled: true },
  ]);
  await expect(page.locator('#sheetTitle')).toHaveText('Vendi la tua auto');
});

test('empty submit flags exactly the visible required fields', async ({ page }) => {
  await page.goto('/');
  await trigger(page).click();
  await page.locator('#sheet [data-intent="vendi"]').check();
  await page.locator('#sheetSubmit').click();

  const flagged = await page.$$eval('#sheet .field[data-invalid]', (els) =>
    els.map((e) => e.querySelector('input,select,textarea')!.id)
  );
  expect(flagged.sort()).toEqual(['s-email', 's-nome', 'v-anno', 'v-auto', 'v-km']);
  // nothing inside a hidden fieldset may be flagged
  expect(await page.locator('#sheet [hidden] .field[data-invalid]').count()).toBe(0);
  await expect(page.locator('#sheet')).toBeVisible(); // submit was blocked, no mailto
});
