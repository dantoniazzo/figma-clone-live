import {
  getAlphaPercentageFromRgba,
  getColor,
  hexToRgba,
  IconInput,
  RailContainer,
} from 'shared';
import { Square, RotateCw, Blend, Scan } from 'lucide-react';
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
}

export const RightRail = (props: RightRailProps) => {
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [properties, setProperties] = useState<SelectedNode | null>(null);

  useEffect(() => {
    BlockEventListener(props.id, (detail) => {
      if (detail.eventType === BlockEvents.SELECT) {
        if (!detail.data.id) return;
        setNodeId(detail.data.id);
      }
      if (detail.eventType === BlockEvents.DESELECT) {
        setNodeId(null);
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
      const rgba = hexToRgba(fill);
      return getAlphaPercentageFromRgba(rgba);
    }
  };

  const getStrokeOpacity = (node: Group) => {
    const rect = getRectFromGroup(node);
    if (!rect.stroke) return;
    const stroke = rect.stroke();
    if (typeof stroke === 'string') {
      const rgba = hexToRgba(stroke);
      return getAlphaPercentageFromRgba(rgba);
    }
  };

  const setNodeProperties = (node: Group) => {
    if (node.getAttr('blockType') === BlockTypes.LINE) return;
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
    });
  };

  useEffect(() => {
    if (nodeId) {
      const node = findNode(props.id, nodeId);
      if (node) {
        setNodeProperties(node as Group);
        node.on('xChange yChange transform', () => {
          setNodeProperties(node as Group);
        });
      }
      return () => {
        if (node) {
          node.off('xChange yChange transform');
        }
        setNodeId(null);
        setProperties(null);
      };
    }
  }, [props.id, nodeId]);

  return (
    <RailContainer
      id={getRightRailContainerId(props.id)}
      className="top-0 right-0 absolute h-full bg-background-400 border-l border-gray-400 hidden lg:block"
    >
      {properties && <RightRailContent properties={properties} />}
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
          <IconInput
            disabled
            type="number"
            className="w-full px-2"
            id="position-edit-x"
            placeholder={props.properties.position?.x.toString() || 'Unknown'}
            icon={<span className="text-sm text-gray-200">X</span>}
          />
          <IconInput
            disabled
            type="number"
            className="w-full px-2"
            id="position-edit-y"
            placeholder={props.properties.position?.y.toString() || 'Unknown'}
            icon={<span className="text-sm text-gray-200">Y</span>}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 px-4 pb-4">
        <div className="grid grid-cols-2">
          {' '}
          <IconInput
            disabled
            className="w-full px-2"
            id="position-edit-rotation"
            placeholder={props.properties.rotation?.toString() || 'Unknown'}
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
          <IconInput
            disabled
            className="w-full px-2"
            id="position-edit-width"
            placeholder={props.properties.size?.width.toString() || 'Unknown'}
            icon={<span className="text-sm text-gray-200">W</span>}
          />
          <IconInput
            disabled
            className="w-full px-2"
            id="position-edit-height"
            placeholder={props.properties.size?.height.toString() || 'Unknown'}
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
          <IconInput
            disabled
            className="w-full px-2"
            id="position-edit-opacity"
            placeholder={
              props.properties.opacity?.toString() + ' %' || 'Unknown'
            }
            icon={<Blend size={12} />}
          />
          <IconInput
            disabled
            className="w-full px-2"
            id="position-edit-radius"
            placeholder={props.properties.radius?.toString() || 'Unknown'}
            icon={<Scan size={12} />}
          />
        </div>
      </div>
      <div className="w-full h-fit pt-4 px-6 text-sm font-bold flex items-center gap-2 border-t border-gray-400">
        Fill
      </div>
      <div className="flex flex-col gap-1 px-4 py-4">
        <div className="grid grid-cols-2 gap-1">
          {' '}
          <IconInput
            disabled
            className="w-full px-2"
            id="position-edit-fill"
            placeholder={props.properties.fill?.toString() || 'Unknown'}
            icon={<Square fill={getColor('--color-gray-400')} size={12} />}
          />
          <IconInput
            disabled
            className="w-full px-2"
            id="position-edit-fill-opacity"
            placeholder={props.properties.fillOpacity?.toString() || 'Unknown'}
            icon={<span className="text-sm text-gray-200">%</span>}
          />
        </div>
      </div>
      <div className="w-full h-fit pt-4 px-6 text-sm font-bold flex items-center gap-2 border-t border-gray-400">
        Stroke
      </div>
      <div className="flex flex-col gap-1 px-4 py-4">
        <div className="grid grid-cols-2 gap-1">
          {' '}
          <IconInput
            disabled
            className="w-full px-2"
            id="position-edit-stroke"
            placeholder={props.properties.stroke?.toString() || 'Unknown'}
            icon={<Square fill={getColor('--color-gray-400')} size={12} />}
          />
          <IconInput
            disabled
            className="w-full px-2"
            id="position-edit-stroke-opacity"
            placeholder={
              props.properties.strokeOpacity?.toString() || 'Unknown'
            }
            icon={<span className="text-sm text-gray-200">%</span>}
          />
        </div>
      </div>
    </>
  );
};
