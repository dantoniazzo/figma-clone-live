export const getColor = (color: string): string => {
  const root = document.querySelector(':root');
  if (root) {
    const rs = getComputedStyle(root);
    return rs.getPropertyValue(color);
  } else return '';
};

export const hexToRgba = (hex: string, opacity?: number): string => {
  // Remove the hash at the start if it's there
  if (!hex) return '';
  hex = hex.replace(/^#/, '');

  // Parse the hex string
  let bigint: number;
  if (hex.length === 3) {
    bigint = parseInt(
      hex
        .split('')
        .map((hexChar) => hexChar + hexChar)
        .join(''),
      16
    );
  } else if (hex.length === 6) {
    bigint = parseInt(hex, 16);
  } else {
    return '';
  }

  return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${
    bigint & 255
  }, ${opacity || 1})`;
};

export const rgbaToHex = (rgba: string): string | undefined => {
  const match = rgba.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  return undefined;
};

export const generateColorFromId = (id: string) => {
  const hash = Array.from(id).reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const hue = (hash % 360).toString();
  return `hsl(${hue}, 70%, 50%)`;
};

export const getRgbFromRgba = (rgba: string): string | undefined => {
  const match = rgba.match(/rgba?\((\d+), (\d+), (\d+)(?:, [\d.]+)?\)/);
  if (match) {
    return `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
  }
  return undefined;
};

export const getAlphaFromRgba = (rgba: string): number | undefined => {
  const match = rgba.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
  if (match) {
    const alpha = match[4];
    return alpha ? parseFloat(alpha) : 1;
  }
};

export const getAlphaPercentageFromRgba = (
  rgba: string
): number | undefined => {
  const alpha = getAlphaFromRgba(rgba);
  return alpha !== undefined ? alpha * 100 : undefined;
};

export const isHex = (color: string): boolean => {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
};

export const isRgb = (color: string): boolean => {
  return /^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/.test(color);
};

export const isRgba = (color: string): boolean => {
  return /^rgba?\(\d{1,3}, \d{1,3}, \d{1,3}(?:, [0-1](?:\.\d+)?)?\)$/.test(
    color
  );
};

export const isRgbValues = (color: string): boolean => {
  // Matches 255, 255, 255
  return /^(\d{1,3},\s*){2}\d{1,3}$/.test(color);
};

export const rgbValuesToRgb = (rgbValues: string): string => {
  const values = rgbValues.split(',').map((v) => v.trim());
  if (values.length !== 3) {
    throw new Error('Invalid RGB values');
  }
  const r = parseInt(values[0], 10);
  const g = parseInt(values[1], 10);
  const b = parseInt(values[2], 10);
  return `rgb(${r}, ${g}, ${b})`;
};

export const convertRgbToRgba = (rgb: string, alpha: number): string => {
  const match = rgb.match(/rgb\((\d+), (\d+), (\d+)\)/);
  if (!match) {
    throw new Error('Invalid RGB format');
  }
  const r = match[1];
  const g = match[2];
  const b = match[3];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const detectAnyColorTypeAndConvertToHex = (
  color: string
): string | undefined => {
  if (isHex(color)) {
    return color;
  } else if (isRgb(color)) {
    const rgba = convertRgbToRgba(color, 1);
    return rgba;
  } else if (isRgba(color)) {
    return color;
  } else if (isRgbValues(color)) {
    const rgb = rgbValuesToRgb(color);
    return rgb;
  }
  return undefined;
};
