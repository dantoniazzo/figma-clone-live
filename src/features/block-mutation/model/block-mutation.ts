import { BlockTypes } from "entities/block";
import { v4 as uuidv4 } from "uuid";
import { setTool, Tools } from "widgets";
import { BlockEvents, mutationEvent } from "./block-events";
import type { Rect } from "shared/model";

export interface CreateArgs {
  rect: Rect;
}

export const createBlock = (stageId: string, config: CreateArgs) => {
  const rectId = uuidv4();

  mutationEvent(stageId, BlockEvents.CREATE, {
    position: { x: config.rect.x, y: config.rect.y },
    size: { width: config.rect.width, height: config.rect.height },
    id: rectId,
    type: BlockTypes.RECTANGLE,
  });

  setTool(Tools.POINTER);
};
