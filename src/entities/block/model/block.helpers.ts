import { getLayer } from 'entities/layer';
import { config } from './block.config';
import { findNode, getRectFromGroup } from 'entities/node';
import type { Group } from 'konva/lib/Group';

export const getBlockNodes = (id: string) => {
  const layer = getLayer(id);
  if (!layer) return null;

  const nodes = layer.find(`.${config.name}`);
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
  return layer?.find(`.${config.name}`) as Group[];
};

export const getNearestBlock = (stageId: string, id: string): Group | null => {
  const node = findNode(stageId, id);
  if (!node) return null;
  const allNodes = getAllBlocks(stageId);
  if (!allNodes || allNodes.length === 0) return null;
  const position = node.position();
  const size = getRectFromGroup(node as Group).size();
  if (!position || !size) return null;

  let nearestNode: Group | null = null;
  let minDistance = Infinity;

  // Calculate center point of the reference node
  const centerX = position.x + size.width / 2;
  const centerY = position.y + size.height / 2;

  // Iterate through all nodes to find the nearest one
  for (const otherNode of allNodes) {
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
