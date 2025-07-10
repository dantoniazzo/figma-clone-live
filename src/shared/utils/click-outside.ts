const clickOutsideListeners = new WeakMap<
  HTMLElement,
  (e: PointerEvent) => void
>();

export const listenToClickOutside = (
  el: HTMLElement,
  callback: (e: MouseEvent | TouchEvent | PointerEvent) => void
) => {
  const fn = (e: MouseEvent | TouchEvent | PointerEvent) => {
    if (!el.contains(e.target as Node)) {
      callback(e);
    }
  };

  clickOutsideListeners.set(el, fn);
  document.addEventListener("pointerdown", fn);
};

export const removeClickOutsideListener = (el: HTMLElement) => {
  const fn = clickOutsideListeners.get(el);
  if (fn) {
    document.removeEventListener("pointerdown", fn);
    clickOutsideListeners.delete(el);
  }
};
