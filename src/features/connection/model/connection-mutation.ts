import { getRectFromGroup } from "entities/node";
import type { Group } from "konva/lib/Group";
import { ConnectionAnchorSide } from "./connection.types";
import { FULL_SIZE } from "features/grid";

export interface UpdateProps {
  fromNode: Group;
  toNode: Group;
  fromSide: ConnectionAnchorSide;
  toSide: ConnectionAnchorSide;
}

export const getUpdatedPoints = (props: UpdateProps) => {
  const fromRect = getRectFromGroup(props.fromNode);
  const toRect = getRectFromGroup(props.toNode);
  const fromWidth = fromRect.width();
  const fromHeight = fromRect.height();
  const toWidth = toRect.width();
  const toHeight = toRect.height();

  // Get positions and centers
  const fromX = props.fromNode.x();
  const fromY = props.fromNode.y();
  const toX = props.toNode.x();
  const toY = props.toNode.y();

  // Calculate start point based on fromSide
  let startX = fromX;
  let startY = fromY;
  switch (props.fromSide) {
    case ConnectionAnchorSide.RIGHT:
      startX = fromX + fromWidth;
      startY = fromY + fromHeight / 2;
      break;
    case ConnectionAnchorSide.LEFT:
      startX = fromX;
      startY = fromY + fromHeight / 2;
      break;
    case ConnectionAnchorSide.TOP:
      startX = fromX + fromWidth / 2;
      startY = fromY;
      break;
    case ConnectionAnchorSide.BOTTOM:
      startX = fromX + fromWidth / 2;
      startY = fromY + fromHeight;
      break;
  }

  // Calculate end point based on toSide
  let endX = toX;
  let endY = toY;
  switch (props.toSide) {
    case ConnectionAnchorSide.LEFT:
      endX = toX;
      endY = toY + toHeight / 2;
      break;
    case ConnectionAnchorSide.RIGHT:
      endX = toX + toWidth;
      endY = toY + toHeight / 2;
      break;
    case ConnectionAnchorSide.TOP:
      endX = toX + toWidth / 2;
      endY = toY;
      break;
    case ConnectionAnchorSide.BOTTOM:
      endX = toX + toWidth / 2;
      endY = toY + toHeight;
      break;
  }

  let bendX = startX;
  let bendY = startY;

  // Determine bend direction and path based on side combination and relative centers
  if (
    props.fromSide === ConnectionAnchorSide.RIGHT &&
    props.toSide === ConnectionAnchorSide.LEFT
  ) {
    bendX = startX + FULL_SIZE; // Up
    bendY = startY;
    return [startX, startY, bendX, bendY, bendX, endY, endX, endY]; // Up, right, down
  } else if (
    props.fromSide === ConnectionAnchorSide.LEFT &&
    props.toSide === ConnectionAnchorSide.RIGHT
  ) {
    bendX = startX - FULL_SIZE; // Up
    bendY = startY;
    return [startX, startY, bendX, bendY, bendX, endY, endX, endY]; // Up, left, down
  } else if (
    props.fromSide === ConnectionAnchorSide.TOP &&
    props.toSide === ConnectionAnchorSide.BOTTOM
  ) {
    bendY = startY - FULL_SIZE; // Up
    bendX = startX;
    return [startX, startY, bendX, bendY, endX, bendY, endX, endY]; // Up, right, down
  } else if (
    props.fromSide === ConnectionAnchorSide.BOTTOM &&
    props.toSide === ConnectionAnchorSide.TOP
  ) {
    bendY = startY + FULL_SIZE; // Down
    bendX = startX;
    return [startX, startY, bendX, bendY, endX, bendY, endX, endY]; // Down, right, up
  } else {
    // Default bent path for other combinations (e.g., top to side)
    const isHorizontalMove =
      props.fromSide === ConnectionAnchorSide.LEFT ||
      props.fromSide === ConnectionAnchorSide.RIGHT;
    if (isHorizontalMove) {
      bendX = startX + (endX < startX ? -FULL_SIZE : FULL_SIZE);
      bendY = startY;
      return [startX, startY, bendX, bendY, bendX, endY, endX, endY];
    } else {
      bendY = startY + (endY < startY ? -FULL_SIZE : FULL_SIZE);
      bendX = startX;
      return [startX, startY, bendX, bendY, endX, bendY, endX, endY];
    }
  }
};
