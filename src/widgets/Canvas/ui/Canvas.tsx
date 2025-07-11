import Konva from 'konva';
import { Stage, Layer, Transformer } from 'react-konva';
import { getLayerId } from 'entities/layer';
import { useEffect, useMemo, useRef } from 'react';
import { scaleStageOnScroll } from 'features/scale';
import { moveStageOnScroll } from 'features/position';
import {
  handleTouchDown,
  handleTouchEnd,
  handleTouchMove,
} from 'features/touch';
import {
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} from 'features/pointer';
import {
  FULL_SIZE,
  getGridLayerId,
  drawLines,
  snapToGrid,
} from 'features/grid';
import {
  getStage,
  getStageElementId,
  getStageIdFromEvent,
} from 'entities/stage';
import { getCanvasContainerId } from '../lib';
import { setStageSize } from 'features/size';
import { observeResize } from 'shared/model';
import { useParams } from 'react-router-dom';
import { Block } from '../../Block';
import { type IBlock } from 'entities/block';
import {
  BlockEventListener,
  BlockEvents,
  removeBlockEventListener,
} from 'features/block-mutation';
import { getRectFromGroup } from 'entities/node';
import type { Group } from 'konva/lib/Group';
import { selectNode } from 'features/selection';
import { AvatarList } from 'features/avatar-list';
import { Presences } from 'features/presence';
import {
  ClientSideSuspense,
  RoomProvider,
  useMyPresence,
  useStorage,
  useMutation,
} from '@liveblocks/react/suspense';
import { LiveList, LiveObject } from '@liveblocks/client';
import { getColor, Loading } from 'shared';
import { Header } from 'features/header';
import { useViewer } from 'entities/viewer';

export interface CanvasProps {
  id: string;
}

