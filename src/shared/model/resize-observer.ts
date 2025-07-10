export const observeResize = (el: Element, callback: () => void) => {
  const observer = new ResizeObserver(() => {
    callback();
  });
  observer.observe(el);
  return observer;
};
