import type { Position } from "shared/model";
import { calculateGridCoordinates, isGrid } from "./grid.helpers";
import { getStageIdFromEvent, type KonvaDragEvent } from "entities/stage";

export const onMoveOnGrid = (e: KonvaDragEvent) => {
  const stageId = getStageIdFromEvent(e);
  if (!stageId || !isGrid(stageId)) return;
  const position = e.target.position();
  const positionOnGrid = moveOnGrid(position);
  e.target.position(positionOnGrid);
};

export const moveOnGrid = (position: Position) => {
  return calculateGridCoordinates({
    x: position.x,
    y: position.y,
  });
};
