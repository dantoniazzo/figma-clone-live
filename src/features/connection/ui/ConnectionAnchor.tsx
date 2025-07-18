import { Circle } from 'react-konva';
import { ConnectionAnchorSide } from '../model';
import { getTool, Tools } from 'widgets';
import { connectionConfig } from '../lib';
import { getColor } from 'shared';
import type { Circle as CircleType } from 'konva/lib/shapes/Circle';

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
        if (getTool() === Tools.HAND) return;
        e.target.to({
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 0.1,
        });
      }}
      onPointerLeave={(e) => {
        e.target.to({
          scaleX: 1,
          scaleY: 1,
          duration: 0.1,
        });
      }}
    />
  );
};
