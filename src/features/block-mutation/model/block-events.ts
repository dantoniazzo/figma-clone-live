import { getCanvasContainer } from 'widgets';
import { type IBlock } from 'entities/block';

export const EVENT_NAME = 'block-event';

export enum BlockEvents {
  CREATE = 'create-block',
  UPDATE = 'update-block',
  DELETE = 'delete-block',
  SELECT = 'select-block',
  DESELECT = 'deselect-block',
}

export type BlockEventType = {
  type: BlockEvents;
  detail: { eventType: BlockEvents; block: IBlock };
};

// Listener management
const blockEventListeners = new WeakMap<HTMLElement, EventListener>();

export const BlockEventListener = (
  stageId: string,
  callback: (detail: BlockEventType['detail']) => void
) => {
  const canvas = getCanvasContainer(stageId);
  if (!canvas) return;
  const fn = ((event: CustomEvent<BlockEventType['detail']>) => {
    if (event.detail) {
      callback(event.detail);
    }
  }) as EventListener;
  blockEventListeners.set(canvas, fn);
  canvas.addEventListener(EVENT_NAME, fn);
};

export const removeBlockEventListener = (stageId: string) => {
  const canvas = getCanvasContainer(stageId);
  if (!canvas) return;
  const fn = blockEventListeners.get(canvas);
  if (fn) {
    canvas.removeEventListener(EVENT_NAME, fn);
    blockEventListeners.delete(canvas);
  }
};

export const mutationEvent = (
  stageId: string,
  type: BlockEvents,
  block: IBlock
) => {
  const canvas = getCanvasContainer(stageId);
  if (!canvas) return;
  canvas.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: { eventType: type, block },
    })
  );
};
