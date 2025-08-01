import type { Node } from 'konva/lib/Node';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  convertRgbToRgba,
  getRgbFromRgba,
  hexToRgba,
  IconInput,
  isHex,
  isRgb,
  isRgba,
  isRgbValues,
  rgbValuesToRgb,
  type IconInputProps,
  useOnClickOutside,
} from 'shared';
import { NodeMutationTypes } from '../model/node-mutation.types';
import { getRectFromGroup } from 'entities/node';
import type { Group } from 'konva/lib/Group';
import { forceUpdateTransformer } from 'entities/transformer';
import { setConnectionAnchors } from 'features/connection';
import { getStageIdFromNode } from 'entities/stage';
import { HexColorPicker } from 'react-colorful';
import { debounce } from 'lodash';
import { updateBlock, type Params } from 'features/block-mutation';

export interface NodeMutationInputProps extends IconInputProps {
  node: Node;
  mutationType: NodeMutationTypes;
}

export const NodeMutationInput = (props: NodeMutationInputProps) => {
  const [mouseDown, setMouseDown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [value, setValue] = useState<string | number | undefined>(props.value);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const setMutationValue = (value: string | number) => {
    const isNumber = typeof value === 'number';
    if (isNumber && !isNaN(value)) {
      setValue(Math.round(value));
    } else {
      setValue(value);
    }
  };

  useEffect(() => {
    if (props.value) setMutationValue(props.value);
  }, [props.value]);

  const debounceChange = useMemo(
    () =>
      debounce((params: Params) => {
        const stageId = getStageIdFromNode(props.node);
        if (!stageId) return;
        updateBlock(stageId, params);
      }, 300),
    [props.node]
  );

  const handleOnChange = useCallback(
    (value: string | number) => {
      const parsed = typeof value === 'string' ? parseFloat(value) : value;
      if (props.min === 0 && parsed < 0) {
        value = 0;
      }
      if (props.max === 100 && parsed > 100) {
        value = 100;
      }
      setMutationValue(value);
      switch (props.mutationType) {
        case NodeMutationTypes.X: {
          if (isNaN(parsed)) break;
          props.node.x(parsed);
          debounceChange({
            id: props.node.id(),
            position: {
              x: props.node.x(),
              y: props.node.y(),
            },
          });
          break;
        }
        case NodeMutationTypes.Y: {
          if (isNaN(parsed)) break;
          props.node.y(parsed);
          debounceChange({
            id: props.node.id(),
            position: {
              x: props.node.x(),
              y: props.node.y(),
            },
          });
          break;
        }
        case NodeMutationTypes.ROTATION: {
          if (isNaN(parsed)) break;
          props.node.rotation(parsed);
          debounceChange({
            id: props.node.id(),
            rotation: parsed,
          });
          break;
        }
        case NodeMutationTypes.WIDTH: {
          if (isNaN(parsed)) break;
          const rect = getRectFromGroup(props.node as Group);
          rect.width(parsed);
          const stageId = getStageIdFromNode(props.node);
          if (!stageId) return;
          forceUpdateTransformer(stageId);
          setConnectionAnchors(stageId);
          debounceChange({
            id: props.node.id(),
            size: {
              width: rect.width(),
              height: rect.height(),
            },
          });
          break;
        }
        case NodeMutationTypes.HEIGHT: {
          if (isNaN(parsed)) break;
          const rect = getRectFromGroup(props.node as Group);
          rect.height(parsed);
          const stageId = getStageIdFromNode(props.node);
          if (!stageId) return;
          forceUpdateTransformer(stageId);
          setConnectionAnchors(stageId);
          debounceChange({
            id: props.node.id(),
            size: {
              width: rect.width(),
              height: rect.height(),
            },
          });
          break;
        }
        case NodeMutationTypes.OPACITY: {
          if (
            isNaN(parsed) ||
            parsed < (props.min || 0) ||
            parsed > (props.max || 100)
          )
            break;
          const correctedPercentage = parsed / 100;
          const rect = getRectFromGroup(props.node as Group);
          rect.opacity(correctedPercentage);
          debounceChange({
            id: props.node.id(),
            opacity: correctedPercentage,
          });
          break;
        }
        case NodeMutationTypes.CORNER_RADIUS: {
          if (isNaN(parsed) || parsed < (props.min || 0)) break;
          const rect = getRectFromGroup(props.node as Group);
          rect.cornerRadius(parsed);
          debounceChange({
            id: props.node.id(),
            cornerRadius: parsed,
          });
          break;
        }
        case NodeMutationTypes.FILL: {
          const isString = typeof value === 'string';
          const hex = isHex(isString ? (value as string) : '');
          const rgbValues = isRgbValues(isString ? (value as string) : '');
          const rgb = isRgb(isString ? (value as string) : '');
          if (hex) {
            const rect = getRectFromGroup(props.node as Group);
            const rgba = hexToRgba(value as string);
            rect.fill(rgba);
            debounceChange({
              id: props.node.id(),
              fill: rgba,
            });
          } else if (rgbValues) {
            const rect = getRectFromGroup(props.node as Group);
            const rgb = rgbValuesToRgb(value as string);
            rect.fill(rgb);
            debounceChange({
              id: props.node.id(),
              fill: rgb,
            });
          } else if (rgb) {
            const rect = getRectFromGroup(props.node as Group);
            rect.fill(value as string);
            debounceChange({
              id: props.node.id(),
              fill: value as string,
            });
          } else {
            console.warn('Invalid hex color:', value);
          }
          break;
        }
        case NodeMutationTypes.FILL_OPACITY: {
          if (
            isNaN(parsed) ||
            parsed < (props.min || 0) ||
            parsed > (props.max || 100)
          )
            break;
          const correctedPercentage = parsed / 100;
          const rect = getRectFromGroup(props.node as Group);
          const fill = rect.fill();
          if (typeof fill === 'string') {
            if (isHex(fill)) {
              const rgba = hexToRgba(fill);
              const rgb = getRgbFromRgba(rgba);
              if (!rgb) break;
              const converted = convertRgbToRgba(rgb, correctedPercentage);
              rect.fill(converted);
              debounceChange({
                id: props.node.id(),
                fill: converted,
              });
            } else if (isRgb(fill)) {
              const converted = convertRgbToRgba(fill, correctedPercentage);
              rect.fill(converted);
              debounceChange({
                id: props.node.id(),
                fill: converted,
              });
            } else if (isRgba(fill)) {
              const rgb = getRgbFromRgba(fill);
              if (!rgb) break;
              const converted = convertRgbToRgba(rgb, correctedPercentage);
              rect.fill(converted);
              debounceChange({
                id: props.node.id(),
                fill: converted,
              });
            }
          }
          break;
        }
        case NodeMutationTypes.STROKE: {
          const isString = typeof value === 'string';
          const hex = isHex(isString ? (value as string) : '');
          const rgbValues = isRgbValues(isString ? (value as string) : '');
          const rgb = isRgb(isString ? (value as string) : '');
          if (hex) {
            const rect = getRectFromGroup(props.node as Group);
            const rgba = hexToRgba(value as string);
            rect.stroke(rgba);
            debounceChange({
              id: props.node.id(),
              stroke: rgba,
            });
          } else if (rgbValues) {
            const rect = getRectFromGroup(props.node as Group);
            const rgb = rgbValuesToRgb(value as string);
            rect.stroke(rgbValuesToRgb(value as string));
            debounceChange({
              id: props.node.id(),
              stroke: rgb,
            });
          } else if (rgb) {
            const rect = getRectFromGroup(props.node as Group);
            rect.stroke(value as string);
            debounceChange({
              id: props.node.id(),
              stroke: value as string,
            });
          } else {
            console.warn('Invalid hex color:', value);
          }
          break;
        }
        case NodeMutationTypes.STROKE_OPACITY: {
          if (
            isNaN(parsed) ||
            parsed < (props.min || 0) ||
            parsed > (props.max || 100)
          )
            break;
          const correctedPercentage = parsed / 100;
          const rect = getRectFromGroup(props.node as Group);
          const stroke = rect.stroke();
          if (typeof stroke === 'string') {
            if (isHex(stroke)) {
              const rgba = hexToRgba(stroke);
              const rgb = getRgbFromRgba(rgba);
              if (!rgb) break;
              const converted = convertRgbToRgba(rgb, correctedPercentage);
              rect.stroke(converted);
              debounceChange({
                id: props.node.id(),
                stroke: converted,
              });
            } else if (isRgb(stroke)) {
              const converted = convertRgbToRgba(stroke, correctedPercentage);
              rect.stroke(converted);
              debounceChange({
                id: props.node.id(),
                stroke: converted,
              });
            } else if (isRgba(stroke)) {
              const rgb = getRgbFromRgba(stroke);
              if (!rgb) break;
              const converted = convertRgbToRgba(rgb, correctedPercentage);
              rect.stroke(converted);
              debounceChange({
                id: props.node.id(),
                stroke: converted,
              });
            }
          }
          break;
        }
        case NodeMutationTypes.STROKE_WIDTH: {
          if (isNaN(parsed) || parsed < (props.min || 0)) break;
          const rect = getRectFromGroup(props.node as Group);
          rect.strokeWidth(parsed);
          debounceChange({
            id: props.node.id(),
            strokeWidth: parsed,
          });
          break;
        }
      }
    },
    [props.min, props.max, props.node, props.mutationType, debounceChange]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const input = inputRef.current;
      if (!input || !mouseDown) return;
      const value = input.value;
      const isNumber = typeof value === 'number';
      if (isNumber && isNaN(value)) return;
      const movementX = e.movementX;
      handleOnChange((Number(value) + movementX).toString());
    },
    [mouseDown, handleOnChange]
  );

  const handleMouseUp = useCallback(() => {
    if (mouseDown) {
      setMouseDown(false);
    }
  }, [mouseDown]);

  useEffect(() => {
    if (!mouseDown) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, mouseDown]);

  useOnClickOutside(colorPickerRef, () => {
    if (showColorPicker) {
      setShowColorPicker(false);
    }
  });

  return (
    <div className="relative">
      {(props.mutationType === NodeMutationTypes.FILL ||
        props.mutationType === NodeMutationTypes.STROKE) &&
      showColorPicker ? (
        <div
          ref={colorPickerRef}
          className="absolute -translate-x-full top-0 z-10 "
        >
          <HexColorPicker onChange={handleOnChange} />
        </div>
      ) : null}
      <IconInput
        ref={inputRef}
        onIconClick={() => {
          setShowColorPicker(!showColorPicker);
        }}
        onChange={(e) => {
          const value = e.target.value;
          handleOnChange(value);
        }}
        className="w-full px-2"
        {...props}
        value={value}
        iconClassName={props.iconClassName}
        onIconMouseDown={() => setMouseDown(true)}
      />
    </div>
  );
};
