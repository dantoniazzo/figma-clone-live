import { useEffect } from 'react';

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
  document.addEventListener('pointerdown', fn);
};

export const removeClickOutsideListener = (el: HTMLElement) => {
  const fn = clickOutsideListeners.get(el);
  if (fn) {
    document.removeEventListener('pointerdown', fn);
    clickOutsideListeners.delete(el);
  }
};

export const useOnClickOutside = (
  ref: React.RefObject<Node>,
  handler?: (target: Node) => void
) => {
  useEffect(
    () => {
      const listener = (event: MouseEvent | TouchEvent) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target as Node)) {
          return;
        }

        if (handler) handler(event.target as Node);
      };

      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);

      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
};
