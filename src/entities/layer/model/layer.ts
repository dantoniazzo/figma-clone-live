import { getStage } from 'entities/stage';
import { Layer } from 'konva/lib/Layer';

export const getLayerId = (id: string) => `layer-element-${id}`;

export const getLayer = (id: string): Layer | undefined => {
  const stage = getStage(id);
  return stage ? stage.findOne(`#${getLayerId(id)}`) : undefined;
};
