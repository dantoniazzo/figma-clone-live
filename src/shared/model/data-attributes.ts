export const constructDataAttribute = (attr: string) => {
  return `data-${attr}`;
};

export const getDataAttribute = (element: HTMLElement, attr: string) => {
  return element.getAttribute(constructDataAttribute(attr));
};

export const setDataAttribute = (
  element: HTMLElement,
  attr: string,
  value: string
) => {
  element.setAttribute(constructDataAttribute(attr), value);
};

export const removeDataAttribute = (element: HTMLElement, attr: string) => {
  element.removeAttribute(constructDataAttribute(attr));
};

export const observeMutation = (
  el: Element,
  callback: (mutationList: MutationRecord[], observer: MutationObserver) => void
) => {
  const observer = new MutationObserver(callback);
  observer.observe(el, { attributes: true, attributeOldValue: true });
  return observer;
};

export const observeAttribute = (
  el: Element,
  attr: string,
  callback: (oldValue: string | null) => void
) => {
  return observeMutation(el, (mutationList) => {
    mutationList.forEach((mutation) => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === constructDataAttribute(attr)
      ) {
        callback(mutation.oldValue);
      }
    });
  });
};
