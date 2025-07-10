import Konva from "konva";
import { Stage } from "konva/lib/Stage";
import type { KonvaEvent, KonvaMouseTouchEvent } from "./stage.types";
import { unScale } from "features/scale";
import { getCanvasContainer } from "widgets";

export const getStageElementId = (id: string) => `stage-element-${id}`;

export const getStageElement = (id: string): HTMLElement | null =>
  document.getElementById(getStageElementId(id));

export const getStage = (id: string): Stage | undefined => {
  const stageElement = getStageElement(id);
  return stageElement
    ? Konva.stages.find((s) => s.container() === stageElement)
    : undefined;
};

export const getUuidFromStageId = (stageId: string) => {
  const parts = stageId.split("-");
  if (parts.length < 3) {
    return null;
  }
  return parts.slice(2).join("-").trim();
};

export const getStageIdFromEvent = (e: KonvaMouseTouchEvent | KonvaEvent) => {
  const stageId = e.target.getStage()?.attrs.id;
  return getUuidFromStageId(stageId);
};

export const getStageIdFromNode = (node: Konva.Node) => {
  const stageId = node.getStage()?.attrs.id;
  if (!stageId) return null;
  return getUuidFromStageId(stageId);
};

export const getStageRect = (stageId: string) => {
  const stage = getStage(stageId);
  if (!stage) return;
  return {
    x1: 0,
    y1: 0,
    x2: stage.width(),
    y2: stage.height(),
    offset: {
      x: unScale(stageId, stage.x()),
      y: unScale(stageId, stage.y()),
    },
  };
};

export const getViewRect = (stageId: string) => {
  const canvasContainer = getCanvasContainer(stageId);
  const stageRect = getStageRect(stageId);
  if (!stageRect) return;
  return {
    x1: -stageRect.offset.x,
    y1: -stageRect.offset.y,
    x2:
      unScale(stageId, canvasContainer?.offsetWidth ?? 0) - stageRect.offset.x,
    y2:
      unScale(stageId, canvasContainer?.offsetHeight ?? 0) - stageRect.offset.y,
  };
};

export const getViewSize = (stageId: string) => {
  const viewRect = getViewRect(stageId);
  if (!viewRect) return;
  return {
    width: viewRect.x2 - viewRect.x1,
    height: viewRect.y2 - viewRect.y1,
  };
};
