import { getStage } from "entities/stage";
import { type KonvaEventObject, Node, type NodeConfig } from "konva/lib/Node";
import { type Position, type Size } from "shared/model";

const scaleBy = 1.05;

export const scaleStageOnScroll = (
  e: KonvaEventObject<WheelEvent, Node<NodeConfig>>
) => {
  // stop default scrolling
  e.evt.preventDefault();
  const stage = e.target.getStage();
  if (!stage) return;
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();
  if (!pointer) return;
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  const direction = e.evt.deltaY > 0 ? -1 : 1;

  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  stage.scaleX(newScale);
  stage.scaleY(newScale);

  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };

  stage.position(newPos);
};

export const unScalePosition = (stageId: string, position: Position) => {
  const stage = getStage(stageId);
  if (!stage) return;
  const stageScaleX = stage.scaleX();
  if (!stageScaleX) return;
  return {
    x: position.x / stageScaleX - stage.x() / stageScaleX,
    y: position.y / stageScaleX - stage.y() / stageScaleX,
  };
};

export const reScalePosition = (stageId: string, position: Position) => {
  const stage = getStage(stageId);
  const stageScaleX = stage?.scaleX();
  if (!stage || !stageScaleX) return;
  return {
    x: (position.x + stage.x() / stageScaleX) * stageScaleX,
    y: (position.y + stage.y() / stageScaleX) * stageScaleX,
  };
};

export const unScale = (stageId: string, val: number) => {
  const scaleX = getStage(stageId)?.scaleX();
  if (scaleX) return val / scaleX;
  else return val;
};

export const reScale = (stageId: string, val: number) => {
  const scaleX = getStage(stageId)?.scaleX();
  if (scaleX) return val * scaleX;
  else return val;
};

export const unScaleSize = (stageId: string, size: Size) => {
  const stage = getStage(stageId);
  if (!stage) return;
  return {
    width: size.width / stage.scaleX(),
    height: size.height / stage.scaleX(),
  };
};

export const reScaleSize = (stageId: string, size: Size) => {
  const stage = getStage(stageId);
  if (!stage) return;
  return {
    width: size.width * stage.scaleX(),
    height: size.height * stage.scaleX(),
  };
};
