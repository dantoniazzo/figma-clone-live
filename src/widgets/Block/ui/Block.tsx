import { Group, Rect } from 'react-konva';
import { BlockTypes, blockConfig, type IBlock } from 'entities/block';
import {
  getStageIdFromEvent,
  getStageIdFromNode,
  type KonvaDragEvent,
} from 'entities/stage';
import { selectNode } from 'features/selection';
import { type Group as GroupType } from 'konva/lib/Group';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BlockEvents,
  mutationEvent,
  updateBlock,
} from 'features/block-mutation';
import { onMoveOnGrid } from 'features/grid';
import type { Image as ImageType } from 'konva/lib/shapes/Image';
import { getRectFromGroup } from 'entities/node';
import { Html } from 'react-konva-utils';
import { getBlockHtmlElement, getBlockHtmlId } from '../lib';
import { unScaleSize } from 'features/scale';
import { observeResize, type Size } from 'shared/model';
import { getEditor, getQlEditorElement, getQuillId } from 'features/text';
import { TextEditor } from 'features/text/ui/text-editor';
import {
  getColor,
  isJsonString,
  listenToClickOutside,
  removeClickOutsideListener,
} from 'shared';
import { debounce } from 'lodash';
import type { Delta } from 'quill';
import { Connection, updateConnection } from 'features/connection';
import { forceUpdateTransformer, isTransforming } from 'entities/transformer';
import { setConnectionAnchors } from 'features/connection/model/connection-anchor';
import { SpaceType } from 'entities/space';

