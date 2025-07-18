import { Circle } from 'react-konva';
import type { ConnectionAnchorSide } from '../model';
import { useMemo, useRef } from 'react';
import type { Circle as CircleType } from 'konva/lib/shapes/Circle';
import { getStageIdFromNode } from 'entities/stage';

interface ConnectionAnchorProps {
  side: ConnectionAnchorSide;
}

export const ConnectionAnchor = (props: ConnectionAnchorProps) => {
  const ref = useRef<CircleType | null>(null);

  const stageId = useMemo(() => {
    const node = ref.current;
    if (!node) return null;
    return getStageIdFromNode(node);
  }, [ref]);

  return <Circle ref={ref} visible={!!stageId} x={0} y={0} />;
};
