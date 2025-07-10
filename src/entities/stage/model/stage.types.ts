import { type KonvaEventObject } from "konva/lib/Node";

export type KonvaMouseTouchEvent = KonvaEventObject<MouseEvent | TouchEvent>;
export type KonvaDragEvent = KonvaEventObject<DragEvent>;
export type KonvaEvent = KonvaEventObject<Event>;
