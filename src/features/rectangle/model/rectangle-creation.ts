import Konva from 'konva';
import { type Position } from 'shared/model';
import { type RectConfig } from 'konva/lib/shapes/Rect';
import { getLayer } from 'entities/layer';
import { DRAWN_RECTANGLE_ID, RECTANGLE_NAME } from '../lib';
import { basicRectangleConfig } from './rectangle.config';
import { selectNode, unSelectAllNodes } from 'features/selection';
import { snapToGrid } from 'features/grid';
import { createBlock } from 'features/block-mutation';

export const getDrawnRectangleBox = (stageId: string, id?: string) => {
  const layer = getLayer(stageId);
  return layer?.findOne(`#${id || DRAWN_RECTANGLE_ID}`);
};

export const createRectangle = (stageId: string, config: RectConfig) => {
  const rect = new Konva.Rect({
    ...basicRectangleConfig,
    ...config,
    draggable: true,
    id: config.id || DRAWN_RECTANGLE_ID,
    name: RECTANGLE_NAME,
  });
  if (!config.width && !config.height) {
    // Store the initial position as custom attribute
    rect.setAttr('start-position', config.position);
  }
  // We're using pointerup to handle touch events as well
  rect.on('pointerup', () => {
    selectNode(stageId, rect);
  });
  const layer = getLayer(stageId);
  layer?.add(rect);
};

export const updateRectangle = (
  stageId: string,
  position: Position,
  id?: string
) => {
  const rect = getDrawnRectangleBox(stageId, id || DRAWN_RECTANGLE_ID);
  if (!rect) return;
  // Get the original starting position
  const startPosition = rect.getAttr('start-position') as Position;
  // Calculate width, height, and new position
  let newX = startPosition.x;
  let newY = startPosition.y;
  const width = Math.abs(snapToGrid(position.x) - startPosition.x);
  const height = Math.abs(snapToGrid(position.y) - startPosition.y);

  // Adjust position if mouse is moved left or upward
  if (position.x < startPosition.x) {
    newX = snapToGrid(position.x);
  }

  if (position.y < startPosition.y) {
    newY = snapToGrid(position.y);
  }

  // Update the bounding box
  rect.position({
    x: newX,
    y: newY,
  });

  rect.size({
    width,
    height,
  });
};

export const finishDrawingRectangle = (stageId: string, id?: string) => {
  const rect = getDrawnRectangleBox(stageId, id || DRAWN_RECTANGLE_ID);
  if (!rect) return;
  createBlock(stageId, {
    rect: {
      x: rect.x(),
      y: rect.y(),
      width: rect.width(),
      height: rect.height(),
    },
  });
  unSelectAllNodes(stageId);
  rect.remove();
};
