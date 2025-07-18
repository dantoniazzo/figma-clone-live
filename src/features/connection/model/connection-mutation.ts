import { getRectFromGroup } from 'entities/node';
import type { Group } from 'konva/lib/Group';
import { ConnectionAnchorSide } from './connection.types';

export interface UpdateProps {
  fromNode: Group;
  toNode: Group;
  fromAnchorSide: ConnectionAnchorSide;
  toAnchorSide: ConnectionAnchorSide;
}

export const updateConnectionsFromEvent = () => {
  /*   const connectionFromNode = getNodeFromEvent(connection.from, e);
  const connectionToNode = getNodeFromEvent(connection.to, e);
  if (connectionFromNode) {
    (
      (e.target as Group).children.find(
        (child) => child instanceof Konva.Arrow
      ) as Konva.Arrow
    ).points(
      getUpdatedPoints({
        fromNode: connectionFromNode,
        toNode: e.target,
        fromAnchorSide: ConnectionAnchorSide.LEFT, // Example value
        toAnchorSide: ConnectionAnchorSide.RIGHT,  // Example value
      })
    );
  }

  if (connectionToNode) {
    (
      (connectionToNode as Group).children.find(
        (child) => child instanceof Konva.Arrow
      ) as Konva.Arrow
    ).points(
      getUpdatedPoints({
        fromNode: e.target,
        toNode: connectionToNode,
        fromAnchorSide: ConnectionAnchorSide.LEFT, // Example value
        toAnchorSide: ConnectionAnchorSide.RIGHT,  // Example value
      })
    );
  } */
};

