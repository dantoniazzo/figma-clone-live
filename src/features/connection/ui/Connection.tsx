import { useEffect, useMemo, useRef, useState } from 'react';
import { Arrow } from 'react-konva';

import { type Arrow as ArrowType } from 'konva/lib/shapes/Arrow';
import { useParams } from 'react-router-dom';
import { getColor } from 'shared';
import { getUpdatedPoints } from '../model';
import { findNode } from 'entities/node';
import type { Connection as ConnectionType } from 'entities/block';
import type { Group } from 'konva/lib/Group';
import { getConnectionId } from '../lib';
import { getLayer } from 'entities/layer';

interface ConnectionProps {
  connection: ConnectionType;
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
    const to = props.connection.to;
    const from = props.connection.from;
    const fromSide = props.connection.fromSide;
    const toSide = props.connection.toSide;
    // Only handle one type of connection per arrow
    // If this is a "from" connection, draw arrow from the referenced node to this node
    if (to && fromSide && toSide) {
      const toNode = findNode(id, to);
      if (toNode && parent) {
        const calculatedPoints = getUpdatedPoints({
          fromNode: parent as Group,
          toNode: toNode as Group,
          fromSide,
          toSide,
        });
        setPoints(calculatedPoints);
      }
    }
    if (from && fromSide && toSide) {
      const fromNode = findNode(id, from);
      if (fromNode && parent) {
        const arrows = getLayer(id)?.find(
          `#${getConnectionId(props.connection.from || '')}`
        );
        if (arrows && arrows.length > 0) {
          const arrow = arrows[0];
          (arrow as ArrowType).points(
            getUpdatedPoints({
              fromNode: fromNode as Group,
              toNode: parent as Group,
              fromSide,
              toSide,
            })
          );
        }
      }
    }
  }, [id, props.connection]);
  if (!props.connection || !props.connection.from) {
    return null; // No connection to draw
  }
  return (
    <Arrow
      id={getConnectionId(props.connection.from)}
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
