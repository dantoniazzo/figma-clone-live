import { Group, Rect } from 'react-konva';
import { config, type IBlock } from 'entities/block';
import {
  getStageIdFromEvent,
  getStageIdFromNode,
  type KonvaDragEvent,
} from 'entities/stage';
import { selectNode } from 'features/selection';
import { type Group as GroupType } from 'konva/lib/Group';
import { useEffect, useRef } from 'react';
import {
  BlockEvents,
  mutationEvent,
  updateBlock,
} from 'features/block-mutation';
import { onMoveOnGrid } from 'features/grid';
import type { Image as ImageType } from 'konva/lib/shapes/Image';
import { getRectFromGroup } from 'entities/node';
import { Html } from 'react-konva-utils';
import { getBlockHtmlElement, getBlockHtmlId } from '../lib';
import { unScaleSize } from 'features/scale';
import type { Size } from 'shared/model';

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

  const getUnScaledGroupSize = () => {
    const group = ref.current;
    if (!group) return;
    const stageId = getStageIdFromNode(group);
    if (!stageId) return;
    const clientRect = group.getClientRect();
    if (!clientRect) return;
    return unScaleSize(stageId, {
      width: clientRect.width,
      height: clientRect.height,
    });
  };

  const updateHtmlSizeFromGroup = () => {
    const unScaledGroupSize = getUnScaledGroupSize();
    if (!unScaledGroupSize) return;
    updateHtmlSize(unScaledGroupSize);
  };

  const updateHtmlSize = (size: Size) => {
    const html = getBlockHtmlElement(props.id);
    if (!html) return;
    html.style.width = `${size.width}px`;
    html.style.height = `${size.height}px`;
  };

  useEffect(() => {
    updateHtmlSize(props.size);
  }, [props.size]);

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
      scale={props.scale}
      draggable
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransform={(e) => {
        const stageId = getStageIdFromEvent(e);
        if (!stageId) return;
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
        updateHtmlSizeFromGroup();
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
      <Html
        divProps={{
          id: getBlockHtmlId(props.id),
          style: {
            pointerEvents: 'none',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        Hello world
      </Html>
    </Group>
  );
};
