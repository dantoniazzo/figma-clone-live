import Konva from 'konva';
import { getNodeFromEvent } from 'entities/node';
import { type KonvaDragEvent } from 'entities/stage';
import { calculateGridCoordinates } from 'features/grid';
import { Group } from 'konva/lib/Group';
import type { Node } from 'konva/lib/Node';
import { config } from 'entities/block';

export interface UpdateProps {
  fromNode: Node;
  toNode: Node;
}

export const updateConnectionsFromEvent = (e: KonvaDragEvent) => {
  const connection = e.target.getAttr('connection');
  if (!connection) return;
  const gridPosition = calculateGridCoordinates({
    x: e.target.attrs.x,
    y: e.target.attrs.y,
  });
  e.target.position(gridPosition);
  const connectionFromNode = getNodeFromEvent(connection.from, e);
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
      })
    );
  }
};

export const getUpdatedPoints = (props: UpdateProps) => {
  // Get positions and dimensions of both blocks
  const fromX = props.fromNode.x();
  const fromY = props.fromNode.y();
  const toX = props.toNode.x();
  const toY = props.toNode.y();

  const startX = -props.toNode.x() + props.fromNode.x() + config.width;
  const startY = -props.toNode.y() + props.fromNode.y() + config.height / 2;
  const endX = 0;
  const endY = config.height / 2;

  // Routing offset - how far to extend the path around blocks
  const routingOffset = config.width * 0.2;

  // Check if blocks intersect on x-axis
  const intersectsOnXAxis =
    (fromX <= toX && fromX + config.width >= toX) ||
    (toX <= fromX && toX + config.width >= fromX);

  // Check if blocks intersect on y-axis
  const intersectsOnYAxis =
    (fromY <= toY && fromY + config.height >= toY) ||
    (toY <= fromY && toY + config.height >= fromY);

  // Determine the block arrangement
  const toBlockIsLeft = toX + config.width < fromX; // To block is completely to the left

  // Case 1: Use all-around bending when:
  // - Blocks intersect on both axes
  // - OR when to block is completely to the left of from block and they intersect on y-axis
  if (
    (intersectsOnXAxis && intersectsOnYAxis) ||
    (toBlockIsLeft && intersectsOnYAxis)
  ) {
    const fromAbove = fromY < toY;
    const verticalOffset = fromAbove
      ? -routingOffset
      : routingOffset + config.height;

    return [
      startX, // Source x
      startY, // Source y
      startX + routingOffset, // Go right first
      startY, // Same y
      startX + routingOffset, // Continue at offset
      -props.toNode.y() + props.fromNode.y() + verticalOffset, // Go up/down
      -routingOffset, // Go left to approach target from left
      -props.toNode.y() + props.fromNode.y() + verticalOffset, // Same y
      -routingOffset, // Continue approach
      endY, // Target y level
      endX, // Target x
      endY, // Target y
    ];
  }
  // Case 2: Use in-between bending when:
  // - Blocks intersect on x-axis only (one above/below the other)
  // - OR when to block is completely to the left of from block and they don't intersect on y-axis
  else if (
    (intersectsOnXAxis && !intersectsOnYAxis) ||
    (toBlockIsLeft && !intersectsOnYAxis)
  ) {
    const fromAbove = fromY < toY;
    const verticalGap = fromAbove
      ? (toY - (fromY + config.height)) / 2 + fromY + config.height
      : (fromY - (toY + config.height)) / 2 + toY + config.height;
    const relativeVerticalGap = -props.toNode.y() + verticalGap;

    return [
      startX, // Source x
      startY, // Source y
      startX + routingOffset, // First bend slightly right
      startY, // Same y as source
      startX + routingOffset, // Second point maintains x
      relativeVerticalGap, // Midpoint between the blocks vertically
      endX - routingOffset, // Third point approaches from left
      relativeVerticalGap, // Same midpoint y
      endX - routingOffset, // Fourth point maintains x
      endY, // Target y level
      endX, // Target x
      endY, // Target y
    ];
  }
  // Case 3: Default - normal 4-point line
  else {
    const midX = (startX + endX) / 2;

    return [
      startX, // Source x
      startY, // Source y
      midX, // First breakpoint x (halfway between source and target)
      startY, // First breakpoint y (same as source y)
      midX, // Second breakpoint x (same as first breakpoint x)
      endY, // Second breakpoint y (same as target y)
      endX, // Target x
      endY, // Target y
    ];
  }
};
