import Konva from 'konva';
import { getStage, getStageIdFromEvent } from 'entities/stage';
import {
  createSelectionBox,
  getSelectionBox,
  removeSelectionBoxes,
  selectNode,
  selectNodesIntersectingWithBoundingBox,
  unSelectAllNodes,
  updateSelectionBox,
} from 'features/selection';
import { getTool, Tools } from 'widgets/Toolbar';
import {
  createRectangle,
  finishDrawingRectangle,
  getDrawnRectangleBox,
  updateRectangle,
} from 'features/rectangle';
import { createLine, drawLine, finishDrawingLine } from 'features/line';
import { reScalePosition, unScalePosition } from 'features/scale';
import { handleDragEnd, handleDragStart } from 'features/hand';
import { getGridLayerId, calculateGridCoordinates } from 'features/grid';
import type { Position } from 'shared/model';
import { createBlock } from 'features/block-mutation';
import { BlockTypes, config } from 'entities/block';

export const getPointerPosition = (stageId: string) => {
  return getStage(stageId)?.getPointerPosition();
};

export const getUnscaledPointerPosition = (stageId: string) => {
  const pointerPosition = getPointerPosition(stageId);
  if (!pointerPosition) return null;
  return unScalePosition(stageId, pointerPosition);
};

export const getRescaledPointerPosition = (stageId: string) => {
  const pointerPosition = getPointerPosition(stageId);
  if (!pointerPosition) return null;
  return reScalePosition(stageId, pointerPosition);
};

export const handlePointerDown = (
  e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
) => {
  const id = getStageIdFromEvent(e);
  if (!id) return;
  if (getTool() === Tools.HAND) {
    handleDragStart(id);
  }
  const selectedNode = e.target;
  const isMouseOnStage = selectedNode === e.currentTarget;
  const isMouseOnGridLayer =
    selectedNode.parent?.getAttr('id') === getGridLayerId(id);
  if (isMouseOnStage || isMouseOnGridLayer) {
    // Whenever user has pointer down on stage we remove selection from all nodes
    unSelectAllNodes(id);
    if (e.evt.ctrlKey || e.evt.metaKey || getTool() === Tools.POINTER) {
      const pointerPos = getUnscaledPointerPosition(id);
      if (pointerPos) {
        createSelectionBox(id, pointerPos);
      }
    } else if (getTool() === Tools.RECTANGLE) {
      const pointerPos = getUnscaledPointerPosition(id);
      if (pointerPos) {
        const gridCoordinates = calculateGridCoordinates(pointerPos);
        createRectangle(id, { position: gridCoordinates, grid: true });
        const rect = getDrawnRectangleBox(id);
        if (rect) {
          selectNode(id, rect);
          rect.moveToBottom();
        }
      }
    } else if (getTool() === Tools.LINE) {
      const pointerPosition = getUnscaledPointerPosition(id);
      if (pointerPosition)
        createLine(id, [
          pointerPosition,
          pointerPosition,
          pointerPosition,
          pointerPosition,
        ]);
    } else if (getTool() === Tools.TEXT) {
      const position = getUnscaledPointerPosition(id);
      if (!position) return;
      const gridPosition = calculateGridCoordinates(position);
      createBlock(id, {
        type: BlockTypes.RECTANGLE,
        position: gridPosition,
        size: {
          width: config.width,
          height: config.height,
        },
      });
    }
  }
};

export const handlePointerMove = (
  e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  callback?: (position: Position) => void
) => {
  const id = getStageIdFromEvent(e);
  if (!id) return;
  const stage = getStage(id);
  if (stage) {
    const pointerPos = getUnscaledPointerPosition(id);
    if (callback && pointerPos) {
      callback(pointerPos);
    }
    if (e.evt.ctrlKey || e.evt.metaKey || getTool() === Tools.POINTER) {
      if (pointerPos) {
        updateSelectionBox(id, pointerPos);
      }
    } else if (getTool() === Tools.RECTANGLE) {
      if (pointerPos) {
        updateRectangle(id, pointerPos);
      }
    } else if (getTool() === Tools.LINE) {
      drawLine(id);
    }
  }
};

export const handlePointerUp = (
  e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
) => {
  const id = getStageIdFromEvent(e);
  if (!id) return;
  const stage = getStage(id);
  if (stage) {
    if (getSelectionBox(id)) {
      selectNodesIntersectingWithBoundingBox(id);
      removeSelectionBoxes(id);
    }
    if (getTool() === Tools.HAND) {
      handleDragEnd(id);
    }
    if (getTool() === Tools.RECTANGLE) {
      finishDrawingRectangle(id);
    }
    if (getTool() === Tools.LINE) {
      finishDrawingLine(id);
    }
  }
};
