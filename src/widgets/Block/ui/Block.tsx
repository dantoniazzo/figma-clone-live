import { Group, Rect } from 'react-konva';
import { config, type IBlock } from 'entities/block';
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
import type { Size } from 'shared/model';
import { getEditor, getQlEditorElement, getQuillId } from 'features/text';
import { TextEditor } from 'features/text/ui/text-editor';
import {
  isJsonString,
  listenToClickOutside,
  removeClickOutsideListener,
} from 'shared';
import { debounce } from 'lodash';
import type { Delta } from 'quill';

export const Block = (props: IBlock) => {
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const { name, ...rest } = config;
  const ref = useRef<GroupType>(null);
  const imageRef = useRef<ImageType | null>(null);

  const onDragMove = (e: KonvaDragEvent) => {
    onMoveOnGrid(e);
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
    updateHtmlSize(props.size);
  }, [props.size, updateHtmlSize]);

  useEffect(() => {
    return () => {
      const qlEditorElement = getQlEditorElement(props.id);
      if (!qlEditorElement) return;
      removeClickOutsideListener(qlEditorElement);
    };
  }, []);

  const debounceChange = useMemo(
    () =>
      debounce((delta: Delta) => {
        const group = ref.current;
        if (!group) return;
        const rect = getRectFromGroup(group);
        const stageId = getStageIdFromNode(group);
        if (!stageId) return;
        updateBlock(stageId, {
          id: props.id,
          position: {
            x: group.x(),
            y: group.y(),
          },
          size: {
            width: rect.width(),
            height: rect.height(),
          },
          scale: {
            x: group.scaleX(),
            y: group.scaleY(),
          },
          text: JSON.stringify(delta),
        });
      }, 300),
    [props.id]
  );

  const setQuillContents = useCallback(() => {
    const quill = getEditor(getQuillId(props.id));
    if (quill && props.text) {
      if (isJsonString(props.text)) {
        const parsedDelta = JSON.parse(props.text);
        quill.setContents(parsedDelta);
      } else {
        quill.setText(props.text);
      }
    }
  }, [props.id, props.text]);

  useEffect(() => {
    setQuillContents();
  }, [props.text, setQuillContents]);

  return (
    <Group
      onPointerDown={(e) => {
        const stageId = getStageIdFromEvent(e);
        if (!stageId || !ref.current) return;
        selectNode(stageId, ref.current);
      }}
      onClick={() => {
        setEditing(true);
      }}
      connection={props.connection}
      name={name}
      id={props.id}
      ref={ref}
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
      }}
      onTransformEnd={(e) => {
        const stageId = getStageIdFromEvent(e);
        if (!stageId) return;
        const group = e.target as GroupType;
        const rect = getRectFromGroup(group);
        updateBlock(stageId, {
          id: props.id,
          position: {
            x: group.x(),
            y: group.y(),
          },
          size: {
            width: rect.width(),
            height: rect.height(),
          },
          scale: {
            x: group.scaleX(),
            y: group.scaleY(),
          },
        });
      }}
    >
      <Rect
        image={undefined}
        ref={imageRef}
        {...rest}
        width={props.size.width}
        height={props.size.height}
      />
      <Html
        divProps={{
          id: getBlockHtmlId(props.id),
          style: {
            pointerEvents: editing ? 'auto' : 'none',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'var(--color-gray-300)',
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
          }}
        />
      </Html>
    </Group>
  );
};
