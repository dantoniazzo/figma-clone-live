import type { Node } from 'konva/lib/Node';
import { useEffect, useState } from 'react';
import { IconInput, isHex, type IconInputProps } from 'shared';
import { NodeMutationTypes } from '../model/node-mutation.types';
import { getRectFromGroup } from 'entities/node';
import type { Group } from 'konva/lib/Group';
import { forceUpdateTransformer } from 'entities/transformer';
import { setConnectionAnchors } from 'features/connection';
import { getStageIdFromNode } from 'entities/stage';

export interface NodeMutationInputProps extends IconInputProps {
  node: Node;
  mutationType: NodeMutationTypes;
}

export const NodeMutationInput = (props: NodeMutationInputProps) => {
  const [value, setValue] = useState<string | number | undefined>(props.value);

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

  const handleOnChange = (value: string | number) => {
    setMutationValue(value);
    switch (props.mutationType) {
      case NodeMutationTypes.X: {
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(parsed)) break;
        props.node.x(parsed);
        break;
      }
      case NodeMutationTypes.Y: {
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(parsed)) break;
        props.node.y(parsed);
        break;
      }
      case NodeMutationTypes.ROTATION: {
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(parsed)) break;
        props.node.rotation(parsed);
        break;
      }
      case NodeMutationTypes.WIDTH: {
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(parsed)) break;
        const rect = getRectFromGroup(props.node as Group);
        rect.width(parsed);
        const stageId = getStageIdFromNode(props.node);
        if (!stageId) return;
        forceUpdateTransformer(stageId);
        setConnectionAnchors(stageId);
        break;
      }
      case NodeMutationTypes.HEIGHT: {
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(parsed)) break;
        const rect = getRectFromGroup(props.node as Group);
        rect.height(parsed);
        const stageId = getStageIdFromNode(props.node);
        if (!stageId) return;
        forceUpdateTransformer(stageId);
        setConnectionAnchors(stageId);
        break;
      }
      case NodeMutationTypes.OPACITY: {
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(parsed)) break;
        const correctedPercentage = parsed / 100;
        props.node.opacity(correctedPercentage);
        break;
      }
      case NodeMutationTypes.CORNER_RADIUS: {
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(parsed)) break;
        const rect = getRectFromGroup(props.node as Group);
        rect.cornerRadius(parsed);
        break;
      }
      case NodeMutationTypes.FILL: {
        const isString = typeof value === 'string';
        const hex = isHex(isString ? value : '');
        if (hex) {
          const rect = getRectFromGroup(props.node as Group);
          rect.fill(value as string);
        } else {
          console.warn('Invalid hex color:', value);
        }
        break;
      }
    }
  };
  return (
    <IconInput
      onChange={(e) => {
        const value = e.target.value;
        handleOnChange(value);
      }}
      className="w-full px-2"
      {...props}
      value={value}
      iconClassName="cursor-pointer"
    />
  );
};
