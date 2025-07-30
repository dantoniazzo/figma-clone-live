import { findNode, getRectFromGroup } from 'entities/node';
import type { Group } from 'konva/lib/Group';
import { ConnectionAnchorSide, OppositeSides } from './connection.types';
import { FULL_SIZE } from 'features/grid';
import {
  getStageIdFromEvent,
  getStageIdFromNode,
  type KonvaEvent,
} from 'entities/stage';
import { getNearestBlockInDirection, type Connection } from 'entities/block';
import { getLayer } from 'entities/layer';
import { findConnectionArrow } from './connection-arrow';
import { getSelectedNode } from 'features/selection';
import { updateBlock } from 'features/block-mutation';

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

export const updateConnection = (node: Group) => {
  const connections = node.getAttr('connections') as Connection[] | undefined;
  if (!connections) return;
  connections.map((connection) => {
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
  });
};

// Helper function to get the center point of a side
const getSideCenter = (
  x: number,
  y: number,
  width: number,
  height: number,
  side: ConnectionAnchorSide
) => {
  switch (side) {
    case ConnectionAnchorSide.LEFT:
      return { x, y: y + height / 2 };
    case ConnectionAnchorSide.RIGHT:
      return { x: x + width, y: y + height / 2 };
    case ConnectionAnchorSide.TOP:
      return { x: x + width / 2, y };
    case ConnectionAnchorSide.BOTTOM:
      return { x: x + width / 2, y: y + height };
  }
};

// Get rectangle bounds
const getRectBounds = (
  x: number,
  y: number,
  width: number,
  height: number
) => ({
  left: x,
  right: x + width,
  top: y,
  bottom: y + height,
});

// Check if a horizontal line segment intersects with a rectangle
const horizontalLineIntersectsRect = (
  x1: number,
  x2: number,
  y: number,
  rect: ReturnType<typeof getRectBounds>
) => {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  return (
    y >= rect.top && y <= rect.bottom && maxX >= rect.left && minX <= rect.right
  );
};

