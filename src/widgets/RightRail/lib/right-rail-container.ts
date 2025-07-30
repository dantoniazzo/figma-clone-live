export const getRightRailContainerId = (stageId: string) => {
  return `right-rail-container-${stageId}`;
};

export const getRightRailContainer = (stageId: string) => {
  return document.getElementById(getRightRailContainerId(stageId));
};
