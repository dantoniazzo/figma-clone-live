import { getRectFromGroup } from "entities/node";
import { getTransformer } from "entities/transformer";
import { basicRectangleConfig } from "features/rectangle";
import type { Group } from "konva/lib/Group";
import { Node } from "konva/lib/Node";

export const selectNode = (stageId: string, node: Node) => {
  const rect = getRectFromGroup(node as Group);

  rect.setAttr("shadowColor", basicRectangleConfig.selectedShadowColor);
  rect.setAttr("stroke", basicRectangleConfig.selectedStroke);
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
      const rect = getRectFromGroup(node as Group);

      rect.setAttr("shadowColor", basicRectangleConfig.shadowColor);
      rect.setAttr("stroke", basicRectangleConfig.stroke || "");
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