// Check if a vertical line segment intersects with a rectangle
const verticalLineIntersectsRect = (
  y1: number,
  y2: number,
  x: number,
  rect: ReturnType<typeof getRectBounds>
) => {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  return (
    x >= rect.left && x <= rect.right && maxY >= rect.top && minY <= rect.bottom
  );
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

  // Get start and end points (centers of the sides)
  const startPoint = getSideCenter(
    fromX,
    fromY,
    fromWidth,
    fromHeight,
    props.fromSide
  );
  const endPoint = getSideCenter(toX, toY, toWidth, toHeight, props.toSide);

  // Get rectangle bounds
  const fromBounds = getRectBounds(fromX, fromY, fromWidth, fromHeight);
  const toBounds = getRectBounds(toX, toY, toWidth, toHeight);

  const points: number[] = [startPoint.x, startPoint.y];
  const minOffset = FULL_SIZE; // Minimum distance to step away from rectangles

  // Step away from source rectangle
  let firstStepX = startPoint.x;
  let firstStepY = startPoint.y;

  switch (props.fromSide) {
    case ConnectionAnchorSide.LEFT:
      firstStepX = fromBounds.left - minOffset;
      break;
    case ConnectionAnchorSide.RIGHT:
      firstStepX = fromBounds.right + minOffset;
      break;
    case ConnectionAnchorSide.TOP:
      firstStepY = fromBounds.top - minOffset;
      break;
    case ConnectionAnchorSide.BOTTOM:
      firstStepY = fromBounds.bottom + minOffset;
      break;
  }

  // Step toward destination rectangle
  let lastStepX = endPoint.x;
  let lastStepY = endPoint.y;

  switch (props.toSide) {
    case ConnectionAnchorSide.LEFT:
      lastStepX = toBounds.left - minOffset;
      break;
    case ConnectionAnchorSide.RIGHT:
      lastStepX = toBounds.right + minOffset;
      break;
    case ConnectionAnchorSide.TOP:
      lastStepY = toBounds.top - minOffset;
      break;
    case ConnectionAnchorSide.BOTTOM:
      lastStepY = toBounds.bottom + minOffset;
      break;
  }

  // Determine connection types
  const isFromHorizontal =
    props.fromSide === ConnectionAnchorSide.LEFT ||
    props.fromSide === ConnectionAnchorSide.RIGHT;
  const isToHorizontal =
    props.toSide === ConnectionAnchorSide.LEFT ||
    props.toSide === ConnectionAnchorSide.RIGHT;

  if (isFromHorizontal && !isToHorizontal) {
    // Horizontal to vertical: step out horizontally, then go to destination X, then down/up
    points.push(firstStepX, firstStepY);

    // Check if we can go directly to the destination X coordinate
    const directY = firstStepY;
    const pathClear =
      !horizontalLineIntersectsRect(
        firstStepX,
        lastStepX,
        directY,
        fromBounds
      ) &&
      !horizontalLineIntersectsRect(firstStepX, lastStepX, directY, toBounds);

    if (pathClear) {
      points.push(lastStepX, directY);
    } else {
      // Route around obstacles
      const clearY =
        props.toSide === ConnectionAnchorSide.TOP
          ? toBounds.top - minOffset * 2
          : toBounds.bottom + minOffset * 2;
      points.push(firstStepX, clearY);
      points.push(lastStepX, clearY);
    }

    points.push(lastStepX, lastStepY);
  } else if (!isFromHorizontal && isToHorizontal) {
    // Vertical to horizontal: step out vertically, then go to destination Y, then left/right
    points.push(firstStepX, firstStepY);

    // Check if there's enough horizontal space between the nodes
    const leftNode = fromBounds.left < toBounds.left ? fromBounds : toBounds;
    const rightNode = fromBounds.left < toBounds.left ? toBounds : fromBounds;
    const horizontalGap = rightNode.left - leftNode.right;
    const hasHorizontalSpace = horizontalGap >= minOffset;

    // Check if we can go directly to the destination Y coordinate
    const directX = firstStepX;
    const pathClear =
      !verticalLineIntersectsRect(firstStepY, lastStepY, directX, fromBounds) &&
      !verticalLineIntersectsRect(firstStepY, lastStepY, directX, toBounds);

    if (pathClear) {
      points.push(directX, lastStepY);
    } else {
      if (hasHorizontalSpace) {
        // Route through the empty space between nodes
        const routingX = leftNode.right + horizontalGap / 2;
        points.push(routingX, firstStepY);
        points.push(routingX, lastStepY);
      } else {
        // Route around obstacles
        const clearX =
          props.toSide === ConnectionAnchorSide.LEFT
            ? toBounds.left - minOffset * 2
            : toBounds.right + minOffset * 2;
        points.push(clearX, firstStepY);
        points.push(clearX, lastStepY);
      }
    }

    points.push(lastStepX, lastStepY);
  } else if (isFromHorizontal && isToHorizontal) {
    // Both horizontal: step out, go to midpoint X, then vertically to destination Y, then horizontally to destination
    points.push(firstStepX, firstStepY);

    const midX = (firstStepX + lastStepX) / 2;

    // Check if there's enough vertical space between the nodes
    const topNode = fromBounds.top < toBounds.top ? fromBounds : toBounds;
    const bottomNode = fromBounds.top < toBounds.top ? toBounds : fromBounds;
    const verticalGap = bottomNode.top - topNode.bottom;
    const hasVerticalSpace = verticalGap >= minOffset;

    // Check if the path would intersect either rectangle
    const horizontalIntersects =
      horizontalLineIntersectsRect(firstStepX, midX, firstStepY, fromBounds) ||
      horizontalLineIntersectsRect(firstStepX, midX, firstStepY, toBounds) ||
      horizontalLineIntersectsRect(midX, lastStepX, lastStepY, fromBounds) ||
      horizontalLineIntersectsRect(midX, lastStepX, lastStepY, toBounds);

    const verticalIntersects =
      verticalLineIntersectsRect(firstStepY, lastStepY, midX, fromBounds) ||
      verticalLineIntersectsRect(firstStepY, lastStepY, midX, toBounds);

    if (horizontalIntersects || verticalIntersects) {
      if (hasVerticalSpace) {
        // Route through the empty space between nodes
        const routingY = topNode.bottom + verticalGap / 2;
        points.push(firstStepX, routingY);
        points.push(lastStepX, routingY);
      } else {
        // Route around both rectangles - find the shortest clear path
        const topClear = Math.min(fromBounds.top, toBounds.top) - minOffset;
        const bottomClear =
          Math.max(fromBounds.bottom, toBounds.bottom) + minOffset;

        // Calculate distances for top and bottom routing
        const topDistance =
          Math.abs(firstStepY - topClear) + Math.abs(lastStepY - topClear);
        const bottomDistance =
          Math.abs(firstStepY - bottomClear) +
          Math.abs(lastStepY - bottomClear);

        const routingY = topDistance < bottomDistance ? topClear : bottomClear;

        points.push(firstStepX, routingY);
        points.push(lastStepX, routingY);
      }
    } else {
      // Original path is clear
      points.push(midX, firstStepY);
      points.push(midX, lastStepY);
    }

    points.push(lastStepX, lastStepY);
  } else {
    // Both vertical: step out, go horizontally to align, then vertically to destination
    points.push(firstStepX, firstStepY);

    const midX = (firstStepX + lastStepX) / 2;

    // Check if there's enough horizontal space between the nodes
    const leftNode = fromBounds.left < toBounds.left ? fromBounds : toBounds;
    const rightNode = fromBounds.left < toBounds.left ? toBounds : fromBounds;
    const horizontalGap = rightNode.left - leftNode.right;
    const hasHorizontalSpace = horizontalGap >= minOffset;

    // Check if we need to route around obstacles
    const needsRouting =
      verticalLineIntersectsRect(firstStepY, lastStepY, midX, fromBounds) ||
      verticalLineIntersectsRect(firstStepY, lastStepY, midX, toBounds) ||
      horizontalLineIntersectsRect(firstStepX, midX, firstStepY, fromBounds) ||
      horizontalLineIntersectsRect(firstStepX, midX, firstStepY, toBounds) ||
      horizontalLineIntersectsRect(midX, lastStepX, lastStepY, fromBounds) ||
      horizontalLineIntersectsRect(midX, lastStepX, lastStepY, toBounds);

    if (needsRouting) {
      if (hasHorizontalSpace) {
        // Route through the empty space between nodes
        const routingX = leftNode.right + horizontalGap / 2;
        points.push(routingX, firstStepY);
        points.push(routingX, lastStepY);
      } else {
        // Route around both rectangles
        const leftClear = Math.min(fromBounds.left, toBounds.left) - minOffset;
        const rightClear =
          Math.max(fromBounds.right, toBounds.right) + minOffset;

        // Calculate distances for left and right routing
        const leftDistance =
          Math.abs(firstStepX - leftClear) + Math.abs(lastStepX - leftClear);
        const rightDistance =
          Math.abs(firstStepX - rightClear) + Math.abs(lastStepX - rightClear);

        const routingX = leftDistance < rightDistance ? leftClear : rightClear;

        points.push(routingX, firstStepY);
        points.push(routingX, lastStepY);
      }
    } else {
      points.push(midX, firstStepY);
      points.push(midX, lastStepY);
    }

    points.push(lastStepX, lastStepY);
  }

  // Final connection to the actual end point
  points.push(endPoint.x, endPoint.y);

  return points;
};

