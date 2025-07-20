import { useEffect, useMemo, useRef, useState } from 'react';
import { Arrow } from 'react-konva';

import { type Arrow as ArrowType } from 'konva/lib/shapes/Arrow';
import { useParams } from 'react-router-dom';
import { getColor } from 'shared';
import { calculateConnectionPoints } from '../model';
import { findNode } from 'entities/node';
import type { Connection as ConnectionType } from 'entities/block';
import type { Group } from 'konva/lib/Group';
import { getConnectionId } from '../model/connection-arrow';

interface ConnectionProps {
  connection: ConnectionType;
}

export const Connection = (props: ConnectionProps) => {
  const [points, setPoints] = useState<number[]>([]);
  const ref = useRef<ArrowType>(null);
  const params = useParams();
  const id = useMemo(() => params.id || 'default', [params.id]);
  useEffect(() => {
    ref.current?.moveToBottom();
    const from = props.connection.from;
    if (!from) return;
    const fromNode = findNode(id, from) as Group | undefined;
    if (!fromNode) return;
    const connectionPoints = calculateConnectionPoints(
      fromNode,
      props.connection
    );
    if (connectionPoints) setPoints(connectionPoints);
  }, [id, props.connection]);
  if (!props.connection || !props.connection.from) {
    return null; // No connection to draw
  }
  return (
    <Arrow
      id={
        props.connection.from &&
        props.connection.to &&
        getConnectionId(props.connection.from, props.connection.to)
      }
      ref={ref}
      fillEnabled={false}
      stroke={getColor('--color-gray-400')}
      pointerWidth={10}
      pointerLength={5}
      hitStrokeWidth={20}
      lineCap="round"
      points={points}
    />
  );
};
