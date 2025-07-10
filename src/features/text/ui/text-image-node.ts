import Konva from 'konva';
import { type Position, type Size } from 'shared/model';
import { createTextNode, type InitialText } from '../model';
import { reScalePosition } from 'features/scale';

export interface TextImageNodeProps {
  stageId: string;
  id: string;
  initialText: InitialText;
  position?: Position;
  size?: Size;
  image?: CanvasImageSource;
}

export const TextImageNode = (props: TextImageNodeProps) => {
  const textImage = new Konva.Image({
    id: props.id,
    initialText: props.initialText,
    ...props.position,
    ...props.size,
    image: props.image,
    draggable: true,
    scaleX: 1 / window.devicePixelRatio,
    scaleY: 1 / window.devicePixelRatio,
  });
  textImage.on('click tap', (e) => {
    const initialText = textImage.getAttr('initialText') as InitialText;
    const position = { x: e.target.x(), y: e.target.y() };
    const reScaledPosition = reScalePosition(props.stageId, position);
    const size = {
      width: textImage.width() / (1 / textImage.scaleX()),
      height: textImage.height() / (1 / textImage.scaleY()),
    };
    if (!reScaledPosition) return;
    createTextNode({
      stageId: props.stageId,
      id: props.id,
      initialText,
      size,
      position: reScaledPosition,
      shouldDisable: true,
    });
    e.target.remove();
  });
  return textImage;
};
