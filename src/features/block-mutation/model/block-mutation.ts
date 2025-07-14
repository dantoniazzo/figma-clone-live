import { setTool, Tools } from 'widgets';
import { BlockEvents, mutationEvent, type Params } from './block-events';

export const createBlock = (stageId: string, data: Params) => {
  mutationEvent(stageId, BlockEvents.CREATE, data);
  setTool(Tools.POINTER);
};

export const updateBlock = (stageId: string, data: Params) => {
  mutationEvent(stageId, BlockEvents.UPDATE, data);
};
