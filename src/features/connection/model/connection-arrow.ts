import { getLayer } from 'entities/layer';
import type { Arrow } from 'konva/lib/shapes/Arrow';

export const getConnectionId = (fromId: string, toId: string) => {
  return `connection-${fromId}-${toId}`;
};

export const findConnectionArrow = (
  stageId: string,
  from: string,
  to: string
) => {
  const layer = getLayer(stageId);
  if (layer) {
    const arrows = layer.find(`#${getConnectionId(from, to)}`) as
      | Arrow[]
      | undefined;
    return arrows?.[0];
  }
};
