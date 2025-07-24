import { type LineCap } from "konva/lib/Shape";
import { getColor } from "shared";

export const LineConfig = {
  tension: 0.5,
  bezier: true,
  lineCap: "round" as LineCap,
  stroke: getColor("--color-gray-300"),
  strokeWidth: 1,
  hitStrokeWidth: 20,
};
