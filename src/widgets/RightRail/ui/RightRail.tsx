import {
  getAlphaPercentageFromRgba,
  getColor,
  hexToRgba,
  isHex,
  isRgb,
  isRgba,
  RailContainer,
} from 'shared';
import { Square, RotateCw, Blend, Scan, StretchHorizontal } from 'lucide-react';
import { getRightRailContainerId } from '../lib';
import { useEffect, useState } from 'react';
import {
  BlockEventListener,
  BlockEvents,
  removeBlockEventListener,
} from 'features/block-mutation';
import { findNode, getRectFromGroup } from 'entities/node';
import type { Position, Size } from 'shared/model';
import type { Group } from 'konva/lib/Group';
import { BlockTypes } from 'entities/block';
import { NodeMutationInput, NodeMutationTypes } from 'features/node-mutation';
import type { Node } from 'konva/lib/Node';

interface RightRailProps {
  id: string;
}

interface SelectedNode {
  position?: Position;
  size?: Size;
  rotation?: number;
  opacity?: number;
  radius?: number | number[];
  fill?: string | CanvasGradient;
  fillOpacity?: number;
  stroke?: string | CanvasGradient;
  strokeOpacity?: number;
  strokeWidth?: number;
}

export const RightRail = (props: RightRailProps) => {
  const [node, setNode] = useState<Node | null>(null);
  const [properties, setProperties] = useState<SelectedNode | null>(null);

  useEffect(() => {
    BlockEventListener(props.id, (detail) => {
      if (detail.eventType === BlockEvents.SELECT) {
        if (!detail.data.id) return;
        const node = findNode(props.id, detail.data.id);
        if (!node) return;
        setNode(node);
      }
      if (detail.eventType === BlockEvents.DESELECT) {
        setNode(null);
        setProperties(null);
      }
    });

    return () => {
      removeBlockEventListener(props.id);
    };
  }, [props.id]);

  const getFillOpacity = (node: Group) => {
    const rect = getRectFromGroup(node);
    if (!rect.fill) return;
    const fill = rect.fill();
    if (typeof fill === 'string') {
      if (isHex(fill)) {
        const rgba = hexToRgba(fill);
        return getAlphaPercentageFromRgba(rgba);
      } else if (isRgb(fill)) {
        return 1;
      } else if (isRgba(fill)) {
        return getAlphaPercentageFromRgba(fill);
      }
    }
  };

  const getStrokeOpacity = (node: Group) => {
    const rect = getRectFromGroup(node);
    if (!rect.stroke) return;
    const stroke = rect.stroke();
    if (typeof stroke === 'string') {
      if (isHex(stroke)) {
        const rgba = hexToRgba(stroke);
        return getAlphaPercentageFromRgba(rgba);
      } else if (isRgb(stroke)) {
        return 1;
      } else if (isRgba(stroke)) {
        return getAlphaPercentageFromRgba(stroke);
      }
    }
  };

  const setNodeProperties = (node: Group) => {
    const blockType = node.getAttr('blockType');
    if (!blockType || blockType === BlockTypes.LINE) return;
    setProperties({
      position: node.position(),
      rotation: node.rotation(),
      size: getRectFromGroup(node).size(),
      opacity: getRectFromGroup(node).opacity() * 100,
      radius: getRectFromGroup(node).cornerRadius(),
      fill: getRectFromGroup(node).fill(),
      fillOpacity: getFillOpacity(node),
      stroke: getRectFromGroup(node).stroke(),
      strokeOpacity: getStrokeOpacity(node),
      strokeWidth: getRectFromGroup(node).strokeWidth(),
    });
  };

  useEffect(() => {
    if (node) {
      setNodeProperties(node as Group);
      node.on('xChange yChange transform', () => {
        setNodeProperties(node as Group);
      });

      return () => {
        if (node) {
          node.off('xChange yChange transform');
        }
        setNode(null);
        setProperties(null);
      };
    }
  }, [props.id, node]);

  return (
    <RailContainer
      id={getRightRailContainerId(props.id)}
      className="top-0 right-0 absolute h-full bg-background-400 border-l border-gray-400 hidden lg:block"
    >
      {properties && node && (
        <RightRailContent node={node} properties={properties} />
      )}
      {!properties && (
        <div>
          <p className="mt-20 p-4 text-center text-gray-300">
            Select block to edit
          </p>
        </div>
      )}
    </RailContainer>
  );
};

export interface RightRailContentProperties {
  node: Node;
  properties: SelectedNode;
}

