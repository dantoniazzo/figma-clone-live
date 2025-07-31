import type { IRect } from 'konva/lib/types';
import { type Points } from './line.types';

export const formatPoints = (points: Points) => {
  return points.flatMap((p) => [p.x, p.y]);
};

export const getLineRectFromPoints = (points: number[]): IRect => {
  const xCoords = points.filter((_, i) => i % 2 === 0);
  const yCoords = points.filter((_, i) => i % 2 === 1);
  return {
    x: Math.min(...xCoords),
    y: Math.min(...yCoords),
    width: Math.max(...xCoords) - Math.min(...xCoords),
    height: Math.max(...yCoords) - Math.min(...yCoords),
  };
};
