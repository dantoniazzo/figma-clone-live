import { Group, Rect, Image } from "react-konva";
import { config, type IBlock } from "entities/block";
import { getStageIdFromEvent, type KonvaDragEvent } from "entities/stage";
import { selectNode } from "features/selection";
import { type Group as GroupType } from "konva/lib/Group";
import { Connection } from "features/connection";
import { updateConnectionsFromEvent } from "features/connection";
import { useRef } from "react";
import { BlockEvents, mutationEvent } from "features/block-mutation";
import { calculateGridCoordinates, getSnapSize } from "features/grid";
import type { Rect as RectType } from "konva/lib/shapes/Rect";
import type { Image as ImageType } from "konva/lib/shapes/Image";

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
        const rect = imageRef.current;
        if (!rect) return;
        const group = e.target as GroupType;
        const x = e.target.x();
        const y = e.target.y();
        console.log("Scale: ", group.scaleX(), group.scaleY());
        const width = rect.width() * group.scaleX();
        const height = rect.height() * group.scaleY();
        console.log("onTransform", width, height);
        const gridSize = getSnapSize({
          width,
          height,
        });
        rect.width(gridSize.width);
        rect.height(gridSize.height);

        /*   const gridPosition = calculateGridCoordinates({
          x,
          y,
        });
        e.target.position(gridPosition); */
        group.scaleX(1);
        group.scaleY(1);
      }}
    >
      <Rect image={undefined} ref={imageRef} {...rest} />
      {/*  <Connection connection={props.connection} position={props.position} /> */}
    </Group>
  );
};
