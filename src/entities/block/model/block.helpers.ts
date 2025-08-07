import { getLayer } from "entities/layer";
import { blockConfig } from "./block.config";
import { findNode, getRectFromGroup } from "entities/node";
import type { Group } from "konva/lib/Group";
import type { Rect } from "shared/model";
import { ConnectionAnchorSide } from "features/connection";
import { BlockTypes } from "./block.types";
import { getLineRectFromPoints } from "features/line";
import { reScaleRect } from "features/scale";
import { getStageIdFromNode } from "entities/stage";

export const getBlockNodes = (id: string) => {
  const layer = getLayer(id);
  if (!layer) return null;

  const nodes = layer.find(`.${blockConfig.name}`);
  return nodes.length > 0 ? nodes : null;
};

export const getFarRightNode = (id: string) => {
  const blockNodes = getBlockNodes(id);
  if (!blockNodes) return null;
  let farRightNode = blockNodes[0];
  blockNodes.forEach((node) => {
    if (node.x() > farRightNode.x()) {
      farRightNode = node;
    }
  });
  return farRightNode;
};

export const getAllBlocks = (id: string) => {
  const layer = getLayer(id);
  if (!layer) return null;
  return layer?.find(`.${blockConfig.name}`) as Group[];
};

export const getBlockRect = (stageId: string, id: string): Rect | null => {
  const node = findNode(stageId, id);
  if (!node) return null;
  const allNodes = getAllBlocks(stageId);
  if (!allNodes || allNodes.length === 0) return null;
  return getBlockRectFromNode(node as Group);
};

export const getBlockClientRect = (
  stageId: string,
  id: string
): Rect | null => {
  const node = findNode(stageId, id);
  if (!node) return null;
  const allNodes = getAllBlocks(stageId);
  if (!allNodes || allNodes.length === 0) return null;
  return getBlockClientRectFromNode(node as Group);
};

export const getBlockRectFromNode = (node: Group): Rect | null => {
  if (!node) return null;
  const type = node.getAttr("blockType");
  if (!type) return null;
  if (type === BlockTypes.LINE) {
    const points = node.getAttr("points");
    if (!points || points.length < 4) return null;
    return getLineRectFromPoints(points);
  } else {
    return {
      x: node.x(),
      y: node.y(),
      width: getRectFromGroup(node as Group).width(),
      height: getRectFromGroup(node as Group).height(),
    };
  }
};

export const getBlockClientRectFromNode = (node: Group): Rect | null => {
  if (!node) return null;
  const type = node.getAttr("blockType");
  if (!type) return null;
  if (type === BlockTypes.LINE) {
    const points = node.getAttr("points");
    if (!points || points.length < 4) return null;
    const rect = getLineRectFromPoints(points);
    const stageId = getStageIdFromNode(node);
    if (!stageId) return null;
    const unScaledRect = reScaleRect(stageId, rect);
    if (!unScaledRect) return null;
    return unScaledRect;
  } else {
    return node.getClientRect();
  }
};

export const getNearestBlock = (stageId: string, id: string): Group | null => {
  const rect = getBlockRect(stageId, id);
  if (!rect) return null;

  let nearestNode: Group | null = null;
  let minDistance = Infinity;

  // Calculate center point of the reference node
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const allBlocks = getAllBlocks(stageId);
  if (!allBlocks) return null;
  const node = findNode(stageId, id);
  // Iterate through all nodes to find the nearest one
  for (const otherNode of allBlocks) {
    // Skip the reference node itself
    if (otherNode === node) continue;

    // Ensure the node is a Group and has valid position and size
    const otherPosition = otherNode.position();
    const otherSize = getRectFromGroup(otherNode).size();

    if (otherPosition && otherSize) {
      // Calculate center point of the other node
      const otherCenterX = otherPosition.x + otherSize.width / 2;
      const otherCenterY = otherPosition.y + otherSize.height / 2;

      // Calculate Euclidean distance between centers
      const distance = Math.sqrt(
        Math.pow(centerX - otherCenterX, 2) +
          Math.pow(centerY - otherCenterY, 2)
      );

      // Update nearest node if this distance is smaller
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = otherNode;
      }
    }
  }

  return nearestNode;
};

export const getNearestBlockOnXAxis = (
  stageId: string,
  id: string,
  direction?: ConnectionAnchorSide.LEFT | ConnectionAnchorSide.RIGHT
): Group | null => {
  const rect = getBlockRect(stageId, id);
  if (!rect) return null;

  let nearestNode: Group | null = null;
  let minDistance = Infinity;

  // Calculate center point X of the reference node
  const centerX = rect.x + rect.width / 2;
  const allBlocks = getAllBlocks(stageId);
  if (!allBlocks) return null;
  const node = findNode(stageId, id);

  // Iterate through all nodes to find the nearest one on X-axis
  for (const otherNode of allBlocks) {
    // Skip the reference node itself
    if (otherNode === node) continue;

    // Ensure the node is a Group and has valid position and size
    const otherPosition = otherNode.position();
    const otherSize = getRectFromGroup(otherNode).size();

    if (otherPosition && otherSize) {
      // Calculate center point X of the other node
      const otherCenterX = otherPosition.x + otherSize.width / 2;

      // Check direction constraint if specified
      if (direction === ConnectionAnchorSide.LEFT && otherCenterX >= centerX)
        continue;
      if (direction === ConnectionAnchorSide.RIGHT && otherCenterX <= centerX)
        continue;

      // Calculate absolute distance on X-axis
      const distance = Math.abs(centerX - otherCenterX);

      // Update nearest node if this distance is smaller
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = otherNode;
      }
    }
  }

  return nearestNode;
};

