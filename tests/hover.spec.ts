import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Hover regression tests.
 *
 * These exist because of a real bug: Tailwind v4 compiles `hover:` to
 * `@media (hover: hover)`, and a Windows laptop with a touchscreen (or a remote-desktop
 * session) reports `hover: none` / `pointer: coarse` even with a mouse attached — which
 * silently disabled every hover style on the site. The `hasTouch` project below reproduces
 * exactly that environment, so the regression cannot come back unnoticed.
 */

/**
 * Read one computed property before and after hovering.
 *
 * Note `scale`, not `transform`: Tailwind v4 compiles `scale-*` to the standalone `scale`
 * CSS property, so a scale hover leaves `transform` as `none` and asserting on transform
 * gives a false failure.
 *
 * Always parks the mouse off-target first — otherwise a second call in the same test reads
 * its "before" value while the element is still hovered from the previous one.
 */
async function hoverDelta(page: Page, target: Locator, prop: string, hoverOn?: Locator) {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(350);
  const read = () => target.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
  const before = await read();
  await (hoverOn ?? target).hover();
  await page.waitForTimeout(500); // let the transition land
  const after = await read();
  await page.mouse.move(0, 0);
  return { before, after };
}

test.describe('hover effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // hovers are cosmetic; make sure animation-gated content has settled first
    await page.waitForLoadState('load');
  });

  test('service card lifts its shadow and tints its border', async ({ page }) => {
    const card = page.locator('.service-card').first();
    await card.scrollIntoViewIfNeeded();
    const shadow = await hoverDelta(page, card, 'box-shadow');
    const border = await hoverDelta(page, card, 'border-top-color');
    expect(shadow.after, 'box-shadow should change on hover').not.toBe(shadow.before);
    expect(border.after, 'border colour should change on hover').not.toBe(border.before);
  });

  test('service card photo zooms', async ({ page }) => {
    const card = page.locator('.service-card').first();
    await card.scrollIntoViewIfNeeded();
    const img = card.locator('img').first();
    const s = await hoverDelta(page, img, 'scale', card); // hover the card, measure the image
    expect(s.after, 'image should scale while the card is hovered').not.toBe(s.before);
  });

  test('flow step number swells', async ({ page }) => {
    const step = page.locator('[data-flow-num]').first();
    await step.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500); // entrance timeline finishes first
    const s = await hoverDelta(page, step, 'scale');
    expect(s.after, 'node should scale on hover').not.toBe(s.before);
  });

  test('included icon chip lifts and brightens', async ({ page }) => {
    const chip = page.locator('#incluso .group\\/inc').first();
    await chip.scrollIntoViewIfNeeded();
    const icon = chip.locator('span').first();
    const before = await icon.evaluate((el) => getComputedStyle(el).backgroundColor);
    await chip.hover();
    await page.waitForTimeout(450);
    const after = await icon.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(after, 'chip background should brighten on hover').not.toBe(before);
  });

  test('each social link hovers to its own brand colour', async ({ page }) => {
    const links = page.locator('footer a[aria-label*="Ready2Cars su"], footer a[aria-label*="WhatsApp"]');
    const count = await links.count();
    expect(count, 'expected 5 social links').toBe(5);

    const seen: string[] = [];
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      await link.scrollIntoViewIfNeeded();
      const before = await link.evaluate((el) => getComputedStyle(el).backgroundColor);
      await link.hover();
      await page.waitForTimeout(400);
      const after = await link.evaluate((el) => {
        const s = getComputedStyle(el);
        return s.backgroundImage !== 'none' ? s.backgroundImage : s.backgroundColor;
      });
      expect(after, `social ${i} should change background on hover`).not.toBe(before);
      seen.push(after);
      await page.mouse.move(0, 0);
    }
    // brand colours must differ from each other, not all fall back to the accent red
    expect(new Set(seen).size, 'each social should use a distinct brand colour').toBe(count);
  });

  test('nav link and contact row respond to hover', async ({ page }) => {
    // below the `nav` breakpoint (900px) the links live behind the hamburger, so there is
    // nothing to hover — the mobile menu has its own test in mobile.spec.ts
    const wide = (page.viewportSize()?.width ?? 0) >= 900;
    if (wide) {
      const navLink = page.locator('header nav a').first();
      const nav = await hoverDelta(page, navLink, 'background-color');
      expect(nav.after).not.toBe(nav.before);
    }

    // the contact rows are the .group anchors; #contatti a also matches the "Scaricala qui"
    // text link, which only changes colour
    const row = page.locator('#contatti a.group').first();
    await row.scrollIntoViewIfNeeded();
    const bg = await hoverDelta(page, row, 'background-color');
    expect(bg.after).not.toBe(bg.before);
  });

  test('buttons have a press state', async ({ page }) => {
    const btn = page.locator('.btn').first();
    const before = await btn.evaluate((el) => getComputedStyle(el).transform);
    await btn.hover();
    await page.mouse.down();
    await page.waitForTimeout(150);
    const pressed = await btn.evaluate((el) => getComputedStyle(el).transform);
    await page.mouse.up();
    expect(pressed, 'button should visibly compress while held').not.toBe(before);
  });
});

test.describe('touch-capable device still gets hover', () => {
  // Reproduces the reported environment: a device that advertises touch, where Chrome
  // reports hover:none / pointer:coarse. Hover must still work when a pointer hovers.
  test.use({ hasTouch: true, isMobile: false });

  test('hover styles are not gated behind (hover: hover)', async ({ page }) => {
    await page.goto('/');
    const caps = await page.evaluate(() => ({
      hover: matchMedia('(hover: hover)').matches,
      fine: matchMedia('(pointer: fine)').matches,
      touchPoints: navigator.maxTouchPoints,
    }));

    const card = page.locator('.service-card').first();
    await card.scrollIntoViewIfNeeded();
    const shadow = await hoverDelta(page, card, 'box-shadow');
    expect(
      shadow.after,
      `hover must work even when the browser reports ${JSON.stringify(caps)}`
    ).not.toBe(shadow.before);
  });
});
