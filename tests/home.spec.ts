import { test, expect } from '@playwright/test';

test('home renders one h1 with the hero headline and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/', { waitUntil: 'load' });

  const h1 = page.locator('h1');
  await expect(h1).toHaveCount(1);
  // whitespace-normalised: the words are wrapped in per-word spans for the reveal
  expect((await h1.innerText()).replace(/\s+/g, ' ').trim()).toBe("Importa l'auto dei tuoi sogni");
  expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([]);
});

test('slideshow: 4 slides, one visible, dots centred, autoplay advances', async ({ page }) => {
  await page.goto('/');
  // hover/focus pauses autoplay by design — keep the pointer off the slider
  await page.mouse.move(0, 0);

  const slider = page.locator('#whySlider');
  await expect(slider.locator('.wslide')).toHaveCount(4);
  await expect(slider.locator('.w-dot')).toHaveCount(4);
  await slider.scrollIntoViewIfNeeded();

  const opaque = () =>
    page.$$eval('#whySlider .wslide', (els) =>
      els.map((e) => Number(getComputedStyle(e).opacity)).filter((o) => o > 0.5).length
    );
  await expect.poll(opaque).toBe(1);

  // dots centred inside their gradient bar
  const bar = await slider.locator('.w-ui').boundingBox();
  const dots = await slider.locator('.w-ui > div').boundingBox();
  expect(bar && dots).toBeTruthy();
  const off = Math.abs(bar!.x + bar!.width / 2 - (dots!.x + dots!.width / 2));
  expect(off, `dot strip is off-centre by ${off}px`).toBeLessThanOrEqual(1);

  // autoplay: interval is 5000ms
  const index = () => page.$$eval('#whySlider .wslide', (els) => els.findIndex((e) => e.classList.contains('on')));
  const first = await index();
  expect(first).toBe(0);
  await expect.poll(index, { timeout: 6500, intervals: [250] }).not.toBe(first);
  await expect.poll(opaque).toBe(1);
});

test('scrollspy marks "Perché noi" active at #perche', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.getElementById('perche')!.scrollIntoView());
  const link = page.locator('.nav-links a[href="/#perche"]');
  await expect(link).toHaveClass(/is-active/, { timeout: 3000 });
  await expect(page.locator('.nav-links a.is-active')).toHaveCount(1);
});
