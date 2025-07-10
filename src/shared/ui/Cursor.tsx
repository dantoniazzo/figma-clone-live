import type { Position } from "shared/model";
import { Image } from "react-konva";
import { useImage } from "react-konva-utils";
import { generateColorFromId, getUrlFromSvgElement } from "shared/utils";
import { Group, Rect, Text } from "react-konva";

export function Cursor(color: string = "blue") {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m13.67 6.03-11-4a.5.5 0 0 0-.64.64l4 11a.5.5 0 0 0 .935.015l1.92-4.8 4.8-1.92a.5.5 0 0 0 0-.935h-.015Z"
        fill={color}
      />
    </svg>
  );
}

export interface CanvasCursorProps {
  stageId: string;
  id: string;
  position: Position;
  name: string;
}

export const CanvasCursor = (props: CanvasCursorProps) => {
  const color = generateColorFromId(props.id);
  const url = getUrlFromSvgElement(Cursor(color));
  const [image] = useImage(url);
  return (
    <Group x={props.position.x} y={props.position.y}>
      <Image image={image} />
      <Rect cornerRadius={4} x={20} width={40} height={16} fill={color} />
      <Text fontSize={11} fill={"white"} x={24} y={3.5} text={props.name} />
    </Group>
  );
};
