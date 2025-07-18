import { Circle } from 'react-konva';
import { ConnectionAnchorSide } from '../model';
import { useEffect, useRef } from 'react';
import type { Circle as CircleType } from 'konva/lib/shapes/Circle';
import { getTool, Tools } from 'widgets';
import type { Transformer } from 'konva/lib/shapes/Transformer';
import { connectionConfig } from '../lib';
import { getColor } from 'shared';

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
    const width = transformer.width();
    const height = transformer.height();
    switch (props.side) {
      case ConnectionAnchorSide.LEFT:
        circle.position({
          x: -connectionConfig.anchorPadding,
          // 10 is default anchor size so we shift by half of it
          y: height / 2,
        });
        break;
      case ConnectionAnchorSide.RIGHT:
        circle.position({
          x: width + connectionConfig.anchorPadding,
          // 10 is default anchor size so we shift by half of it
          y: height / 2,
        });
        break;
      case ConnectionAnchorSide.TOP:
        circle.position({
          x: width / 2,
          // 10 is default anchor size so we shift by half of it
          y: -connectionConfig.anchorPadding,
        });
        break;
      case ConnectionAnchorSide.BOTTOM:
        circle.position({
          x: width / 2,
          // 10 is default anchor size so we shift by half of it
          y: height + connectionConfig.anchorPadding,
        });
        break;
    }
  };

  useEffect(() => {
    setCirclePosition();
    const circle = ref.current;
    if (!circle) return;
    const transformer =
      transformerRef.current || (circle.parent as Transformer);
    transformer.on('transform', setCirclePosition);
    return () => {
      transformer.off('transform', setCirclePosition);
    };
  }, [ref]);

  return (
    <Circle
      ref={ref}
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
