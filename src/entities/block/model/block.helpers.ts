import { getLayer } from 'entities/layer';
import { config } from './block.config';

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
