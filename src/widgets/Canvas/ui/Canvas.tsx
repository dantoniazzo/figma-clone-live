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
import { findNode, getRectFromGroup } from 'entities/node';
import type { Group } from 'konva/lib/Group';
import { selectNode, unSelectAllNodes } from 'features/selection';
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
import {
  Loading,
  Transformer,
  RailContainer,
  IconInput,
  getColor,
} from 'shared';
import { Header } from 'features/header';
import { useViewer } from 'entities/viewer';
import { v4 as uuidv4 } from 'uuid';
import { setConnectionAnchors } from 'features/connection/model/connection-anchor';
import { creationConfig } from 'features/text';
import { Line } from 'features/line';
import { SpaceType } from 'entities/space';
import { Square, Type, Spline, RotateCw, Blend, Scan } from 'lucide-react';

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
        width:
          params.type === BlockTypes.TEXT
            ? creationConfig.width
            : blockConfig.width,
        height:
          params.type === BlockTypes.TEXT
            ? creationConfig.height
            : blockConfig.height,
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
          connection: params.connection || blockObject.connection,
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
      className="w-full h-full bg-background-400 overflow-hidden"
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
      <RailContainer className="absolute top-0 left-0 bg-background-500 border-gray-400 hidden lg:block">
        <div className="h-16" />
        <div className="w-full h-fit py-2 px-6 text-sm font-bold flex items-center gap-2 ">
          Layers
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto h-fit">
          {blocks &&
            (blocks as IBlock[]).map((block) => (
              <div
                className="w-full h-fit px-4 text-sm flex items-center"
                key={`left-rail-block-${block.id}`}
              >
                <div
                  onClick={() => {
                    const node = findNode(id, block.id);
                    if (node) {
                      selectNode(id, node);
                    }
                  }}
                  className="cursor-pointer flex items-center gap-2 w-full px-2 py-1 hover:bg-background-300 rounded-sm"
                >
                  {block.type === BlockTypes.TEXT && <Type size={14} />}
                  {block.type === BlockTypes.RECTANGLE && <Square size={14} />}
                  {block.type === BlockTypes.LINE && <Spline size={14} />}
                  {block.type}
                </div>
              </div>
            ))}
        </div>
      </RailContainer>
      <RailContainer className="top-0 right-0 absolute h-full bg-background-500 border-l border-gray-400 hidden lg:block">
        <div className="h-16" />
        <div className="w-full h-fit py-2 px-6 text-sm font-bold flex items-center gap-2 ">
          Position
        </div>
        <div className="flex flex-col gap-1 px-4 ">
          <div className="grid grid-cols-2 gap-1">
            {' '}
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-x"
              placeholder="In progress"
              icon={<span className="text-sm text-gray-200">X</span>}
            />
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-y"
              placeholder="In progress"
              icon={<span className="text-sm text-gray-200">Y</span>}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4 ">
          <div className="grid grid-cols-2">
            {' '}
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-rotation"
              placeholder="In progress"
              icon={<RotateCw size={12} />}
            />
          </div>
        </div>
        <div className="w-full h-fit py-2 px-6 text-sm font-bold flex items-center gap-2 ">
          Layout
        </div>
        <div className="flex flex-col gap-1 px-4 ">
          <div className="grid grid-cols-2 gap-1">
            {' '}
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-width"
              placeholder="In progress"
              icon={<span className="text-sm text-gray-200">W</span>}
            />
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-height"
              placeholder="In progress"
              icon={<span className="text-sm text-gray-200">H</span>}
            />
          </div>
        </div>
        <div className="w-full h-fit py-2 px-6 text-sm font-bold flex items-center gap-2 ">
          Appearance
        </div>
        <div className="flex flex-col gap-1 px-4 ">
          <div className="grid grid-cols-2 gap-1">
            {' '}
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-opacity"
              placeholder="In progress"
              icon={<Blend size={12} />}
            />
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-radius"
              placeholder="In progress"
              icon={<Scan size={12} />}
            />
          </div>
        </div>
        <div className="w-full h-fit py-2 px-6 text-sm font-bold flex items-center gap-2 ">
          Fill
        </div>
        <div className="flex flex-col gap-1 px-4 ">
          <div className="grid grid-cols-2 gap-1">
            {' '}
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-fill"
              placeholder="In progress"
              icon={<Square fill={getColor('--color-gray-400')} size={12} />}
            />
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-fill-opacity"
              placeholder="In progress"
              icon={<span className="text-sm text-gray-200">%</span>}
            />
          </div>
        </div>
        <div className="w-full h-fit py-2 px-6 text-sm font-bold flex items-center gap-2 ">
          Stroke
        </div>
        <div className="flex flex-col gap-1 px-4 ">
          <div className="grid grid-cols-2 gap-1">
            {' '}
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-stroke"
              placeholder="In progress"
              icon={<Square fill={getColor('--color-gray-400')} size={12} />}
            />
            <IconInput
              disabled
              className="w-full px-2"
              id="position-edit-stroke-opacity"
              placeholder="In progress"
              icon={<span className="text-sm text-gray-200">%</span>}
            />
          </div>
        </div>
      </RailContainer>
      <AvatarList />
      <Header />
    </div>
  );
};
