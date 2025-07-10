import type { Position } from 'shared/model';

export type IBlock = {
  position: Position;
  connection: Connection;
  id: string;
  type: BlockTypes;
  text: string;
};

export enum BlockTypes {
  INTEGRATION = 'integration',
  CONDITION = 'condition',
  INPUT = 'input',
  OUTPUT = 'output',
  TIME = 'time',
}

export type Connection = {
  from?: string; // ID of the block this connection is from
  to?: string; // ID of the block this connection is to
};
