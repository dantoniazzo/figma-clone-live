import { Group, Rect } from 'react-konva';
import { config, type IBlock } from 'entities/block';
import { getStageIdFromEvent, type KonvaDragEvent } from 'entities/stage';
import { selectNode } from 'features/selection';
import { type Group as GroupType } from 'konva/lib/Group';
import { useRef } from 'react';
import {
  BlockEvents,
  mutationEvent,
  updateBlock,
} from 'features/block-mutation';
import { onMoveOnGrid } from 'features/grid';
import type { Image as ImageType } from 'konva/lib/shapes/Image';
import { getRectFromGroup } from 'entities/node';

export const Block = (props: IBlock) => {
  const { name, ...rest } = config;
  const ref = useRef<GroupType>(null);
  const imageRef = useRef<ImageType | null>(null);

  const onDragMove = (e: KonvaDragEvent) => {
    onMoveOnGrid(e);
  };

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
      onPointerDown={(e) => {
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
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransform={(e) => {
        const group = e.target as GroupType;
        const scaleX = group.scaleX();
        const scaleY = group.scaleY();
        if (scaleX === 0 || scaleY === 0) return;
        group.scaleX(1);
        group.scaleY(1);
        const rect = getRectFromGroup(group);
        const width = rect.width() * scaleX;
        const height = rect.height() * scaleY;
        rect.size({ width, height });
      }}
      onTransformEnd={(e) => {
        const stageId = getStageIdFromEvent(e);
        if (!stageId) return;
        const group = e.target as GroupType;
        const rect = getRectFromGroup(group);
        updateBlock(stageId, {
          id: props.id,
          position: {
            x: group.x(),
            y: group.y(),
          },
          size: {
            width: rect.width(),
            height: rect.height(),
          },
          scale: {
            x: group.scaleX(),
            y: group.scaleY(),
          },
        });
      }}
    >
      <Rect
        image={undefined}
        ref={imageRef}
        {...rest}
        width={props.size.width}
        height={props.size.height}
      />
    </Group>
  );
};
