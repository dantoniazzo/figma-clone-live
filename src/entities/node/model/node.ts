import { getLayer } from 'entities/layer';
import type { KonvaEvent, KonvaMouseTouchEvent } from 'entities/stage';
import { LINE_ANCHOR_NAME, LINE_GROUP_NAME } from 'features/line';
import { RECTANGLE_NAME } from 'features/rectangle';
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

  const rectNodes = layer.find(`.${RECTANGLE_NAME}`);
  const lineNodes = layer.find(`.${LINE_GROUP_NAME}`);
  const lineAnchors = layer.find(`.${LINE_ANCHOR_NAME}`);
  return rectNodes.concat(lineNodes).concat(lineAnchors);
};

export const getRectFromGroup = (node: Group) => {
  return node.findOne('Rect') as Rect;
};
