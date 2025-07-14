export const getBlockHtmlId = (id: string) => {
  return `block-html-${id}`;
};

export const getBlockHtmlElement = (id: string) => {
  return document.getElementById(getBlockHtmlId(id));
};
