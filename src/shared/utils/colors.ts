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

export const generateColorFromId = (id: string) => {
  const hash = Array.from(id).reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const hue = (hash % 360).toString();
  return `hsl(${hue}, 70%, 50%)`;
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

export const isRgba = (color: string): boolean => {
  return /^rgba?\(\d{1,3}, \d{1,3}, \d{1,3}(?:, [0-1](?:\.\d+)?)?\)$/.test(
    color
  );
};