export const RightRailContent = (props: RightRailContentProperties) => {
  return (
    <>
      <div className="h-20" />
      <div className="w-full h-fit pt-4 px-6 text-sm font-bold flex items-center gap-2 border-t border-gray-400">
        Position
      </div>
      <div className="flex flex-col gap-1 px-4 pt-4 pb-1">
        <div className="grid grid-cols-2 gap-1">
          {' '}
          <NodeMutationInput
            node={props.node}
            type="number"
            mutationType={NodeMutationTypes.X}
            value={props.properties.position?.x || 0}
            icon={<span className="text-sm text-gray-200">X</span>}
          />
          <NodeMutationInput
            node={props.node}
            type="number"
            mutationType={NodeMutationTypes.Y}
            value={props.properties.position?.y || 0}
            icon={<span className="text-sm text-gray-200">Y</span>}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 px-4 pb-4">
        <div className="grid grid-cols-2">
          {' '}
          <NodeMutationInput
            node={props.node}
            type="number"
            mutationType={NodeMutationTypes.ROTATION}
            value={props.properties.rotation || 0}
            icon={<RotateCw size={12} />}
          />
        </div>
      </div>
      <div className="w-full h-fit pt-4 px-6 text-sm font-bold flex items-center gap-2 border-t border-gray-400">
        Layout
      </div>
      <div className="flex flex-col gap-1 px-4 py-4">
        <div className="grid grid-cols-2 gap-1">
          {' '}
          <NodeMutationInput
            node={props.node}
            type="number"
            mutationType={NodeMutationTypes.WIDTH}
            value={props.properties.size?.width || 0}
            icon={<span className="text-sm text-gray-200">W</span>}
          />
          <NodeMutationInput
            node={props.node}
            type="number"
            mutationType={NodeMutationTypes.HEIGHT}
            value={props.properties.size?.height || 0}
            icon={<span className="text-sm text-gray-200">H</span>}
          />
        </div>
      </div>
      <div className="w-full h-fit pt-4 px-6 text-sm font-bold flex items-center gap-2 border-t border-gray-400">
        Appearance
      </div>
      <div className="flex flex-col gap-1 px-4 py-4">
        <div className="grid grid-cols-2 gap-1">
          {' '}
          <NodeMutationInput
            node={props.node}
            type="number"
            mutationType={NodeMutationTypes.OPACITY}
            value={props.properties.opacity || 0}
            icon={<Blend size={12} />}
            min={0}
            max={100}
          />
          <NodeMutationInput
            node={props.node}
            type="number"
            mutationType={NodeMutationTypes.CORNER_RADIUS}
            value={props.properties.radius?.toString() || 0}
            icon={<Scan size={12} />}
            min={0}
          />
        </div>
      </div>
      <div className="w-full h-fit pt-4 px-6 text-sm font-bold flex items-center gap-2 border-t border-gray-400">
        Fill
      </div>
      <div className="flex flex-col gap-1 px-4 py-4">
        <div className="grid grid-cols-2 gap-1">
          <NodeMutationInput
            node={props.node}
            mutationType={NodeMutationTypes.FILL}
            value={props.properties.fill?.toString() || 'Unknown'}
            icon={<Square fill={getColor('--color-gray-400')} size={12} />}
          />
          <NodeMutationInput
            node={props.node}
            type="number"
            mutationType={NodeMutationTypes.FILL_OPACITY}
            value={props.properties.fillOpacity || 0}
            icon={<span className="text-sm text-gray-200">%</span>}
            min={0}
            max={100}
          />
        </div>
      </div>
      <div className="w-full h-fit pt-4 px-6 text-sm font-bold flex items-center gap-2 border-t border-gray-400">
        Stroke
      </div>
      <div className="flex flex-col gap-1 px-4 py-4">
        <div className="grid grid-cols-2 gap-1">
          {' '}
          <NodeMutationInput
            node={props.node}
            mutationType={NodeMutationTypes.STROKE}
            value={props.properties.stroke?.toString() || 'Unknown'}
            icon={<Square fill={getColor('--color-gray-400')} size={12} />}
          />
          <NodeMutationInput
            node={props.node}
            type="number"
            mutationType={NodeMutationTypes.STROKE_OPACITY}
            value={props.properties.strokeOpacity || 0}
            icon={<span className="text-sm text-gray-200">%</span>}
            min={0}
            max={100}
          />
          <NodeMutationInput
            node={props.node}
            type="number"
            mutationType={NodeMutationTypes.STROKE_WIDTH}
            value={props.properties.strokeWidth || 0}
            icon={<StretchHorizontal size={12} />}
            min={0}
            max={100}
          />
        </div>
      </div>
    </>
  );
};
