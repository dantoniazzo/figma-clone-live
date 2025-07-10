import { getColor } from 'shared';
import { DASH, DASH_OFFSET, STROKE_WIDTH } from '../lib';
import type { LineCap, LineJoin } from 'konva/lib/Shape';

export const gridLineConfig = {
  stroke: getColor('--color-background-300'),
  strokeWidth: STROKE_WIDTH,
  dash: DASH,
  dashOffset: DASH_OFFSET,
  lineCap: 'round' as LineCap,
  lineJoin: 'round' as LineJoin,
};
