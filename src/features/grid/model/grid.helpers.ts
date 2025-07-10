import { type Position, type Size } from "shared/model";
import {
  GAP_SIZE,
  FULL_SIZE,
  STEP_SIZE,
  INTERSECTION_OFFSET,
} from "../lib/grid.constants";
import { getStage, getStageRect, getViewRect } from "entities/stage";
import { unScale } from "features/scale";
import { getGridLayer } from "./grid-layer";
import { getCanvasContainer } from "widgets";

// =========== Grid layer ===========

export const getZoomStep = (id: string) => {
  const scaleX = getStage(id)?.scaleX();
  if (scaleX) {
    // 0.4 is the zoom out scale level where the
    // grid needs to recalculate with new width and stroke width
    if (scaleX > 0.2 && scaleX < 0.4) return 2;
    if (scaleX < 0.2) return 4;
    else return 1;
  } else return 1;
};

export const getFullOffset = (id: string) => {
  const stage = getStage(id);
  if (!stage) return;
  return {
    x: Math.ceil(unScale(id, stage.x()) / FULL_SIZE) * FULL_SIZE,
    y: Math.ceil(unScale(id, stage.y()) / FULL_SIZE) * FULL_SIZE,
  };
};

export const getStepOffset = (id: string) => {
  const stage = getStage(id);
  if (!stage) return;
  return {
    x: Math.ceil(unScale(id, stage.x()) / STEP_SIZE) * STEP_SIZE,
    y: Math.ceil(unScale(id, stage.y()) / STEP_SIZE) * STEP_SIZE,
  };
};

export const getFullRect = (id: string) => {
  const fullOffset = getFullOffset(id);
  const canvasContainer = getCanvasContainer(id);

  if (!fullOffset) return;
  return {
    x1: -fullOffset.x,
    y1: -fullOffset.y,
    x2:
      unScale(id, canvasContainer?.offsetWidth ?? 0) - fullOffset.x + FULL_SIZE,
    y2:
      unScale(id, canvasContainer?.offsetHeight ?? 0) -
      fullOffset.y +
      FULL_SIZE,
  };
};

export const getStepRect = (id: string) => {
  const stepOffset = getStepOffset(id);
  const canvasContainer = getCanvasContainer(id);
  if (!stepOffset) return;
  return {
    x1: -stepOffset.x,
    y1: -stepOffset.y,
    x2:
      unScale(id, canvasContainer?.offsetWidth ?? 0) - stepOffset.x + STEP_SIZE,
    y2:
      unScale(id, canvasContainer?.offsetHeight ?? 0) -
      stepOffset.y +
      STEP_SIZE,
  };
};

export const getFullTotal = (id: string) => {
  const stageRect = getStageRect(id);
  if (!stageRect) return;
  const fullRect = getFullRect(id);
  if (!fullRect) return;
  return {
    x1: Math.min(stageRect.x1, fullRect.x1),
    y1: Math.min(stageRect.y1, fullRect.y1),
    x2: Math.max(stageRect.x2, fullRect.x2),
    y2: Math.max(stageRect.y2, fullRect.y2),
  };
};

export const getStepTotal = (id: string) => {
  const stageRect = getStageRect(id);
  if (!stageRect) return;
  const stepRect = getStepRect(id);
  if (!stepRect) return;
  return {
    x1: Math.min(stageRect.x1, stepRect.x1),
    y1: Math.min(stageRect.y1, stepRect.y1),
    x2: Math.max(stageRect.x2, stepRect.x2),
    y2: Math.max(stageRect.y2, stepRect.y2),
  };
};

export const clipGridLayer = (id: string) => {
  const gridLayer = getGridLayer(id);
  if (!gridLayer) return;
  const viewRect = getViewRect(id);
  if (!viewRect) return;
  // set clip function to stop leaking lines into non-viewable space.
  gridLayer.clip({
    x: viewRect.x1,
    y: viewRect.y1,
    width: viewRect.x2 - viewRect.x1,
    height: viewRect.y2 - viewRect.y1,
  });
};

export const getFullGridSize = (id: string) => {
  const fullTotal = getFullTotal(id);
  if (!fullTotal) return;
  return {
    xFullSize: fullTotal.x2 - fullTotal.x1,
    yFullSize: fullTotal.y2 - fullTotal.y1,
  };
};

export const getStepGridSize = (id: string) => {
  const stepTotal = getStepTotal(id);
  if (!stepTotal) return;
  return {
    xStepSize: stepTotal.x2 - stepTotal.x1,
    yStepSize: stepTotal.y2 - stepTotal.y1,
  };
};

export const getFullQty = (id: string) => {
  const fullGridSize = getFullGridSize(id);
  if (!fullGridSize) return;
  return {
    x: Math.round(fullGridSize.xFullSize / FULL_SIZE),
    y: Math.round(fullGridSize.yFullSize / FULL_SIZE),
  };
};

export const getStepQty = (id: string) => {
  const stepGridSize = getStepGridSize(id);
  if (!stepGridSize) return;
  return {
    x: Math.round(stepGridSize.xStepSize / STEP_SIZE),
    y: Math.round(stepGridSize.yStepSize / STEP_SIZE),
  };
};

export const getFullPosition = (id: string, i: number) => {
  const fullTotal = getFullTotal(id);
  if (!fullTotal) return;
  return {
    x: {
      x: fullTotal.x1 - INTERSECTION_OFFSET + i * FULL_SIZE,
      y: fullTotal.y1,
    },
    y: {
      x: fullTotal.x1,
      y: fullTotal.y1 - INTERSECTION_OFFSET + i * FULL_SIZE,
    },
  };
};

export const getStepPosition = (id: string, i: number) => {
  const fullTotal = getFullTotal(id);
  if (!fullTotal) return;
  return {
    x: {
      x: fullTotal.x1 + INTERSECTION_OFFSET + i * FULL_SIZE - GAP_SIZE,
      y: fullTotal.y1,
    },
    y: {
      x: fullTotal.x1,
      y: fullTotal.y1 + INTERSECTION_OFFSET + i * FULL_SIZE - GAP_SIZE,
    },
  };
};

export const getFullPoints = (id: string) => {
  const fullGridSize = getFullGridSize(id);
  if (!fullGridSize) return;
  return {
    x: [0, 0, 0, fullGridSize.yFullSize],
    y: [0, 0, fullGridSize.xFullSize, 0],
  };
};

export const getStepPoints = (id: string) => {
  const stepGridSize = getStepGridSize(id);
  if (!stepGridSize) return;
  return {
    x: [0, 0, 0, stepGridSize.yStepSize],
    y: [0, 0, stepGridSize.xStepSize, 0],
  };
};

export const calculateGridCoordinates = (position: Position) => {
  return {
    x: Math.round(position.x / FULL_SIZE) * FULL_SIZE - GAP_SIZE,
    y: Math.round(position.y / FULL_SIZE) * FULL_SIZE - GAP_SIZE,
  };
};

export const getSnapSize = (size: Size) => {
  const calculatedSize = calculateGridCoordinates({
    x: size.width,
    y: size.height,
  });

  return {
    width: calculatedSize.x,
    height: calculatedSize.y,
  };
};
