import Konva from 'konva';
import { Stage, Layer } from 'react-konva';
import { getLayerId } from 'entities/layer';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { scaleStageOnScroll, unScalePosition } from 'features/scale';
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
import { getGridLayerId, drawLines } from 'features/grid';
import { getStageElementId, getStageIdFromEvent } from 'entities/stage';
import { getCanvasContainerId } from '../lib';
import { setStageSize } from 'features/size';
import { observeResize, type Position } from 'shared/model';
import { useParams } from 'react-router-dom';
import { Block } from '../../Block';
import { BlockTypes, blockConfig, type IBlock } from 'entities/block';
import {
  BlockEventListener,
  BlockEvents,
  removeBlockEventListener,
  type Params,
} from 'features/block-mutation';
import { unSelectAllNodes } from 'features/selection';
import { AvatarList } from 'features/avatar-list';
import { Presences } from 'features/presence';
import {
  ClientSideSuspense,
  RoomProvider,
  useUpdateMyPresence,
  useStorage,
  useMutation,
} from '@liveblocks/react/suspense';
import { LiveList, LiveObject } from '@liveblocks/client';
import { Loading, Transformer } from 'shared';
import { Header } from 'features/header';
import { useViewer } from 'entities/viewer';
import { v4 as uuidv4 } from 'uuid';
import { setConnectionAnchors } from 'features/connection/model/connection-anchor';
import { Line } from 'features/line';
import { SpaceType } from 'entities/space';

import { RightRail } from 'widgets/RightRail';
import { LeftRail } from 'widgets/LeftRail';

export interface CanvasProps {
  id: string;
}

export const LiveCanvas = () => {
  const { viewer } = useViewer();
  const params = useParams();

  const id = useMemo(() => {
    return params.id || 'default';
  }, [params]);

  const cancelWheel = useCallback(
    (e: WheelEvent) => {
      if (!id) return;
      // Prevent zoom scrolling of DOM elements
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    [id]
  );

  useEffect(() => {
    document
      .getElementById('root')
      ?.addEventListener('wheel', cancelWheel, true);

    return () => {
      document
        .getElementById('root')
        ?.removeEventListener('wheel', cancelWheel, true);
    };
  }, [id, cancelWheel]);
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
  const params = useParams();

  const type = useMemo(() => {
    return params.type || SpaceType.DESIGN;
  }, [params]);

  const createBlock = useMutation(({ storage }, params: Params) => {
    const id = uuidv4();
    const newBlock = new LiveObject<IBlock>({
      ...params,
      position: params.position || { x: 0, y: 0 },
      size: params.size || {
        width: params.type === BlockTypes.TEXT ? 0 : blockConfig.width,
        height: params.type === BlockTypes.TEXT ? 0 : blockConfig.height,
      },
      points: params.points || [],
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
        const blockObject = block.toObject();
        const newLiveBlock = new LiveObject<IBlock>({
          ...blockObject,
          position: params.position || blockObject.position || { x: 0, y: 0 },
          size: params.size ||
            blockObject.size || {
              width: blockConfig.width,
              height: blockConfig.height,
            },
          scale: params.scale || blockObject.scale,
          points: params.points || blockObject.points || [],
          text: params.text || blockObject.text,
          connections: params.connections || blockObject.connections,
          type: params.type || blockObject.type,
          rotation: params.rotation || blockObject.rotation,
          opacity: params.opacity || blockObject.opacity,
          cornerRadius: params.cornerRadius || blockObject.cornerRadius,
          fill: params.fill || blockObject.fill,
          fillOpacity: params.fillOpacity || blockObject.fillOpacity,
          stroke: params.stroke || blockObject.stroke,
          strokeOpacity: params.strokeOpacity || blockObject.strokeOpacity,
          strokeWidth: params.strokeWidth || blockObject.strokeWidth,
        });
        blocks.set(index, newLiveBlock);
      }
    }
  }, []);

  const deleteBlock = useMutation(({ storage }, blocksToDelete: string[]) => {
    unSelectAllNodes(id);
    blocksToDelete.forEach((blockId) => {
      const blocks = storage.get('blocks') as LiveList<LiveObject<IBlock>>;
      if (blocks) {
        const index = blocks.findIndex((block) => block.get('id') === blockId);
        blocks.delete(index);
      }
    });
  }, []);
  const layerRef = useRef<Konva.Layer>(null);
  const ref = useRef<HTMLDivElement>(null);
  const resizeObserver = useRef<ResizeObserver>(null);
  const updatePresence = useUpdateMyPresence();
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
    setConnectionAnchors(id);
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
        if (detail.eventType === BlockEvents.DELETE) {
          deleteBlock(detail.data.blocksToDelete || []);
        }
      });
    }
    drawLines(id);

    return () => {
      removeBlockEventListener(id);
      resizeObserver.current?.disconnect();
      ref.current = null;
    };
  }, [id, createBlock, updateBlock, deleteBlock]);

  const handlePresenceUpdate = useCallback(
    (position: Position) => {
      const unScaledPosition = unScalePosition(id, position);
      updatePresence({
        cursor: {
          ...unScaledPosition,
        },
      });
    },
    [id, updatePresence]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      handlePresenceUpdate({ x: e.clientX, y: e.clientY });
    },
    [handlePresenceUpdate]
  );
  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [onPointerMove]);

  return (
    <div
      className="w-full h-full bg-background-500 overflow-hidden"
      ref={ref}
      id={getCanvasContainerId(id)}
    >
      <Stage
        type={type}
        onTouchStart={handleTouchDown}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onDragMove={(e) => {
          const stageId = getStageIdFromEvent(e);
          if (!stageId) return;
          drawLines(stageId);
        }}
        id={getStageElementId(id)}
      >
        {/* Grid layer */}
        {type === SpaceType.FIGJAM && <Layer id={getGridLayerId(id)} />}
        <Layer ref={layerRef} id={getLayerId(id)}>
          {blocks &&
            (blocks as IBlock[]).map((block) => {
              if (block.type === BlockTypes.LINE && block.points) {
                return (
                  <Line
                    key={`line-key-${block.id}`}
                    {...block}
                    points={block.points}
                  />
                );
              }
              return <Block key={`block-key-${block.id}`} {...block} />;
            })}
          <Transformer />
          <Presences stageId={id} />
        </Layer>
      </Stage>
      {type === SpaceType.DESIGN && id && (
        <>
          <LeftRail id={id} />
          <RightRail id={id} />
        </>
      )}

      <AvatarList />
      <Header />
    </div>
  );
};
