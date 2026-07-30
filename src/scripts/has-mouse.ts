/**
 * Detect a real mouse by observing input, not by asking the media query.
 *
 * `matchMedia('(pointer: fine)')` is unreliable in practice: a Windows laptop with a
 * touchscreen, or a remote-desktop session, reports `pointer: coarse` / `hover: none`
 * even when a mouse is plugged in. Gating pointer effects on it silently disables them
 * for those users. Watching for a real `pointerType === 'mouse'` event is the honest test.
 *
 * Callers get a promise-ish `onMouse(cb)` that fires once, immediately if a mouse has
 * already been seen.
 */
let seen = false;
const waiting: Array<() => void> = [];

function announce() {
  if (seen) return;
  seen = true;
  document.documentElement.classList.add('has-mouse');
  waiting.splice(0).forEach((cb) => cb());
  removeEventListener('pointermove', onPointer);
  removeEventListener('pointerdown', onPointer);
}

function onPointer(e: PointerEvent) {
  if (e.pointerType === 'mouse') announce();
}

if (typeof window !== 'undefined') {
  addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('pointerdown', onPointer, { passive: true });
}

/** Run `cb` as soon as a real mouse is observed (never, on a genuine touch device). */
export function onMouse(cb: () => void): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (seen) cb();
  else waiting.push(cb);
}
