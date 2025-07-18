import type { Transformer } from 'konva/lib/shapes/Transformer';
import { ConnectionAnchorSide } from '../model';
import { ConnectionAnchor } from './ConnectionAnchor';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Circle } from 'konva/lib/shapes/Circle';
import { getStageIdFromNode } from 'entities/stage';
import { setConnectionAnchors } from '../model/connection-anchor';

export interface ConnectionAnchorsProps {
  transformer: Transformer;
}

export const ConnectionAnchors = (props: ConnectionAnchorsProps) => {
  const { transformer } = props;
  const left = useRef<Circle | null>(null);
  const right = useRef<Circle | null>(null);
  const top = useRef<Circle | null>(null);
  const bottom = useRef<Circle | null>(null);

  const id = useMemo(() => {
    return getStageIdFromNode(transformer);
  }, [transformer]);

  const setTransformerCircles = useCallback(() => {
    if (!id) return;
    setConnectionAnchors(id);
  }, [id]);

  useEffect(() => {
    setTransformerCircles();
    transformer.on('transform', setTransformerCircles);
    return () => {
      transformer.off('transform', setTransformerCircles);
    };
  }, [transformer, setTransformerCircles]);

  return (
    <>
      <ConnectionAnchor ref={left} side={ConnectionAnchorSide.LEFT} />
      <ConnectionAnchor ref={right} side={ConnectionAnchorSide.RIGHT} />
      <ConnectionAnchor ref={top} side={ConnectionAnchorSide.TOP} />
      <ConnectionAnchor ref={bottom} side={ConnectionAnchorSide.BOTTOM} />
    </>
  );
};
