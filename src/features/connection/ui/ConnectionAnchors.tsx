import { ConnectionAnchorSide } from '../model';
import { ConnectionAnchor } from './ConnectionAnchor';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Circle } from 'konva/lib/shapes/Circle';
import { setConnectionAnchors } from '../model/connection-anchor';
import { useParams } from 'react-router-dom';
import { getTransformer } from 'entities/transformer';

export const ConnectionAnchors = () => {
  const left = useRef<Circle | null>(null);
  const right = useRef<Circle | null>(null);
  const top = useRef<Circle | null>(null);
  const bottom = useRef<Circle | null>(null);
  const params = useParams();

  const id = useMemo(() => {
    return params.id || 'default';
  }, [params]);

  const setTransformerCircles = useCallback(() => {
    if (!id) return;
    setConnectionAnchors(id);
  }, [id]);

  useEffect(() => {
    setTransformerCircles();
    const transformer = getTransformer(id);
    transformer?.on('transform', setTransformerCircles);
    return () => {
      transformer?.off('transform', setTransformerCircles);
    };
  }, [id, setTransformerCircles]);

  return (
    <>
      <ConnectionAnchor ref={left} side={ConnectionAnchorSide.LEFT} />
      <ConnectionAnchor ref={right} side={ConnectionAnchorSide.RIGHT} />
      <ConnectionAnchor ref={top} side={ConnectionAnchorSide.TOP} />
      <ConnectionAnchor ref={bottom} side={ConnectionAnchorSide.BOTTOM} />
    </>
  );
};