export const createConnection = (e: KonvaEvent, side: ConnectionAnchorSide) => {
  const stageId = getStageIdFromEvent(e);
  if (!stageId) return;
  const selectedNode = getSelectedNode(stageId);
  if (!selectedNode) return;
  const nearestBlock = getNearestBlockInDirection(
    stageId,
    selectedNode.getAttr('id'),
    side
  );
  if (!nearestBlock) return;
  const rectFrom = getRectFromGroup(selectedNode as Group);
  const existingFromConnections = selectedNode.getAttr('connections') || [];
  updateBlock(stageId, {
    id: selectedNode.getAttr('id'),
    position: selectedNode.position(),
    size: rectFrom.size(),
    connections: [
      ...existingFromConnections,
      {
        from: selectedNode.getAttr('id'),
        to: nearestBlock.getAttr('id'),
        fromSide: side,
        toSide: OppositeSides[side],
      },
    ],
  });
  const rectTo = getRectFromGroup(nearestBlock as Group);
  const existingToConnections = nearestBlock.getAttr('connections') || [];
  updateBlock(stageId, {
    id: nearestBlock.getAttr('id'),
    position: nearestBlock.position(),
    size: rectTo.size(),
    connections: [
      ...existingToConnections,
      {
        from: selectedNode.getAttr('id'),
        to: nearestBlock.getAttr('id'),
        fromSide: side,
        toSide: OppositeSides[side],
      },
    ],
  });
};
