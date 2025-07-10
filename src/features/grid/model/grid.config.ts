import { getColor } from "shared";
import { DASH, STROKE_WIDTH } from "../lib";
import type { LineCap, LineJoin } from "konva/lib/Shape";

export const gridLineConfig = {
  stroke: getColor("--color-background-300"),
  strokeWidth: STROKE_WIDTH,
  dash: DASH,
  lineCap: "round" as LineCap,
  lineJoin: "round" as LineJoin,
};
