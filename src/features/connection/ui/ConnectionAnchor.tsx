import Konva from "konva";
import { Circle } from "react-konva";
import {
  ConnectionAnchorSide,
  getUpdatedPoints,
  OppositeSides,
} from "../model";
import { getTool, Tools } from "widgets";
import { connectionConfig } from "../lib";
import { getColor } from "shared";
import type { Circle as CircleType } from "konva/lib/shapes/Circle";
import { getTransformerFromEvent } from "entities/transformer";
import { getNearestBlockInDirection } from "entities/block";
import { getStageIdFromEvent } from "entities/stage";
import { getLayer } from "entities/layer";
import type { Group } from "konva/lib/Group";

interface ConnectionAnchorProps {
  ref: React.Ref<CircleType>;
  side: ConnectionAnchorSide;
}

export const ConnectionAnchor = (props: ConnectionAnchorProps) => {
  return (
    <Circle
      ref={props.ref}
      side={props.side}
      name={connectionConfig.name}
      width={10}
      height={10}
      stroke={"--color-gray-500"}
      fill={getColor("--color-primary-100")}
      hitStrokeWidth={20}
      onPointerEnter={(e) => {
        const transformer = getTransformerFromEvent(e);
        if (transformer && transformer.nodes().length === 1) {
          const node = transformer.nodes()[0] as Group;
          const stageId = getStageIdFromEvent(e);
          if (!stageId) return;
          const nearestBlock = getNearestBlockInDirection(
            stageId,
            node.getAttr("id"),
            props.side
          );
          if (!nearestBlock) return;
          const arrow = new Konva.Arrow({
            id: "preview-arrow",
            stroke: getColor("--color-gray-400"),
            points: getUpdatedPoints({
              fromNode: node,
              toNode: nearestBlock,
              fromSide: props.side,
              toSide: OppositeSides[props.side],
            }),
          });

          const layer = getLayer(stageId);
          layer?.add(arrow);
          layer?.batchDraw();
        }
        if (getTool() === Tools.HAND) return;
        e.target.to({
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 0.1,
        });
      }}
      onPointerLeave={(e) => {
        const stageId = getStageIdFromEvent(e);
        if (!stageId) return;
        const layer = getLayer(stageId);
        const arrows = layer?.find(`#preview-arrow`);
        arrows?.[0]?.remove();
        e.target.to({
          scaleX: 1,
          scaleY: 1,
          duration: 0.1,
        });
      }}
    />
  );
};
