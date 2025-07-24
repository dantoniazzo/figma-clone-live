import Konva from "konva";
import { type Points } from "./line.types";
import { v4 as uuidv4 } from "uuid";
import { LineConfig } from "./line.config";
import { getStage } from "entities/stage";
import { getLayer } from "entities/layer";
import { NEW_LINE_ATTR } from "../lib";
import { findNode } from "entities/node";
import { Line as LineType } from "konva/lib/shapes/Line";
import { getUnscaledPointerPosition } from "features/pointer";
import { formatPoints } from "./line.helpers";
import { createBlock } from "features/block-mutation";
import { BlockTypes } from "entities/block";

export const createLine = (stageId: string, points: Points) => {
  const id = uuidv4();
  const newLine = new Konva.Line({
    id,
    points: formatPoints(points),
    ...LineConfig,
  });
  const stage = getStage(stageId);
  const layer = getLayer(stageId);
  if (stage && layer) {
    stage.setAttr(NEW_LINE_ATTR, id);
    layer.add(newLine);
    layer.batchDraw();
  }
};

export const drawLine = (stageId: string) => {
  const stage = getStage(stageId);
  const newLineId = stage?.getAttr(NEW_LINE_ATTR);
  if (newLineId) {
    const line = findNode(stageId, newLineId) as LineType;
    if (line) {
      const pointerPosition = getUnscaledPointerPosition(stageId);
      const points = line.points();
      if (points && pointerPosition) {
        // We need to spread an array of positions evenly create a straight line
        line.points([
          points[0],
          points[1],
          points[0] + (pointerPosition.x - points[0]) / 3,
          points[1] + (pointerPosition.y - points[1]) / 3,
          points[0] + (2 * (pointerPosition.x - points[0])) / 3,
          points[1] + (2 * (pointerPosition.y - points[1])) / 3,
          pointerPosition.x,
          pointerPosition.y,
        ]);
        line.getLayer()?.batchDraw();
      }
    }
  }
};

export const finishDrawingLine = (stageId: string) => {
  const stage = getStage(stageId);
  if (!stage) return;
  const newLineId = stage.getAttr(NEW_LINE_ATTR);
  if (newLineId) {
    const line = findNode(stageId, newLineId) as LineType;
    stage.setAttr(NEW_LINE_ATTR, null);
    if (line) {
      const points = line.points();
      if (points) {
        createBlock(stageId, {
          type: BlockTypes.LINE,
          id: newLineId,
          points,
        });

        line.remove();
      }
    }
  }
};
