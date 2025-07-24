import { ConnectionAnchorSide } from "./connection.types";
import { connectionConfig } from "../lib";
import { getTransformer } from "entities/transformer";

export const setConnectionAnchors = (id: string) => {
  const transformer = getTransformer(id);
  if (!transformer) return;
  const width = transformer.width();
  const height = transformer.height();
  const connectionAnchors = transformer.find(`.${connectionConfig.name}`);
  connectionAnchors.forEach((anchor) => {
    const side = anchor.getAttr("side");
    switch (side) {
      case ConnectionAnchorSide.LEFT:
        anchor.position({
          x: -connectionConfig.anchorPadding,
          // 10 is default anchor size so we shift by half of it
          y: height / 2,
        });
        break;
      case ConnectionAnchorSide.RIGHT:
        anchor.position({
          x: width + connectionConfig.anchorPadding,
          // 10 is default anchor size so we shift by half of it
          y: height / 2,
        });
        break;
      case ConnectionAnchorSide.TOP:
        anchor.position({
          x: width / 2,
          // 10 is default anchor size so we shift by half of it
          y: -connectionConfig.anchorPadding,
        });
        break;
      case ConnectionAnchorSide.BOTTOM:
        anchor.position({
          x: width / 2,
          // 10 is default anchor size so we shift by half of it
          y: height + connectionConfig.anchorPadding,
        });
        break;
    }
  });
};

export const hideConnectionAnchors = (id: string) => {
  const transformer = getTransformer(id);
  if (!transformer) return;
  const connectionAnchors = transformer.find(`.${connectionConfig.name}`);
  connectionAnchors.forEach((anchor) => {
    anchor.hide();
  });
};

export const showConnectionAnchors = (id: string) => {
  const transformer = getTransformer(id);
  if (!transformer) return;
  const connectionAnchors = transformer.find(`.${connectionConfig.name}`);
  connectionAnchors.forEach((anchor) => {
    anchor.show();
  });
};
