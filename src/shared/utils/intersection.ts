import type { Rect, Position } from '../model';

export const haveRectsIntersection = (r1: Rect, r2: Rect) => {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
};

export const hasPointIntersection = (position: Position, rect: Rect) => {
  return !(
    rect.x > position.x ||
    rect.x + rect.width < position.x ||
    rect.y > position.y ||
    rect.y + rect.height < position.y
  );
};

export const isPointOutsideRect = (position: Position, rect: Rect) => {
  return (
    position.x < rect.x ||
    position.x > rect.x + rect.width ||
    position.y < rect.y ||
    position.y > rect.y + rect.height
  );
};
