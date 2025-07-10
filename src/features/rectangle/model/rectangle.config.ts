import { getColor, hexToRgba } from "shared";

export const basicRectangleConfig = {
  fill: "white",
  shadowBlur: 17,
  cornerRadius: 6,
  strokeWidth: 1,
  stroke: "",
  selectedStroke: getColor("--color-primary-100"),
  selectedShadowColor: hexToRgba(getColor("--color-primary-100"), 0.5),
  shadowColor: hexToRgba("#000000", 0.1),
  shadowOffset: { x: 0, y: 7 },
};
