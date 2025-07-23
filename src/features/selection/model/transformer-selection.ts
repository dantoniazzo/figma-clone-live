import { BlockTypes } from "entities/block";
import { getTransformer } from "entities/transformer";
import { setConnectionAnchors } from "features/connection/model/connection-anchor";
import { Node } from "konva/lib/Node";

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
    const type = node.getAttr("blockType");
    if (type && type === BlockTypes.TEXT) {
      transformer.keepRatio(true);
    }
    transformer.nodes([node]);
    setConnectionAnchors(stageId);
  }
};

export const selectNodes = (stageId: string, nodes: Node[]) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    transformer.nodes(nodes);
    setConnectionAnchors(stageId);
  }
};

export const unSelectAllNodes = (stageId: string) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    transformer.keepRatio(false);
    transformer.nodes([]);
  }
};
