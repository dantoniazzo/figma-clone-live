import Konva from 'konva';
import type { Position } from 'shared/model';
import { gridLineConfig } from '../model/grid.config';

export const GridLine = (position: Position, points: number[]) => {
  return new Konva.Line({
    ...position,
    points,
    ...gridLineConfig,
  });
};
