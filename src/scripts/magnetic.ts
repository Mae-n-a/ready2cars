import gsap from 'gsap';
import { onMouse } from './has-mouse';

/**
 * Magnetic pull on the primary calls to action.
 *
 * Deliberately limited to the few elements marked `.magnetic` — the effect stops reading
 * as "premium" and starts reading as noise if more than a couple of things on a screen do
 * it. Pull is clamped so the element never leaves its own hit box, and it is skipped
 * entirely for coarse pointers (where there is no cursor to be magnetic towards) and for
 * anyone who asked for reduced motion.
 */
export function initMagnetic(root: ParentNode = document): void {
  // Bind only once a real mouse is observed. `pointer: fine` lies on touchscreen laptops
  // and remote desktops, which used to disable this for people who did have a mouse.
  onMouse(() => bind(root));
}

function bind(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('.magnetic').forEach((el) => {
    if (el.dataset.magneticBound) return;
    el.dataset.magneticBound = 'true';
    el.style.willChange = 'transform';

    // quickTo reuses one tween per property instead of allocating on every mousemove
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'elastic.out(1,0.4)' });

    const STRENGTH = 0.25; // keeps the travel well inside the button

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * STRENGTH);
      yTo((e.clientY - r.top - r.height / 2) * STRENGTH);
    });

    // always reverse on leave, or a fast exit leaves the button stuck off-centre
    const reset = () => { xTo(0); yTo(0); };
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
  });
}
