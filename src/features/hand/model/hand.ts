import { getAllNodes } from 'entities/node';
import { getStage, getStageElement } from 'entities/stage';

export const enableStageDragging = (id: string) => {
  const stageElement = getStageElement(id);
  const stage = getStage(id);
  if (!stageElement || !stage) return;
  stageElement.style.cursor = 'grab';
  stageElement.style.cursor = '-webkit-grab';
  stageElement.style.cursor = '-moz-grab';
  stageElement.style.cursor = '-ms-grab';
  stageElement.style.cursor = '-o-grab';

  stage.setAttr('draggable', true);
};

export const disableStageDragging = (id: string) => {
  const stageElement = getStageElement(id);
  const stage = getStage(id);
  if (!stageElement || !stage) return;
  stageElement.style.cursor = 'default';
  stageElement.style.cursor = '-webkit-default';
  stageElement.style.cursor = '-moz-default';
  stageElement.style.cursor = '-ms-default';
  stageElement.style.cursor = '-o-default';

  stage.setAttr('draggable', false);
};

export const disableDraggableNodes = (id: string) => {
  const nodes = getAllNodes(id);
  if (!nodes) return;
  nodes.forEach((node) => {
    node.draggable(false);
  });
};

export const enableDraggableNodes = (id: string) => {
  const nodes = getAllNodes(id);
  if (!nodes) return;
  nodes.forEach((node) => {
    node.draggable(true);
  });
};

export const enableHandTool = (id: string) => {
  enableStageDragging(id);
  disableDraggableNodes(id);
};

export const disableHandTool = (id: string) => {
  disableStageDragging(id);
  enableDraggableNodes(id);
};

export const handleDragStart = (id: string) => {
  const stageElement = getStageElement(id);
  if (!stageElement) return;
  stageElement.style.cursor = 'grabbing';
  stageElement.style.cursor = '-webkit-grabbing';
  stageElement.style.cursor = '-moz-grabbing';
  stageElement.style.cursor = '-ms-grabbing';
  stageElement.style.cursor = '-o-grabbing';
};

export const handleDragEnd = (id: string) => {
  const stageElement = getStageElement(id);
  if (!stageElement) return;
  stageElement.style.cursor = 'grab';
  stageElement.style.cursor = '-webkit-grab';
  stageElement.style.cursor = '-moz-grab';
  stageElement.style.cursor = '-ms-grab';
  stageElement.style.cursor = '-o-grab';
};
