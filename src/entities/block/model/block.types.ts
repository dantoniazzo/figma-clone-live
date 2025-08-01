import type { ConnectionAnchorSide } from 'features/connection';
import type { Position, Size, Scale } from 'shared/model';

export type IBlock = {
  position: Position;
  size: Size;
  scale?: Scale;
  rotation?: number;
  opacity?: number;
  cornerRadius?: number;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  connections?: Connection[];
  points?: number[];
  id: string;
  type: BlockTypes;
  text?: string;
  freshlyCreated?: boolean;
};

export enum BlockTypes {
  RECTANGLE = 'rectangle',
  TEXT = 'text',
  LINE = 'line',
}

export type Connection = {
  from?: string; // ID of the block this connection is from
  to?: string; // ID of the block this connection is to
  fromSide?: ConnectionAnchorSide;
  toSide?: ConnectionAnchorSide;
};
