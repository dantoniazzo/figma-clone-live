import {
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} from 'features/pointer';
import { type KonvaEventObject, Node, type NodeConfig } from 'konva/lib/Node';
import { type Position } from 'shared/model';

const getDistance = (p1: Position, p2: Position) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getCenter = (p1: Position, p2: Position) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
};

let lastCenter: Position | null = null;
let lastDistance: number | null = null;
let dragStopped = false;

export const handleTouchDown = (
  e: KonvaEventObject<TouchEvent, Node<NodeConfig>>
) => {
  e.cancelBubble = true;
  if (e.evt.touches.length < 2) {
    handlePointerDown(e);
    return;
  }
};

export const handleTouchMove = (
  e: KonvaEventObject<TouchEvent, Node<NodeConfig>>
) => {
  e.cancelBubble = true;
  if (e.evt.touches.length < 2) {
    handlePointerMove(e);
    return;
  }
  const stage = e.target.getStage();
  if (!stage) return;
  const touch1 = e.evt.touches[0];
  const touch2 = e.evt.touches[1];
  // restore dragging if it was cancelled by multi-touch
  if (touch1 && touch2 && !stage.isDragging() && dragStopped) {
    stage.startDrag();
    dragStopped = false;
  }

  if (touch1 && touch2) {
    // stop the default Konva drag behavior, and implement custom touch behavior
    if (stage.isDragging()) {
      dragStopped = true;
      stage.stopDrag();
    }

    const p1 = {
      x: touch1.clientX,
      y: touch1.clientY,
    };

    const p2 = {
      x: touch2.clientX,
      y: touch2.clientY,
    };
    if (!lastCenter) {
      lastCenter = getCenter(p1, p2);
      return;
    }

    const newCenter = getCenter(p1, p2);
    const dist = getDistance(p1, p2);

    if (!lastDistance) {
      lastDistance = dist;
    }

    const pointTo = {
      x: (newCenter.x - stage.x()) / stage.scaleX(),
      y: (newCenter.y - stage.y()) / stage.scaleY(),
    };

    const scale = stage.scaleX() * (dist / lastDistance);
    stage.scale({ x: scale, y: scale });

    // get new stage position
    const dx = newCenter.x - lastCenter.x;
    const dy = newCenter.y - lastCenter.y;

    const newPos = {
      x: newCenter.x - pointTo.x * scale + dx,
      y: newCenter.y - pointTo.y * scale + dy,
    };

    stage.position(newPos);

    lastDistance = dist;
    lastCenter = newCenter;
  }
};

export const handleTouchEnd = (
  e: KonvaEventObject<TouchEvent, Node<NodeConfig>>
) => {
  e.cancelBubble = true;
  if (e.evt.touches.length === 0) {
    // if there are no touches, we can call the pointer up event
    handlePointerUp(e);
  }
  lastDistance = 0;
  lastCenter = null;
};
