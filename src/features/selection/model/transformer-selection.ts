import { getTransformer } from "entities/transformer";
import { Node } from "konva/lib/Node";

export const selectNode = (stageId: string, node: Node) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    deselectPreviouslySelectedNodes(stageId, node);
    transformer.nodes([node]);
  }
};

export const deselectPreviouslySelectedNodes = (
  stageId: string,
  exclude?: Node
) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    transformer.nodes().forEach((node) => {
      if (node === exclude) return;
    });
  }
};

export const unSelectAllNodes = (stageId: string) => {
  const transformer = getTransformer(stageId);
  if (transformer) {
    deselectPreviouslySelectedNodes(stageId);
    transformer.nodes([]);
  }
};
