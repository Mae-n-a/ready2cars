import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The hero copy fades in over ~1.1s (.hero-actions: fadeUp .7s, .4s delay). Scanning mid-fade
// makes axe measure the CTA at partial opacity and report a phantom colour-contrast failure
// (fg #f6e7e8 on bg #f5e4e5, ratio 1.02), so scan the settled page — which the site renders
// directly under prefers-reduced-motion (Hero.astro sets animation:none there).
// NB: must be page.emulateMedia(), not test.use({ reducedMotion }) — the latter silently fails
// to apply here (matchMedia stayed false), which is what made this scan flaky.
for (const path of ['/', '/privacy-policy/', '/cookie-policy/']) {
  test(`axe: no critical/serious violations on ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path, { waitUntil: 'load' });
    // belt and braces: if any animation is still mid-flight, axe would sample a blended pixel
    await page.locator('body').evaluate((el) =>
      Promise.all(el.getAnimations({ subtree: true }).filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished))
    );
    const { violations } = await new AxeBuilder({ page }).analyze();
    const bad = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    const report = violations
      .map((v) => `${v.impact}:${v.id} [${v.nodes.map((n) => n.target.join(' ')).join(' | ')}]`)
      .join(', ');
    console.log(`[axe ${path}] ${violations.length ? report : 'no violations'}`);
    expect(bad.map((v) => `${v.impact}:${v.id}`), `axe on ${path}: ${report}`).toEqual([]);
  });
}
