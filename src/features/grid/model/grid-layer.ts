import { getStage } from 'entities/stage';
import { Layer } from 'konva/lib/Layer';

export const getGridLayerId = (id: string) => `grid-layer-${id}`;

export const getGridLayer = (id: string): Layer | undefined => {
  const stage = getStage(id);
  return stage ? stage.findOne(`#${getGridLayerId(id)}`) : undefined;
};
