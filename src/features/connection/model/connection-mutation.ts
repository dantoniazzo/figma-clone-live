import { getRectFromGroup } from "entities/node";
import type { Group } from "konva/lib/Group";
import { ConnectionAnchorSide } from "./connection.types";

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
  const fromCenterY = fromY + fromHeight / 2;
  const toCenterY = toY + toHeight / 2;
  const fromCenterX = fromX + fromWidth / 2;
  const toCenterX = toX + toWidth / 2;

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

  const bendOffset = 40; // Fixed offset to move past node, per FigJam style
  let bendX = startX;
  let bendY = startY;

  // Determine bend direction and path based on side combination and relative centers
  if (
    props.fromSide === ConnectionAnchorSide.RIGHT &&
    props.toSide === ConnectionAnchorSide.LEFT
  ) {
    // Right to Left
    if (toCenterY >= fromCenterY) {
      bendX = startX + bendOffset; // Up
      bendY = startY;
      return [startX, startY, bendX, bendY, bendX, endY, endX, endY]; // Up, right, down
    } else {
      bendX = startX - bendOffset; // Down
      bendY = startY;
      return [startX, startY, bendX, bendY, bendX, endY, endX, endY]; // Down, right, up
    }
  } else if (
    props.fromSide === ConnectionAnchorSide.LEFT &&
    props.toSide === ConnectionAnchorSide.RIGHT
  ) {
    // Left to Right
    if (toCenterY >= fromCenterY) {
      bendX = startX - bendOffset; // Up
      bendY = startY;
      return [startX, startY, bendX, bendY, bendX, endY, endX, endY]; // Up, left, down
    } else {
      bendX = startX + bendOffset; // Down
      bendY = startY;
      return [startX, startY, bendX, bendY, bendX, endY, endX, endY]; // Down, left, up
    }
  } else if (
    props.fromSide === ConnectionAnchorSide.TOP &&
    props.toSide === ConnectionAnchorSide.BOTTOM
  ) {
    // Top to Bottom
    if (toCenterX >= fromCenterX) {
      bendY = startY - bendOffset; // Up
      bendX = startX;
      return [startX, startY, bendX, bendY, endX, bendY, endX, endY]; // Up, right, down
    } else {
      bendY = startY - bendOffset; // Up
      bendX = startX;
      return [startX, startY, bendX, bendY, endX, bendY, endX, endY]; // Up, left, down
    }
  } else if (
    props.fromSide === ConnectionAnchorSide.BOTTOM &&
    props.toSide === ConnectionAnchorSide.TOP
  ) {
    // Bottom to Top
    if (toCenterX >= fromCenterX) {
      bendY = startY + bendOffset; // Down
      bendX = startX;
      return [startX, startY, bendX, bendY, endX, bendY, endX, endY]; // Down, right, up
    } else {
      bendY = startY + bendOffset; // Down
      bendX = startX;
      return [startX, startY, bendX, bendY, endX, bendY, endX, endY]; // Down, left, up
    }
  } else {
    // Default bent path for other combinations (e.g., top to side)
    const isHorizontalMove =
      props.fromSide === ConnectionAnchorSide.LEFT ||
      props.fromSide === ConnectionAnchorSide.RIGHT;
    if (isHorizontalMove) {
      bendX = startX + (endX < startX ? -bendOffset : bendOffset);
      bendY = startY;
      return [startX, startY, bendX, bendY, bendX, endY, endX, endY];
    } else {
      bendY = startY + (endY < startY ? -bendOffset : bendOffset);
      bendX = startX;
      return [startX, startY, bendX, bendY, endX, bendY, endX, endY];
    }
  }
};
