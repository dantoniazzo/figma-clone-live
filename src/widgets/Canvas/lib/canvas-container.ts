export const getCanvasContainerId = (stageId: string) => {
  return `canvas-container-${stageId}`;
};

export const getCanvasContainer = (stageId: string) => {
  return document.getElementById(getCanvasContainerId(stageId));
};