export const getNearestBlockOnYAxis = (
  stageId: string,
  id: string,
  direction?: ConnectionAnchorSide.TOP | ConnectionAnchorSide.BOTTOM
): Group | null => {
  const rect = getBlockRect(stageId, id);
  if (!rect) return null;

  let nearestNode: Group | null = null;
  let minDistance = Infinity;

  // Calculate center point Y of the reference node
  const centerY = rect.y + rect.height / 2;
  const allBlocks = getAllBlocks(stageId);
  if (!allBlocks) return null;
  const node = findNode(stageId, id);

  // Iterate through all nodes to find the nearest one on Y-axis
  for (const otherNode of allBlocks) {
    // Skip the reference node itself
    if (otherNode === node) continue;

    // Ensure the node is a Group and has valid position and size
    const otherPosition = otherNode.position();
    const otherSize = getRectFromGroup(otherNode).size();

    if (otherPosition && otherSize) {
      // Calculate center point Y of the other node
      const otherCenterY = otherPosition.y + otherSize.height / 2;

      // Check direction constraint if specified
      if (direction === ConnectionAnchorSide.TOP && otherCenterY >= centerY)
        continue;
      if (direction === ConnectionAnchorSide.BOTTOM && otherCenterY <= centerY)
        continue;

      // Calculate absolute distance on Y-axis
      const distance = Math.abs(centerY - otherCenterY);

      // Update nearest node if this distance is smaller
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = otherNode;
      }
    }
  }

  return nearestNode;
};

export const getNearestBlockInDirection = (
  stageId: string,
  id: string,
  direction: ConnectionAnchorSide
): Group | null => {
  const rect = getBlockRect(stageId, id);
  if (!rect) return null;

  let nearestNode: Group | null = null;
  let minDistance = Infinity;

  // Get edges of the reference node
  const leftEdge = rect.x;
  const rightEdge = rect.x + rect.width;
  const topEdge = rect.y;
  const bottomEdge = rect.y + rect.height;

  const allBlocks = getAllBlocks(stageId);
  if (!allBlocks) return null;
  const node = findNode(stageId, id);

  // Iterate through all nodes to find the nearest one in the specified direction
  for (const otherNode of allBlocks) {
    // Skip the reference node itself
    if (otherNode === node) continue;

    // Ensure the node is a Group and has valid position and size
    const otherPosition = otherNode.position();
    const otherSize = getRectFromGroup(otherNode).size();

    if (otherPosition && otherSize) {
      // Get edges of the other node
      const otherLeftEdge = otherPosition.x;
      const otherRightEdge = otherPosition.x + otherSize.width;
      const otherTopEdge = otherPosition.y;
      const otherBottomEdge = otherPosition.y + otherSize.height;

      // Check intersection on the opposite axis
      const yAxisIntersects =
        rect.y <= otherTopEdge + otherSize.height &&
        otherTopEdge <= rect.y + rect.height;
      const xAxisIntersects =
        rect.x <= otherLeftEdge + otherSize.width &&
        otherLeftEdge <= rect.x + rect.width;

      let distance: number;
      // Check direction constraint and calculate edge-to-edge distance
      if (
        direction === ConnectionAnchorSide.LEFT &&
        otherRightEdge <= leftEdge &&
        yAxisIntersects
      ) {
        distance = Math.abs(leftEdge - otherRightEdge);
      } else if (
        direction === ConnectionAnchorSide.RIGHT &&
        otherLeftEdge >= rightEdge &&
        yAxisIntersects
      ) {
        distance = Math.abs(otherLeftEdge - rightEdge);
      } else if (
        direction === ConnectionAnchorSide.TOP &&
        otherBottomEdge <= topEdge &&
        xAxisIntersects
      ) {
        distance = Math.abs(topEdge - otherBottomEdge);
      } else if (
        direction === ConnectionAnchorSide.BOTTOM &&
        otherTopEdge >= bottomEdge &&
        xAxisIntersects
      ) {
        distance = Math.abs(otherTopEdge - bottomEdge);
      } else {
        continue; // Skip nodes that don't match the direction or intersection condition
      }

      // Update nearest node if this distance is smaller
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = otherNode;
      }
    }
  }

  return nearestNode;
};
