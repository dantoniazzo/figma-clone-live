import { getColor } from "shared/utils";
import { Transformer as KonvaTransformer } from "react-konva";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";
import { getStage, getStageIdFromNode } from "entities/stage";
import {
  reScalePosition,
  reScaleSize,
  unScalePosition,
  unScaleSize,
} from "features/scale";
import { FULL_SIZE, snapToGrid } from "features/grid";
import { useRef } from "react";
import { ConnectionAnchors } from "features/connection";

export const Transformer = () => {
  const ref = useRef<TransformerType | null>(null);
  return (
    <KonvaTransformer
      ref={ref}
      keepRatio={false}
      anchorCornerRadius={2}
      anchorStroke={getColor("--color-primary-100")}
      anchorStrokeWidth={2}
      anchorFill="black"
      resizeEnabled={true}
      rotateEnabled={false}
      borderEnabled={true}
      borderStroke={getColor("--color-primary-100")}
      borderStrokeWidth={2}
      ignoreStroke={true}
      boundBoxFunc={(oldBox, newBox) => {
        const transformer = ref.current;
        if (!transformer) return newBox;
        const stageId = getStageIdFromNode(transformer);
        if (!stageId) return newBox;
        const stage = getStage(stageId);
        if (!stage) return newBox;
        const position = { x: newBox.x, y: newBox.y };
        const size = { width: newBox.width, height: newBox.height };
        const unScaledPosition = unScalePosition(stageId, position);
        const unScaledSize = unScaleSize(stageId, size);
        if (!unScaledPosition || !unScaledSize) return newBox;
        const snappedWidth = Math.max(
          FULL_SIZE,
          snapToGrid(unScaledSize.width)
        );
        const snappedHeight = Math.max(
          FULL_SIZE,
          snapToGrid(unScaledSize.height)
        );

        const deltaWidth = snappedWidth - unScaledSize.width;
        const deltaHeight = snappedHeight - unScaledSize.height;

        let adjustedX = unScaledPosition.x;
        let adjustedY = unScaledPosition.y;

        if (deltaWidth !== 0) {
          if (newBox.x === oldBox.x) {
            adjustedX = snapToGrid(unScaledPosition.x);
          } else {
            adjustedX = snapToGrid(unScaledPosition.x - deltaWidth);
          }
        } else {
          adjustedX = snapToGrid(unScaledPosition.x);
        }

        if (deltaHeight !== 0) {
          if (newBox.y === oldBox.y) {
            adjustedY = snapToGrid(unScaledPosition.y);
          } else {
            adjustedY = snapToGrid(unScaledPosition.y - deltaHeight);
          }
        } else {
          adjustedY = snapToGrid(unScaledPosition.y);
        }

        const reScaledPosition = reScalePosition(stageId, {
          x: adjustedX,
          y: adjustedY,
        });

        const reScaledSize = reScaleSize(stageId, {
          width: snappedWidth,
          height: snappedHeight,
        });
        if (!reScaledPosition || !reScaledSize) return newBox;

        return {
          x: reScaledPosition.x,
          y: reScaledPosition.y,
          width: reScaledSize.width,
          height: reScaledSize.height,
          rotation: newBox.rotation,
        };
      }}
    >
      <ConnectionAnchors />
    </KonvaTransformer>
  );
};
