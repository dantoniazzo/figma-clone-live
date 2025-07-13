import type { Position } from "shared/model";
import { calculateGridCoordinates } from "./grid.helpers";
import type { KonvaDragEvent } from "entities/stage";

export const onMoveOnGrid = (e: KonvaDragEvent) => {
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

export const resizeOnGrid = () => {};
