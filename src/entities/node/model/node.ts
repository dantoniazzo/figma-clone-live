import { config } from 'entities/block';
import { getLayer } from 'entities/layer';
import type { KonvaEvent, KonvaMouseTouchEvent } from 'entities/stage';
import { Group } from 'konva/lib/Group';
import { Rect } from 'konva/lib/shapes/Rect';

export const findNode = (stageId: string, id: string) => {
  const layer = getLayer(stageId);
  if (!layer) {
    return null;
  }

  const node = layer.findOne(`#${id}`);
  return node;
};

export const getNodeFromEvent = (
  id: string,
  e: KonvaMouseTouchEvent | KonvaEvent
) => {
  const stage = e.target.getStage();
  if (!stage) return null;
  return stage.findOne(`#${id}`) || null;
};

export const getAllNodes = (id: string) => {
  const layer = getLayer(id);
  if (!layer) return null;
  return layer?.find(`.${config.name}`);
};

export const getRectFromGroup = (node: Group) => {
  return node.findOne('Rect') as Rect;
};
