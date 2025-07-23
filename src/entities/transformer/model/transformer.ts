import {
  getStage,
  getStageIdFromEvent,
  type KonvaEvent,
  type KonvaMouseTouchEvent,
} from "entities/stage";
import { Node } from "konva/lib/Node";
import { Transformer } from "konva/lib/shapes/Transformer";
import { TRANSFORMER_KEY } from "../lib";

export const TRANSFORMER_ID = "tranformer";

export const getTransformer = (id: string) => {
  const stage = getStage(id);
  if (!stage) {
    return null;
  }
  return findTransformerOnStage(id);
};

export const getTransformerFromEvent = (
  e: KonvaMouseTouchEvent | KonvaEvent
) => {
  const stageId = getStageIdFromEvent(e);
  if (!stageId) return;
  return getTransformer(stageId);
};

export const findTransformerOnStage = (id: string): Transformer | null => {
  const stage = getStage(id);
  if (!stage) {
    return null;
  }
  const [tranformer] = stage.find((node: Node) => {
    return node.className === TRANSFORMER_KEY;
  });
  return tranformer as Transformer;
};

export const forceUpdateTransformer = (id: string) => {
  const transformer = getTransformer(id);
  if (transformer) {
    transformer.forceUpdate();
  }
};
