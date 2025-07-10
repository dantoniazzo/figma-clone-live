import Konva from "konva";
import { Stage, Layer, Transformer } from "react-konva";
import { type Box } from "konva/lib/shapes/Transformer";
import { getLayerId } from "entities/layer";
import { useEffect, useMemo, useRef } from "react";
import { scaleStageOnScroll } from "features/scale";
import { moveStageOnScroll } from "features/position";
import {
  handleTouchDown,
  handleTouchEnd,
  handleTouchMove,
} from "features/touch";
import {
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} from "features/pointer";
import { FULL_SIZE, getGridLayerId } from "features/grid";
import {
  getStage,
  getStageElementId,
  getStageIdFromEvent,
} from "entities/stage";
import { getCanvasContainerId } from "../lib";
import { setStageSize } from "features/size";
import { observeResize } from "shared/model";
import { useParams } from "react-router-dom";
import { drawLines } from "features/grid";
import { Block } from "../../Block";
import { type IBlock } from "entities/block";
import {
  BlockEventListener,
  BlockEvents,
  removeBlockEventListener,
} from "features/block-mutation";
import { getRectFromGroup } from "entities/node";
import type { Group } from "konva/lib/Group";
import { selectNode } from "features/selection";
import { AvatarList } from "features/avatar-list";
import { Presences } from "features/presence";
import {
  ClientSideSuspense,
  RoomProvider,
  useMyPresence,
  useStorage,
  useMutation,
} from "@liveblocks/react/suspense";
import { LiveList, LiveObject } from "@liveblocks/client";
import { getColor, Loading } from "shared";
import { Header } from "features/header";
import { useViewer } from "entities/viewer";

export interface CanvasProps {
  id: string;
}

export const LiveCanvas = () => {
  const { viewer } = useViewer();
  const params = useParams();
  const id = useMemo(() => {
    return params.id || "default";
  }, [params]);
  return (
    <RoomProvider
      id={id}
      initialPresence={{
        user: {
          firstName: viewer?.firstName || "Guest",
          lastName: viewer?.lastName || "User",
          email: viewer?.emailAddresses[0].emailAddress || "",
          id: viewer?.id || "guest",
          imageUrl: viewer?.imageUrl || "https://via.placeholder.com/150",
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
    const blocks = storage.get("blocks") as LiveList<LiveObject<IBlock>>;
    if (blocks) {
      blocks.push(newBlock);
    }
  }, []);
  const updateBlock = useMutation(({ storage }, updatedBlock: IBlock) => {
    const blocks = storage.get("blocks") as LiveList<LiveObject<IBlock>>;
    if (blocks) {
      const index = blocks.findIndex(
        (block) => block.get("id") === updatedBlock.id
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
            anchorStroke={getColor("--color-primary-100")}
            anchorStrokeWidth={2}
            anchorFill="black"
            resizeEnabled={true}
            rotateEnabled={false}
            borderEnabled={true}
            borderStroke={getColor("--color-primary-100")}
            borderStrokeWidth={2}
            ignoreStroke={true}
            boundBoxFunc={(oldBox: Box, newBox: Box) => {
              const stage = getStage(id);
              if (!stage) return newBox;
              const maxSize = FULL_SIZE * stage.scaleX();
              // limit resize
              if (newBox.width < maxSize || newBox.height < maxSize) {
                if (newBox.width < maxSize) {
                  // Calculate the new width and x position if the width is less than the minimum size
                  newBox.width = maxSize;
                  newBox.x = oldBox.x;
                }
                if (newBox.height < maxSize) {
                  // Calculate the new height and y position if the height is less than the minimum size
                  newBox.height = maxSize;
                  newBox.y = oldBox.y;
                }
              }
              return newBox;
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
