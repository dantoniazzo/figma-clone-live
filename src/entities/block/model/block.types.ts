import type { Position, Size } from "shared/model";

export type IBlock = {
  position: Position;
  size: Size;
  connection?: Connection;
  id: string;
  type: BlockTypes;
  text?: string;
};

export enum BlockTypes {
  RECTANGLE = "rectangle",
}

export type Connection = {
  from?: string; // ID of the block this connection is from
  to?: string; // ID of the block this connection is to
};
