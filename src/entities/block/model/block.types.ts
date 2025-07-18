import type { Position, Size, Scale } from 'shared/model';

export type IBlock = {
  position: Position;
  size: Size;
  scale?: Scale;
  connection?: Connection;
  id: string;
  type: BlockTypes;
  text?: string;
};

export enum BlockTypes {
  RECTANGLE = 'rectangle',
  TEXT = 'text',
}

export type Connection = {
  from?: string; // ID of the block this connection is from
  to?: string; // ID of the block this connection is to
};
