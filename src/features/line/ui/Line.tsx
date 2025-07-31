import { Group, Shape, Circle, Line as KonvaLine } from 'react-konva';
import { Line as KonvaLineType } from 'konva/lib/shapes/Line';
import { LINE_ANCHOR_NAME } from '../lib';
import { getTool, Tools } from 'widgets';
import { useMemo, useRef } from 'react';
import type { Group as GroupType } from 'konva/lib/Group';
import { getStageIdFromEvent, type KonvaDragEvent } from 'entities/stage';
import { updateBlock } from 'features/block-mutation';
import { debounce } from 'lodash';
import { getColor } from 'shared';
import { LineConfig } from '../model';
import { blockConfig, type IBlock } from 'entities/block';

export const Line = (props: IBlock) => {
  const groupRef = useRef<GroupType | null>(null);
  const firstAnchorLine = useRef<KonvaLineType | null>(null);
  const secondAnchorLine = useRef<KonvaLineType | null>(null);

  const debounceChange = useMemo(
    () =>
      debounce((e: KonvaDragEvent, index: number) => {
        const stageId = getStageIdFromEvent(e);
        if (!stageId || !props.points) return;
        updateBlock(stageId, {
          id: props.id,
          points: props.points.map((point, i) => {
            if (i === index * 2) return e.target.x();
            if (i === index * 2 + 1) return e.target.y();
            return point;
          }),
        });
      }, 300),
    [props.id, props.points]
  );
  if (!props.points) return;
  return (
    <Group
      blockType={props.type}
      name={blockConfig.name}
      id={props.id}
      ref={groupRef}
      draggable
      points={props.points}
    >
      <Shape
        id={props.id}
        stroke={LineConfig.stroke}
        strokeWidth={LineConfig.strokeWidth}
        sceneFunc={(ctx, shape) => {
          const group = groupRef.current;
          if (!group) return;
          const anchor1 = group.findOne(`#${props.id}-anchor0`);
          const anchor2 = group.findOne(`#${props.id}-anchor1`);
          const anchor3 = group.findOne(`#${props.id}-anchor2`);
          const anchor4 = group.findOne(`#${props.id}-anchor3`);
          if (anchor1 && anchor2 && anchor3 && anchor4) {
            ctx.beginPath();
            ctx.moveTo(anchor1.x(), anchor1.y());
            ctx.bezierCurveTo(
              anchor2.x(),
              anchor2.y(),
              anchor3.x(),
              anchor3.y(),
              anchor4.x(),
              anchor4.y()
            );
            ctx.fillStrokeShape(shape);
          }
        }}
      />
      <KonvaLine
        ref={firstAnchorLine}
        points={[
          props.points[0],
          props.points[1],
          props.points[2],
          props.points[3],
        ]}
        stroke={LineConfig.stroke}
        strokeWidth={LineConfig.strokeWidth}
        lineCap="round"
        lineJoin="round"
        id={`${props.id}-line1`}
      />
      <KonvaLine
        ref={secondAnchorLine}
        points={[
          props.points[4],
          props.points[5],
          props.points[6],
          props.points[7],
        ]}
        stroke={LineConfig.stroke}
        strokeWidth={LineConfig.strokeWidth}
        lineCap="round"
        lineJoin="round"
        id={`${props.id}-line2`}
      />
      {[0, 1, 2, 3].map((index) => (
        <Circle
          onDragMove={(e) => {
            const firstAnchorLineNode = firstAnchorLine.current;
            const secondAnchorLineNode = secondAnchorLine.current;
            if (!firstAnchorLineNode || !secondAnchorLineNode) return;
            debounceChange(e, index);
            if (index === 0) {
              firstAnchorLineNode.points([
                e.target.x(),
                e.target.y(),
                firstAnchorLineNode.points()[2],
                firstAnchorLineNode.points()[3],
              ]);
            } else if (index === 1) {
              firstAnchorLineNode.points([
                firstAnchorLineNode.points()[0],
                firstAnchorLineNode.points()[1],
                e.target.x(),
                e.target.y(),
              ]);
            } else if (index === 2) {
              secondAnchorLineNode.points([
                e.target.x(),
                e.target.y(),
                secondAnchorLineNode.points()[2],
                secondAnchorLineNode.points()[3],
              ]);
            } else if (index === 3) {
              secondAnchorLineNode.points([
                secondAnchorLineNode.points()[0],
                secondAnchorLineNode.points()[1],
                e.target.x(),
                e.target.y(),
              ]);
            }
          }}
          onPointerOver={(e) => {
            if (getTool() === Tools.HAND) return;
            e.target.to({
              scaleX: 1.5,
              scaleY: 1.5,
              duration: 0.1,
            });
            e.target.getLayer()?.batchDraw();
          }}
          onPointerOut={(e) => {
            e.target.to({
              scaleX: 1,
              scaleY: 1,
              duration: 0.1,
            });
            e.target.getLayer()?.batchDraw();
          }}
          key={`${props.id}-anchor${index}`}
          id={`${props.id}-anchor${index}`}
          radius={3}
          fill="white"
          stroke={getColor('--color-primary-100')}
          strokeWidth={2}
          draggable
          name={LINE_ANCHOR_NAME}
          x={props.points?.[index * 2]}
          y={props.points?.[index * 2 + 1]}
        />
      ))}
    </Group>
  );
};
