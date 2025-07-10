import { useEffect, useMemo, useRef, useState } from 'react';
import { Arrow } from 'react-konva';
import Konva from 'konva';
import { type Arrow as ArrowType } from 'konva/lib/shapes/Arrow';
import { useParams } from 'react-router-dom';
import { getColor } from 'shared';
import { getUpdatedPoints } from '../model';
import { findNode } from 'entities/node';
import type { Connection as ConnectionType } from 'entities/block';
import type { Position } from 'shared/model';
import type { Group } from 'konva/lib/Group';

interface ConnectionProps {
  connection: ConnectionType;
  position: Position;
}

export const Connection = (props: ConnectionProps) => {
  const [points, setPoints] = useState<number[]>([]);
  const ref = useRef<ArrowType>(null);
  const params = useParams();
  const id = useMemo(() => params.id || 'default', [params.id]);
  useEffect(() => {
    const parent = ref.current?.getParent();
    if (!parent) return;
    ref.current?.moveToBottom();
    const from = props.connection?.from;
    const to = props.connection?.to;
    // Only handle one type of connection per arrow
    // If this is a "from" connection, draw arrow from the referenced node to this node
    if (from) {
      const fromNode = findNode(id, from);
      if (fromNode && parent) {
        const calculatedPoints = getUpdatedPoints({
          fromNode: fromNode,
          toNode: parent,
        });
        setPoints(calculatedPoints);
      }
    }
    if (to) {
      const toNode = findNode(id, to);
      if (toNode && parent) {
        (
          (toNode as Group).children.find(
            (child) => child instanceof Konva.Arrow
          ) as Konva.Arrow
        ).points(
          getUpdatedPoints({
            fromNode: parent,
            toNode: toNode,
          })
        );
      }
    }
  }, [id, props.connection, props.position]);
  if (!props.connection || !props.connection.from) {
    return null; // No connection to draw
  }
  return (
    <Arrow
      ref={ref}
      fillEnabled={false}
      stroke={getColor('--color-gray-300')}
      pointerWidth={10}
      pointerLength={5}
      dash={[5, 5]}
      hitStrokeWidth={20}
      points={points}
    />
  );
};
