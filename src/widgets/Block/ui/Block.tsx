import { Group, Rect } from "react-konva";
import { config, type IBlock } from "entities/block";
import { getStageIdFromEvent, type KonvaDragEvent } from "entities/stage";
import { selectNode } from "features/selection";
import { type Group as GroupType } from "konva/lib/Group";
import { updateConnectionsFromEvent } from "features/connection";
import { useRef } from "react";
import { BlockEvents, mutationEvent } from "features/block-mutation";
import { calculateGridCoordinates, getSnapSize } from "features/grid";
import type { Image as ImageType } from "konva/lib/shapes/Image";
import { getRectFromGroup } from "entities/node";

export const Block = (props: IBlock) => {
  const { name, ...rest } = config;
  const ref = useRef<GroupType>(null);
  const imageRef = useRef<ImageType | null>(null);
  const onDragEnd = (e: KonvaDragEvent) => {
    const stageId = getStageIdFromEvent(e);
    if (!stageId) return;
    mutationEvent(stageId, BlockEvents.UPDATE, {
      ...props,
      position: e.target.position(),
    } as IBlock);
  };

  return (
    <Group
      onPointerUp={(e) => {
        const stageId = getStageIdFromEvent(e);
        if (!stageId || !ref.current) return;
        selectNode(stageId, ref.current);
      }}
      connection={props.connection}
      name={name}
      id={props.id}
      ref={ref}
      blockType={props.type}
      text={props.text}
      position={props.position}
      draggable
      onDragMove={updateConnectionsFromEvent}
      onDragEnd={onDragEnd}
      onTransform={(e) => {
        const group = e.target as GroupType;
        const scaleX = group.scaleX();
        const scaleY = group.scaleY();
        if (scaleX === 0 || scaleY === 0) return;
        group.scaleX(1);
        group.scaleY(1);
        // Reset the scale to 1 to avoid scaling issues
        // when dragging the block after transforming it.
        // This is necessary because Konva does not reset the scale
        // after a transform operation, which can lead to unexpected behavior
        // when dragging the block again.
        // See: https://konvajs.org/docs/api/Group.html#scaleX
        // and https://konvajs.org/docs/api/Group.html#scaleY
        const x = e.target.x();
        const y = e.target.y();
        const gridPosition = calculateGridCoordinates({
          x,
          y,
        });
        e.target.position(gridPosition);
        const rect = getRectFromGroup(group);
        const width = rect.width() * scaleX;
        const height = rect.height() * scaleY;
        const gridSize = getSnapSize({
          width,
          height,
        });
        rect.size(gridSize);
      }}
    >
      <Rect image={undefined} ref={imageRef} {...rest} />
    </Group>
  );
};