export const LiveCanvas = () => {
  const { viewer } = useViewer();
  const params = useParams();
  const id = useMemo(() => {
    return params.id || 'default';
  }, [params]);
  return (
    <RoomProvider
      id={id}
      initialPresence={{
        user: {
          firstName: viewer?.firstName || 'Guest',
          lastName: viewer?.lastName || 'User',
          email: viewer?.emailAddresses[0].emailAddress || '',
          id: viewer?.id || 'guest',
          imageUrl: viewer?.imageUrl || 'https://via.placeholder.com/150',
        },
        cursor: null,
      }}
      initialStorage={{
        blocks: new LiveList([]),
      }}
    >
      <ClientSideSuspense fallback={<Loading />}>
        <Canvas id={id} />
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export const Canvas = (props: CanvasProps) => {
  const { id } = props;
  const blocks = useStorage((storage) => storage.blocks);
  const createBlock = useMutation(({ storage }, params: IBlock) => {
    const newBlock = new LiveObject<IBlock>(params);
    const blocks = storage.get('blocks') as LiveList<LiveObject<IBlock>>;
    if (blocks) {
      blocks.push(newBlock);
    }
  }, []);
  const updateBlock = useMutation(({ storage }, updatedBlock: IBlock) => {
    const blocks = storage.get('blocks') as LiveList<LiveObject<IBlock>>;
    if (blocks) {
      const index = blocks.findIndex(
        (block) => block.get('id') === updatedBlock.id
      );
      const block = blocks.get(index);
      if (block) {
        const newLiveBlock = new LiveObject<IBlock>(updatedBlock);
        blocks.set(index, newLiveBlock);
      }
    }
  }, []);
  const layerRef = useRef<Konva.Layer>(null);
  const ref = useRef<HTMLDivElement>(null);
  const resizeObserver = useRef<ResizeObserver>(null);
  const presence = useMyPresence();
  const updatePresence = presence[1];
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    // stop default scrolling
    e.evt.preventDefault();
    if (e.evt.ctrlKey || e.evt.metaKey) {
      scaleStageOnScroll(e);
    } else {
      moveStageOnScroll(e);
    }
    const id = getStageIdFromEvent(e);
    if (!id) return;
    drawLines(id);
  };

  useEffect(() => {
    // Setting initial stage size based on the container size
    const elem = ref.current;
    if (elem) {
      const containerNodeWidth = elem.clientWidth;
      const containerNodeHeight = elem.clientHeight;
      if (containerNodeWidth && containerNodeHeight) {
        setStageSize(id, {
          width: elem.clientWidth,
          height: elem.clientHeight,
        });
      }
      resizeObserver.current = observeResize(elem, () => {
        setStageSize(id, {
          width: elem.clientWidth,
          height: elem.clientHeight,
        });
        drawLines(id);
      });
      BlockEventListener(id, (data) => {
        if (data.eventType === BlockEvents.CREATE) {
          createBlock(data.block);
        }
        if (data.eventType === BlockEvents.UPDATE) {
          updateBlock(data.block);
        }
        /*   if (data.eventType === BlockEvents.DELETE) {
          setBlocks((prev) =>
            prev.filter((block) => block.id !== data.block.id)
          );
        } */
        if (data.eventType === BlockEvents.SELECT) {
          const layer = layerRef.current;
          if (layer) {
            const group = layer.findOne(`#${data.block.id}`);
            if (!group) return;
            const rect = getRectFromGroup(group as Group);
            selectNode(id, rect);
          }
        }
      });
    }
    drawLines(id);

    return () => {
      removeBlockEventListener(id);
      resizeObserver.current?.disconnect();
      ref.current = null;
    };
  }, [id, createBlock, updateBlock]);

  return (
    <div
      className="w-full h-full bg-background-400"
      ref={ref}
      id={getCanvasContainerId(id)}
    >
      <Stage
        onTouchStart={handleTouchDown}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onMouseDown={handlePointerDown}
        onMouseMove={(e) => {
          handlePointerMove(e, (position) => {
            updatePresence({
              cursor: {
                ...position,
              },
            });
          });
        }}
        onMouseUp={handlePointerUp}
        onDragMove={(e) => {
          const stageId = getStageIdFromEvent(e);
          if (!stageId) return;
          drawLines(stageId);
        }}
        id={getStageElementId(id)}
      >
        {/* Grid layer */}
        <Layer id={getGridLayerId(id)} />
        <Layer ref={layerRef} id={getLayerId(id)}>
          {blocks &&
            (blocks as IBlock[]).map((block) => (
              <Block key={`block-key-${block.id}`} {...block} />
            ))}
          <Transformer
            keepRatio={false}
            anchorCornerRadius={2}
            anchorStroke={getColor('--color-primary-100')}
            anchorStrokeWidth={2}
            anchorFill="black"
            resizeEnabled={true}
            rotateEnabled={false}
            borderEnabled={true}
            borderStroke={getColor('--color-primary-100')}
            borderStrokeWidth={2}
            ignoreStroke={true}
            shouldOverdrawWholeArea
            boundBoxFunc={(oldBox, newBox) => {
              const stage = getStage(id);
              if (!stage) return newBox;
              // Calculate snapped dimensions
              const maxSize = FULL_SIZE;
              const snappedWidth = Math.max(maxSize, snapToGrid(newBox.width));
              const snappedHeight = Math.max(
                maxSize,
                snapToGrid(newBox.height)
              );

              // Calculate position adjustments to maintain anchor behavior
              const deltaWidth = snappedWidth - newBox.width;
              const deltaHeight = snappedHeight - newBox.height;

              // Determine which anchor is being used based on position changes
              let adjustedX = newBox.x;
              let adjustedY = newBox.y;

              // If width changed, adjust x position to maintain proper anchor behavior
              if (deltaWidth !== 0) {
                // Check if this is a left-side anchor (position should stay the same)
                // or right-side anchor (position should adjust)
                if (newBox.x === oldBox.x) {
                  // Left side is fixed, no x adjustment needed
                  adjustedX = snapToGrid(newBox.x);
                } else {
                  // Right side resize, adjust x to maintain right edge position
                  adjustedX = snapToGrid(newBox.x - deltaWidth);
                }
              } else {
                adjustedX = snapToGrid(newBox.x);
              }

              // Same logic for height
              if (deltaHeight !== 0) {
                if (newBox.y === oldBox.y) {
                  // Top side is fixed
                  adjustedY = snapToGrid(newBox.y);
                } else {
                  // Bottom side resize, adjust y to maintain bottom edge position
                  adjustedY = snapToGrid(newBox.y - deltaHeight);
                }
              } else {
                adjustedY = snapToGrid(newBox.y);
              }

              return {
                x: adjustedX,
                y: adjustedY,
                width: snappedWidth,
                height: snappedHeight,
                rotation: newBox.rotation,
              };
            }}
          />
          <Presences stageId={id} />
        </Layer>
      </Stage>
      <AvatarList />
      <Header />
    </div>
  );
};