export const Block = (props: IBlock) => {
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const { name, ...rest } = blockConfig;
  const ref = useRef<GroupType>(null);
  const imageRef = useRef<ImageType | null>(null);

  const onDragMove = (e: KonvaDragEvent) => {
    onMoveOnGrid(e);
    updateConnection(e.target as GroupType);
  };

  const onDragEnd = (e: KonvaDragEvent) => {
    const stageId = getStageIdFromEvent(e);
    if (!stageId) return;
    mutationEvent(stageId, BlockEvents.UPDATE, {
      ...props,
      position: e.target.position(),
    } as IBlock);
  };

  const getUnScaledGroupSize = () => {
    const group = ref.current;
    if (!group) return;
    const stageId = getStageIdFromNode(group);
    if (!stageId) return;
    const clientRect = group.getClientRect();
    if (!clientRect) return;
    return unScaleSize(stageId, {
      width: clientRect.width,
      height: clientRect.height,
    });
  };

  const updateHtmlSizeFromGroup = () => {
    const unScaledGroupSize = getUnScaledGroupSize();
    if (!unScaledGroupSize) return;
    updateHtmlSize(unScaledGroupSize);
  };

  const updateHtmlSize = useCallback(
    (size: Size) => {
      const html = getBlockHtmlElement(props.id);
      if (!html) return;
      html.style.width = `${size.width}px`;
      html.style.height = `${size.height}px`;
    },
    [props.id]
  );

  useEffect(() => {
    if (props.size.width || props.size.height) {
      updateHtmlSize(props.size);
    }
  }, [props.size, updateHtmlSize]);

  useEffect(() => {
    const qlEditorElement = getQlEditorElement(props.id);
    if (!qlEditorElement) return;
    return () => {
      removeClickOutsideListener(qlEditorElement);
    };
  }, [props.id, props.type]);

  const debounceChange = useMemo(
    () =>
      debounce((delta: Delta) => {
        const group = ref.current;
        if (!group) return;
        const stageId = getStageIdFromNode(group);
        if (!stageId) return;
        updateBlock(stageId, {
          id: props.id,
          text: JSON.stringify(delta),
        });
      }, 300),
    [props.id]
  );

  const setQuillContents = useCallback(() => {
    const currentContents = getEditor(getQuillId(props.id))?.getContents();
    const currentText = getEditor(getQuillId(props.id))?.getText();
    const quill = getEditor(getQuillId(props.id));
    if (quill && props.text) {
      if (isJsonString(props.text)) {
        if (currentContents && JSON.stringify(currentContents) === props.text)
          return;
        const parsedDelta = JSON.parse(props.text);
        quill.setContents(parsedDelta);
      } else {
        if (currentText && currentText === props.text) return;
        quill.setText(props.text);
      }
    }
  }, [props.id, props.text]);

  useEffect(() => {
    setQuillContents();
  }, [props.text, setQuillContents]);

  return (
    <>
      <Group
        onPointerDown={(e) => {
          const stageId = getStageIdFromEvent(e);
          if (!stageId || !ref.current) return;
          selectNode(stageId, ref.current);
        }}
        onTap={() => {
          setEditing(true);
        }}
        onClick={() => {
          setEditing(true);
        }}
        connections={props.connections}
        name={name}
        id={props.id}
        ref={(node) => {
          if (!node) return;
          ref.current = node;
        }}
        blockType={props.type}
        text={props.text}
        position={props.position}
        scale={props.scale}
        draggable
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onTransform={(e) => {
          const stageId = getStageIdFromEvent(e);
          if (!stageId) return;
          const group = e.target as GroupType;
          const scaleX = group.scaleX();
          const scaleY = group.scaleY();
          if (scaleX === 0 || scaleY === 0) return;
          group.scaleX(1);
          group.scaleY(1);
          const rect = getRectFromGroup(group);
          const width = rect.width() * scaleX;
          const height = rect.height() * scaleY;
          rect.size({ width, height });
          updateHtmlSizeFromGroup();
          updateConnection(e.target as GroupType);
        }}
        onTransformEnd={(e) => {
          const stageId = getStageIdFromEvent(e);
          if (!stageId) return;
          const group = e.target as GroupType;
          const rect = getRectFromGroup(group);
          updateBlock(stageId, {
            id: props.id,
            position: group.position(),
            size: rect.size(),
            scale: group.scale(),
          });
        }}
      >
        <Rect
          ref={imageRef}
          strokeEnabled={props.type !== BlockTypes.TEXT}
          stroke={
            ref.current?.getStage()?.attrs?.type === SpaceType.DESIGN
              ? 'transparent'
              : getColor('--color-gray-300')
          }
          {...rest}
          fill={props.type === BlockTypes.TEXT ? 'transparent' : rest.fill}
          cornerRadius={
            ref.current?.getStage()?.attrs?.type === SpaceType.DESIGN ? 0 : 6
          }
          width={props.size.width}
          height={props.size.height}
        />
        <Html
          divProps={{
            id: getBlockHtmlId(props.id),
            style: {
              pointerEvents: editing ? 'auto' : 'none',
              borderRadius: '6px',
              display:
                props.type === BlockTypes.TEXT ||
                ref.current?.getStage()?.attrs?.type === SpaceType.FIGJAM
                  ? 'flex'
                  : 'none',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--color-gray-300)',
              zIndex: 0,
            },
          }}
        >
          <div
            id={getQuillId(props.id)}
            ref={(node) => {
              if (!node || loaded) return;
              const quill = TextEditor({ id: getQuillId(props.id) });
              setQuillContents();
              quill.on('text-change', (_, __, source) => {
                if (source !== 'user') return;

                const contents = quill.getContents();
                debounceChange(contents);
              });
              setLoaded(true);
              const handleClickOutside = () => {
                setEditing(false);
              };
              listenToClickOutside(node, handleClickOutside);
              const htmlElement = getBlockHtmlElement(props.id);
              if (props.type === BlockTypes.TEXT && htmlElement) {
                observeResize(htmlElement, () => {
                  const imageNode = imageRef.current;
                  if (!imageNode) return;
                  const stageId = getStageIdFromNode(imageNode);
                  if (!stageId) return;
                  if (isTransforming(stageId)) return;
                  imageNode.width(htmlElement.offsetWidth);
                  imageNode.height(htmlElement.offsetHeight);
                  forceUpdateTransformer(stageId);
                  setConnectionAnchors(stageId);
                });
              }
            }}
          />
        </Html>
      </Group>
      {props.connections &&
        props.connections.map((connection) => {
          if (connection.from === props.id && loaded) {
            return (
              <Connection
                key={`connection-from-${connection.from}-to-${connection.to}`}
                connection={connection}
              />
            );
          }
        })}
    </>
  );
};
Block.displayName = 'Block';
