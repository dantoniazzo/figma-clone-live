import { getTransformer } from 'entities/transformer';
import { deSelectBlocks, selectBlock } from 'features/block-mutation';
import { setConnectionAnchors } from 'features/connection/model/connection-anchor';
import { Node } from 'konva/lib/Node';

export const getSelectedNode = (stageId: string) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    const transformerNodes = transformer.nodes();
    if (transformerNodes && transformerNodes.length === 1)
      return transformerNodes[0];
  }
};

export const getSelectedNodes = (stageId: string) => {
  const transformer = getTransformer(stageId);
  if (transformer) return transformer.nodes();
};

export const selectNode = (stageId: string, node: Node) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    selectBlock(stageId, {
      id: node.id(),
      type: node.getAttr('blockType'),
    });
    transformer.nodes([node]);
    setConnectionAnchors(stageId);
  }
};

export const selectNodes = (stageId: string, nodes: Node[]) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    transformer.nodes(nodes);
    setConnectionAnchors(stageId);
    if (nodes.length === 1) {
      selectBlock(stageId, {
        id: nodes[0].id(),
        type: nodes[0].getAttr('blockType'),
      });
    }
  }
};

export const unSelectAllNodes = (stageId: string) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    transformer.keepRatio(false);
    transformer.nodes([]);
    deSelectBlocks(stageId, {});
  }
};
