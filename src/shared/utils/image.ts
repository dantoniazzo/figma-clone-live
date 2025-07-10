import { renderToStaticMarkup } from 'react-dom/server';

export const getSvgStringFromJsx = (svgElement: React.ReactElement) =>
  encodeURIComponent(renderToStaticMarkup(svgElement));

export const getUrlFromSvgElement = (svgElement: React.ReactElement) => {
  return `data:image/svg+xml,${getSvgStringFromJsx(svgElement)}`;
};
