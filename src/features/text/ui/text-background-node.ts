import Konva from "konva";
import { type Position, type Size } from "shared/model";

export interface TextBackgroundNodeProps {
  id: string;
  position: Position;
  size: Size;
}

export const TextBackgroundNode = (props: TextBackgroundNodeProps) => {
  const node = new Konva.Rect({
    id: props.id,
    ...props.position,
    ...props.size,
    draggable: true,
  });

  return node;
};
