import { Circle } from 'react-konva';
import { ConnectionAnchorSide } from '../model';
import { useEffect, useRef } from 'react';
import type { Circle as CircleType } from 'konva/lib/shapes/Circle';
import { getTool, Tools } from 'widgets';
import type { Transformer } from 'konva/lib/shapes/Transformer';
import { connectionConfig } from '../lib';

interface ConnectionAnchorProps {
  side: ConnectionAnchorSide;
}

export const ConnectionAnchor = (props: ConnectionAnchorProps) => {
  const ref = useRef<CircleType | null>(null);
  const transformerRef = useRef<Transformer | null>(null);

  const setCirclePosition = () => {
    const circle = ref.current;
    if (!circle) return;
    const transformer = circle.parent as Transformer;
    transformerRef.current = transformer;
    const rect = transformer.getClientRect();
    switch (props.side) {
      case ConnectionAnchorSide.LEFT:
        circle.position({
          x: -connectionConfig.anchorPadding,
          // 10 is default anchor size so we shift by half of it
          y: rect.height / 2 - 5,
        });
    }
  };

  useEffect(() => {
    setCirclePosition();
    const circle = ref.current;
    if (!circle) return;
    const transformer =
      transformerRef.current || (circle.parent as Transformer);
    transformer.on('nodes', () => {
      console.log('Toggled');
    });
    transformer.on('transform', setCirclePosition);
    return () => {
      transformer.off('transform', setCirclePosition);
    };
  }, [ref]);

  return (
    <Circle
      ref={ref}
      width={20}
      height={20}
      fill={'red'}
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
