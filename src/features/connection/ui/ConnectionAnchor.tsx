import Konva from 'konva';
import { Circle } from 'react-konva';
import {
  ConnectionAnchorSide,
  createConnection,
  getUpdatedPoints,
  OppositeSides,
  sceneFunc,
} from '../model';
import { getTool, Tools } from 'widgets';
import { connectionConfig } from '../lib';
import { getColor } from 'shared';
import type { Circle as CircleType } from 'konva/lib/shapes/Circle';
import { getNearestBlockInDirection } from 'entities/block';
import { getStageIdFromEvent } from 'entities/stage';
import { getLayer } from 'entities/layer';
import type { Group } from 'konva/lib/Group';
import { getSelectedNode } from 'features/selection';

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
      stroke={'--color-gray-500'}
      fill={getColor('--color-primary-100')}
      hitStrokeWidth={20}
      onPointerEnter={(e) => {
        const stageId = getStageIdFromEvent(e);
        if (!stageId) return;
        const selectedNode = getSelectedNode(stageId);
        if (!selectedNode || !selectedNode.hasChildren()) return;
        const nearestBlock = getNearestBlockInDirection(
          stageId,
          selectedNode.getAttr('id'),
          props.side
        );
        if (!nearestBlock) return;
        const arrow = new Konva.Arrow({
          id: 'preview-arrow',
          stroke: getColor('--color-gray-400'),
          sceneFunc: sceneFunc,

          points: getUpdatedPoints({
            fromNode: selectedNode as Group,
            toNode: nearestBlock,
            fromSide: props.side,
            toSide: OppositeSides[props.side],
          }),
        });

        const layer = getLayer(stageId);
        layer?.add(arrow);
        layer?.batchDraw();
        arrow.moveToBottom();

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
      onClick={(e) => {
        createConnection(e, props.side);
      }}
      onTap={(e) => {
        createConnection(e, props.side);
      }}
    />
  );
};
