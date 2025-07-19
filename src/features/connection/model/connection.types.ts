export enum ConnectionAnchorSide {
  LEFT = "left",
  RIGHT = "right",
  TOP = "top",
  BOTTOM = "bottom",
}

export const OppositeSides = {
  [ConnectionAnchorSide.LEFT]: ConnectionAnchorSide.RIGHT,
  [ConnectionAnchorSide.RIGHT]: ConnectionAnchorSide.LEFT,
  [ConnectionAnchorSide.TOP]: ConnectionAnchorSide.BOTTOM,
  [ConnectionAnchorSide.BOTTOM]: ConnectionAnchorSide.TOP,
};
