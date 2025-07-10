import { type Points } from "./line.types";

export const formatPoints = (points: Points) => {
  return points.flatMap((p) => [p.x, p.y]);
};
