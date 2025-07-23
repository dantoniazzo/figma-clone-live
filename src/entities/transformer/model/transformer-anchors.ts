import { getTransformer } from "./transformer";

export enum AnchorTypes {
  TOP_LEFT = "top-left",
  TOP_CENTER = "top-center",
  TOP_RIGHT = "top-right",
  MIDDLE_RIGHT = "middle-right",
  MIDDLE_LEFT = "middle-left",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_RIGHT = "bottom-right",
  BOTTOM_CENTER = "bottom-center",
}

export const ALL_ANCHORS = [
  AnchorTypes.TOP_LEFT,
  AnchorTypes.TOP_CENTER,
  AnchorTypes.TOP_RIGHT,
  AnchorTypes.MIDDLE_RIGHT,
  AnchorTypes.MIDDLE_LEFT,
  AnchorTypes.BOTTOM_LEFT,
  AnchorTypes.BOTTOM_CENTER,
  AnchorTypes.BOTTOM_RIGHT,
];

export const HORIZONTAL_ANCHORS = ["middle-left", "middle-right"];
export const VERTICAL_ANCHORS = ["top-center", "bottom-center"];
export const DIAGONAL_ANCHORS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];
export const TOP_DIAGONAL_ANCHORS = ["top-left", "top-right"];
export const BOTTOM_DIAGONAL_ANCHORS = ["bottom-left", "bottom-right"];
export const MIDDLE_ANCHORS = [
  "middle-left",
  "middle-right",
  "top-center",
  "bottom-center",
];
export const TOP_ANCHORS = ["top-left", "top-right", "top-center"];
export const BOTTOM_ANCHORS = ["bottom-left", "bottom-right", "bottom-center"];
export const LEFT_ANCHORS = ["top-left", "bottom-left", "middle-left"];
export const RIGHT_ANCHORS = ["top-right", "bottom-right", "middle-right"];
export const TEXT_ANCHORS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "middle-right",
  "middle-left",
];

export const TOP_ANCHOR_ID = "connection-anchor-top";
export const RIGHT_ANCHOR_ID = "connection-anchor-right";
export const BOTTOM_ANCHOR_ID = "connection-anchor-bottom";
export const LEFT_ANCHOR_ID = "connection-anchor-left";

export const ANCHOR_NAME = "connection-anchor";

export const getAllowedAnchors = () => {
  return ALL_ANCHORS;
};

export const getActiveAnchor = (id: string) => {
  const transformer = getTransformer(id);
  return transformer?.getActiveAnchor();
};

export const isHorizontalAnchor = (id: string) => {
  const activeAnchor = getActiveAnchor(id);
  if (!activeAnchor) return false;
  return HORIZONTAL_ANCHORS.includes(activeAnchor);
};

export const isVerticalAnchor = (id: string) => {
  const activeAnchor = getActiveAnchor(id);
  if (!activeAnchor) return false;
  return VERTICAL_ANCHORS.includes(activeAnchor);
};

export const isDiagonalAnchor = (id: string) => {
  const activeAnchor = getActiveAnchor(id);
  if (!activeAnchor) return false;
  return DIAGONAL_ANCHORS.includes(activeAnchor);
};

export const isTopDiagonalAnchor = (id: string) => {
  const activeAnchor = getActiveAnchor(id);
  if (!activeAnchor) return false;
  return TOP_DIAGONAL_ANCHORS.includes(activeAnchor);
};

export const isBottomDiagonalAnchor = (id: string) => {
  const activeAnchor = getActiveAnchor(id);
  if (!activeAnchor) return false;
  return BOTTOM_DIAGONAL_ANCHORS.includes(activeAnchor);
};

export const isTopLeftAnchor = (id: string) => {
  const activeAnchor = getActiveAnchor(id);
  if (!activeAnchor) return false;
  return activeAnchor === AnchorTypes.TOP_LEFT;
};

export const isTopRightAnchor = (id: string) => {
  const activeAnchor = getActiveAnchor(id);
  if (!activeAnchor) return false;
  return activeAnchor === AnchorTypes.TOP_RIGHT;
};

export const isBottomLeftAnchor = (id: string) => {
  const activeAnchor = getActiveAnchor(id);
  if (!activeAnchor) return false;
  return activeAnchor === AnchorTypes.BOTTOM_LEFT;
};
