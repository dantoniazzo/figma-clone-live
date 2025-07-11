import { getTransformer } from 'entities/transformer';
import { Node } from 'konva/lib/Node';

export const selectNode = (stageId: string, node: Node) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    transformer.nodes([node]);
  }
};

export const selectNodes = (stageId: string, nodes: Node[]) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    transformer.nodes(nodes);
  }
};

export const unSelectAllNodes = (stageId: string) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    transformer.nodes([]);
  }
};
