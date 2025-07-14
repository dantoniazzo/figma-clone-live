import Konva from 'konva';
import { Stage, Layer, Transformer } from 'react-konva';
import { getLayerId } from 'entities/layer';
import { useEffect, useMemo, useRef } from 'react';
import {
  reScalePosition,
  reScaleSize,
  scaleStageOnScroll,
  unScalePosition,
  unScaleSize,
} from 'features/scale';
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
import { BlockTypes, type IBlock } from 'entities/block';
import {
  BlockEventListener,
  BlockEvents,
  removeBlockEventListener,
  type Params,
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
import { v4 as uuidv4 } from 'uuid';

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
  console.log('Blocks: ', blocks);
  const createBlock = useMutation(({ storage }, params: Params) => {
    const id = uuidv4();
    const newBlock = new LiveObject<IBlock>({
      ...params,
      id,
      type: params.type || BlockTypes.RECTANGLE,
    });
    const blocks = storage.get('blocks') as LiveList<LiveObject<IBlock>>;
    if (blocks) {
      blocks.push(newBlock);
    }
  }, []);
  const updateBlock = useMutation(({ storage }, params: Params) => {
    const blocks = storage.get('blocks') as LiveList<LiveObject<IBlock>>;
    if (blocks) {
      const index = blocks.findIndex((block) => block.get('id') === params.id);
      const block = blocks.get(index);
      if (block) {
        const newLiveBlock = new LiveObject<IBlock>({
          ...block.toObject(),
          position: params.position,
          size: params.size,
          scale: params.scale,
        });
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
      BlockEventListener(id, (detail) => {
        if (detail.eventType === BlockEvents.CREATE) {
          createBlock(detail.data);
        }
        if (detail.eventType === BlockEvents.UPDATE) {
          updateBlock(detail.data);
        }
        /*   if (detail.eventType === BlockEvents.DELETE) {
          setBlocks((prev) =>
            prev.filter((block) => block.id !== detail.block.id)
          );
        } */
        if (detail.eventType === BlockEvents.SELECT) {
          const layer = layerRef.current;
          if (layer) {
            const group = layer.findOne(`#${detail.data.id}`);
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
              const position = { x: newBox.x, y: newBox.y };
              const size = { width: newBox.width, height: newBox.height };
              const unScaledPosition = unScalePosition(id, position);
              const unScaledSize = unScaleSize(id, size);
              if (!unScaledPosition || !unScaledSize) return newBox;
              const snappedWidth = Math.max(
                FULL_SIZE,
                snapToGrid(unScaledSize.width)
              );
              const snappedHeight = Math.max(
                FULL_SIZE,
                snapToGrid(unScaledSize.height)
              );

              const deltaWidth = snappedWidth - unScaledSize.width;
              const deltaHeight = snappedHeight - unScaledSize.height;

              let adjustedX = unScaledPosition.x;
              let adjustedY = unScaledPosition.y;

              if (deltaWidth !== 0) {
                if (newBox.x === oldBox.x) {
                  adjustedX = snapToGrid(unScaledPosition.x);
                } else {
                  adjustedX = snapToGrid(unScaledPosition.x - deltaWidth);
                }
              } else {
                adjustedX = snapToGrid(unScaledPosition.x);
              }

              if (deltaHeight !== 0) {
                if (newBox.y === oldBox.y) {
                  adjustedY = snapToGrid(unScaledPosition.y);
                } else {
                  adjustedY = snapToGrid(unScaledPosition.y - deltaHeight);
                }
              } else {
                adjustedY = snapToGrid(unScaledPosition.y);
              }

              const reScaledPosition = reScalePosition(id, {
                x: adjustedX,
                y: adjustedY,
              });

              const reScaledSize = reScaleSize(id, {
                width: snappedWidth,
                height: snappedHeight,
              });
              if (!reScaledPosition || !reScaledSize) return newBox;

              return {
                x: reScaledPosition.x,
                y: reScaledPosition.y,
                width: reScaledSize.width,
                height: reScaledSize.height,
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
