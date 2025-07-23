import { findNode, getRectFromGroup } from "entities/node";
import type { Group } from "konva/lib/Group";
import { ConnectionAnchorSide } from "./connection.types";
import { FULL_SIZE } from "features/grid";
import { getStageIdFromNode } from "entities/stage";
import type { Connection } from "entities/block";
import { getLayer } from "entities/layer";
import { findConnectionArrow } from "./connection-arrow";

export interface UpdateProps {
  fromNode: Group;
  toNode: Group;
  fromSide: ConnectionAnchorSide;
  toSide: ConnectionAnchorSide;
}

export const calculateConnectionPoints = (
  node: Group,
  connection: Connection
) => {
  const stageId = getStageIdFromNode(node);
  if (!stageId) return;
  const to = connection.to;
  const from = connection.from;
  const fromSide = connection.fromSide;
  const toSide = connection.toSide;
  if (to && from && fromSide && toSide) {
    const fromNode = findNode(stageId, from);
    const toNode = findNode(stageId, to);
    if (fromNode && toNode) {
      return getUpdatedPoints({
        fromNode: fromNode as Group,
        toNode: toNode as Group,
        fromSide,
        toSide,
      });
    }
  }
};

export const updateConnection = (
  node: Group,
  callback?: (points: number[]) => void
) => {
  const connection = node.getAttr("connection") as Connection | undefined;
  if (!connection) return;
  const calculatedPoints = calculateConnectionPoints(node, connection);
  const stageId = getStageIdFromNode(node);
  if (!stageId) return;
  const layer = getLayer(stageId);
  const from = connection.from;
  const to = connection.to;
  if (layer && from && to) {
    const arrow = findConnectionArrow(stageId, from, to);
    arrow?.points(calculatedPoints);
  }
  if (callback && calculatedPoints) callback(calculatedPoints);
};

export const getUpdatedPoints = (props: UpdateProps) => {
  const fromRect = getRectFromGroup(props.fromNode);
  const toRect = getRectFromGroup(props.toNode);
  const fromWidth = fromRect.width();
  const fromHeight = fromRect.height();
  const toWidth = toRect.width();
  const toHeight = toRect.height();

  // Get positions
  const fromX = props.fromNode.x();
  const fromY = props.fromNode.y();
  const toX = props.toNode.x();
  const toY = props.toNode.y();

  // Calculate centers
  const fromCenterY = fromY + fromHeight / 2;
  const toCenterY = toY + toHeight / 2;

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

  // Determine bend direction and path based on side combination and relative positions
  if (
    props.fromSide === ConnectionAnchorSide.RIGHT &&
    props.toSide === ConnectionAnchorSide.LEFT
  ) {
    const distance = toX - (fromX + fromWidth); // Horizontal distance between right of from and left of to
    const fromCenterY = fromY + fromHeight / 2;
    const toCenterY = toY + toHeight / 2;

    if (distance >= 2 * FULL_SIZE) {
      // 4 points: simple bend at FULL_SIZE
      bendX = startX + FULL_SIZE;
      return [startX, startY, bendX, bendY, bendX, endY, endX, endY];
    } else {
      // 6-point path: route around toNode, ensuring visibility
      const midX = Math.max(startX + FULL_SIZE, toX + toWidth + FULL_SIZE);
      const verticalBendY =
        toCenterY < fromCenterY
          ? Math.min(fromY - FULL_SIZE, toY - FULL_SIZE)
          : Math.max(
              fromY + fromHeight + FULL_SIZE,
              toY + toHeight + FULL_SIZE
            );
      return [
        startX,
        startY,
        midX,
        startY,
        midX,
        verticalBendY,
        endX - FULL_SIZE,
        verticalBendY,
        endX - FULL_SIZE,
        endY,
        endX,
        endY,
      ];
    }
  } else if (
    props.fromSide === ConnectionAnchorSide.LEFT &&
    props.toSide === ConnectionAnchorSide.RIGHT
  ) {
    if (endX < startX - 2 * FULL_SIZE) {
      // 4 points: simple bend when toBlock is far to the left
      bendX = startX - FULL_SIZE;
      return [startX, startY, bendX, startY, bendX, endY, endX, endY];
    } else {
      // 6-point path: route around when toBlock is close, overlapping, or to the right
      const midX = Math.min(startX - FULL_SIZE, toX - FULL_SIZE);
      const verticalBendY =
        toCenterY < fromCenterY
          ? Math.min(fromY - FULL_SIZE, toY - FULL_SIZE)
          : Math.max(
              fromY + fromHeight + FULL_SIZE,
              toY + toHeight + FULL_SIZE
            );
      return [
        startX,
        startY,
        midX,
        startY,
        midX,
        verticalBendY,
        endX + FULL_SIZE,
        verticalBendY,
        endX + FULL_SIZE,
        endY,
        endX,
        endY,
      ];
    }
  } else if (
    props.fromSide === ConnectionAnchorSide.TOP &&
    props.toSide === ConnectionAnchorSide.BOTTOM
  ) {
    bendY = startY - FULL_SIZE;
    bendX = startX;
    return [startX, startY, bendX, bendY, endX, bendY, endX, endY];
  } else if (
    props.fromSide === ConnectionAnchorSide.BOTTOM &&
    props.toSide === ConnectionAnchorSide.TOP
  ) {
    bendY = startY + FULL_SIZE;
    bendX = startX;
    return [startX, startY, bendX, bendY, endX, bendY, endX, endY];
  } else {
    // Default bent path for other combinations
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
