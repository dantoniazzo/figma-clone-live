import { type Position } from 'shared/model';
import { getBlockNodes } from 'entities/block';
import { selectionBoxConfig } from './selection-box.config';
import { getStage } from 'entities/stage';
import { Node } from 'konva/lib/Node';
import {
  getDrawnRectangleBox,
  createRectangle,
  updateRectangle,
} from 'features/rectangle';
import { SELECTION_BOX_ID } from '../lib';
import { haveRectsIntersection } from 'shared';
import { selectNodes } from './transformer-selection';

export const getSelectionBox = (stageId: string) => {
  return getDrawnRectangleBox(stageId, SELECTION_BOX_ID);
};

export const createSelectionBox = (stageId: string, position: Position) => {
  createRectangle(stageId, {
    id: SELECTION_BOX_ID,
    position,
    ...selectionBoxConfig,
  });
};

export const updateSelectionBox = (stageId: string, position: Position) => {
  updateRectangle(stageId, position, SELECTION_BOX_ID);
};

export const getAllSelectionBoxes = (stageId: string) => {
  return getStage(stageId)?.find(`#${SELECTION_BOX_ID}`);
};

export const removeSelectionBoxes = (stageId: string) => {
  const selectionBoxes = getAllSelectionBoxes(stageId);
  selectionBoxes?.forEach((box: Node) => {
    box.destroy();
  });
};

export const getNodesIntersectingWithBoundingBox = (stageId: string) => {
  const allNodes = getBlockNodes(stageId);
  const boundingBox = getSelectionBox(stageId);
  if (allNodes && boundingBox) {
    const box = boundingBox.getClientRect();
    return allNodes.filter((node: Node) => {
      return haveRectsIntersection(box, node.getClientRect());
    });
  }
};

export const selectNodesIntersectingWithBoundingBox = (stageId: string) => {
  const nodes = getNodesIntersectingWithBoundingBox(stageId);
  if (!nodes) return;
  selectNodes(stageId, nodes);
};