export const getUpdatedPoints = (props: UpdateProps) => {
  const fromRect = getRectFromGroup(props.fromNode); // Source node
  const toRect = getRectFromGroup(props.toNode); // Target node
  const fromSize = fromRect.size(); // Source size
  const toSize = toRect.size(); // Target size
  // Get positions and dimensions of both blocks
  const fromX = props.fromNode.x(); // Source x
  const fromY = props.fromNode.y(); // Source y
  const toX = props.toNode.x(); // Target x
  const toY = props.toNode.y(); // Target y

  // Calculate start point based on fromAnchorSide
  let startX = fromX;
  let startY = fromY;
  switch (props.fromAnchorSide) {
    case ConnectionAnchorSide.RIGHT:
      startX = fromX + fromSize.width;
      startY = fromY + fromSize.height / 2;
      break;
    case ConnectionAnchorSide.LEFT:
      startX = fromX;
      startY = fromY + fromSize.height / 2;
      break;
    case ConnectionAnchorSide.TOP:
      startX = fromX + fromSize.width / 2;
      startY = fromY;
      break;
    case ConnectionAnchorSide.BOTTOM:
      startX = fromX + fromSize.width / 2;
      startY = fromY + fromSize.height;
      break;
  }

  // Calculate end point based on toAnchorSide
  let endX = toX;
  let endY = toY;
  switch (props.toAnchorSide) {
    case ConnectionAnchorSide.LEFT:
      endX = toX;
      endY = toY + toSize.height / 2;
      break;
    case ConnectionAnchorSide.RIGHT:
      endX = toX + toSize.width;
      endY = toY + toSize.height / 2;
      break;
    case ConnectionAnchorSide.TOP:
      endX = toX + toSize.width / 2;
      endY = toY;
      break;
    case ConnectionAnchorSide.BOTTOM:
      endX = toX + toSize.width / 2;
      endY = toY + toSize.height;
      break;
  }

  const FULL_SIZE = 40; // Grid size in pixels
  const padding = 20; // Padding around blocks when bending
  const bendOffset = 40; // Fixed offset for bends, matching image style

  // Check if blocks are sufficiently separated on x-axis
  const isSeparated = Math.abs(fromX + fromSize.width - toX) >= FULL_SIZE;

  // Check if blocks intersect on x-axis
  const intersectsOnXAxis =
    (toX <= fromX && toX + toSize.width >= fromX) ||
    (fromX <= toX && fromX + fromSize.width >= toX);

  // Check if blocks intersect on y-axis
  const intersectsOnYAxis =
    (toY <= fromY && toY + toSize.height >= fromY) ||
    (fromY <= toY && fromY + fromSize.height >= toY);

  // Check if anchor points are vertically offset
  const isVerticallyOffset = Math.abs(startY - endY) > 1; // Small threshold to detect offset

  // Case 1: Blocks are separated and anchor points are aligned - use Manhattan straight path
  if (isSeparated && !isVerticallyOffset) {
    return [
      startX,
      startY, // Start at specified anchor of fromNode
      startX,
      endY, // Vertical to align y
      endX,
      endY, // Horizontal to end at toNode
    ];
  }
  // Case 2: Blocks are separated but anchor points are offset - use Manhattan bend
  else if (isSeparated && isVerticallyOffset) {
    const midX = (startX + endX) / 2;
    return [
      startX,
      startY, // Start at specified anchor of fromNode
      startX,
      startY + bendOffset, // Vertical down to offset
      midX,
      startY + bendOffset, // Horizontal to midpoint
      midX,
      endY - bendOffset, // Vertical up to offset
      endX,
      endY - bendOffset, // Horizontal to align
      endX,
      endY, // Vertical to end at toNode
    ];
  }
  // Case 3: Blocks intersect or overlap - use Manhattan bend with padding
  else if (intersectsOnXAxis || intersectsOnYAxis) {
    const fromAbove = fromY < toY;
    const verticalOffset = fromAbove
      ? Math.max(toY - fromY + padding, bendOffset)
      : Math.max(fromY + fromSize.height + padding - toY, bendOffset);
    const horizontalOffset =
      fromX < toX
        ? Math.max(toX - fromX + padding, bendOffset)
        : Math.max(fromX + fromSize.width + padding - toX, bendOffset);

    // Special handling for TOP to BOTTOM
    if (
      props.fromAnchorSide === ConnectionAnchorSide.TOP &&
      props.toAnchorSide === ConnectionAnchorSide.BOTTOM
    ) {
      return [
        startX,
        startY, // Start at top of fromNode
        startX,
        startY + bendOffset, // Vertical down
        toX + toSize.width / 2,
        startY + bendOffset, // Horizontal across to center
        toX + toSize.width / 2,
        endY - bendOffset, // Vertical up
        endX,
        endY, // End at bottom of toNode
      ];
    } else {
      const adjustedStartX =
        startX + (toX < fromX ? horizontalOffset : -horizontalOffset);
      const adjustedEndX =
        endX + (fromX < toX ? horizontalOffset : -horizontalOffset);
      const adjustedStartY =
        startY + (toY < fromY ? verticalOffset : -verticalOffset);
      const adjustedEndY =
        endY + (fromY < toY ? verticalOffset : -verticalOffset);

      return [
        startX,
        startY, // Start at specified anchor of fromNode
        adjustedStartX,
        startY, // Horizontal to nearest side
        adjustedStartX,
        adjustedStartY, // Vertical past toNode
        adjustedEndX,
        adjustedStartY, // Horizontal align
        adjustedEndX,
        adjustedEndY, // Vertical to nearest side
        endX,
        endY, // End at specified anchor of toNode
      ];
    }
  }
  // Case 4: Default - use Manhattan bend when close but not intersecting
  else {
    const midX = (startX + endX) / 2;
    return [
      startX,
      startY, // Start at specified anchor of fromNode
      startX,
      startY + bendOffset, // Vertical to offset
      midX,
      startY + bendOffset, // Horizontal to midpoint
      midX,
      endY - bendOffset, // Vertical to offset
      endX,
      endY - bendOffset, // Horizontal to align
      endX,
      endY, // Vertical to end at toNode
    ];
  }
};
