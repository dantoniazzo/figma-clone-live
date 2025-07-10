import { getViewRect, getViewSize } from 'entities/stage';
import { type KonvaEventObject, Node, type NodeConfig } from 'konva/lib/Node';

export const moveStageOnScroll = (
  e: KonvaEventObject<WheelEvent, Node<NodeConfig>>
) => {
  const dx = -e.evt.deltaX;
  const dy = -e.evt.deltaY;
  const stage = e.target.getStage();
  if (stage) {
    stage.x(stage.x() + dx);
    stage.y(stage.y() + dy);
  }
};

export const getCenteredBlockPosition = (
  pageId: string,
  width: number,
  height: number
) => {
  const viewRect = getViewRect(pageId);
  const viewSize = getViewSize(pageId);
  if (!viewRect || !viewSize) return;
  return {
    x: viewRect.x1 + viewSize.width / 2 - width / 2,
    y: viewRect.y1 + viewSize.height / 2 - height / 2,
  };
};
