import { getColor, IconInput, RailContainer } from 'shared';
import { Square, RotateCw, Blend, Scan } from 'lucide-react';
import { getRightRailContainerId } from '../lib';
import { useEffect, useState } from 'react';
import {
  BlockEventListener,
  BlockEvents,
  removeBlockEventListener,
} from 'features/block-mutation';
import type { IBlock } from 'entities/block';
import { useStorage } from '@liveblocks/react/suspense';

interface RightRailProps {
  id: string;
}

export const RightRail = (props: RightRailProps) => {
  const [selectedBlock, setSelectedBlock] = useState<IBlock | null>(null);
  const blocks = useStorage((storage) => storage.blocks);

  useEffect(() => {
    BlockEventListener(props.id, (detail) => {
      if (detail.eventType === BlockEvents.SELECT) {
        if (blocks) {
          const block = (blocks as IBlock[]).find(
            (b) => b.id === detail.data.id
          );
          setSelectedBlock(block || null);
        }
      }
    });

    return () => {
      removeBlockEventListener(props.id);
    };
  }, [props.id, blocks]);
  return (
    <RailContainer
      id={getRightRailContainerId(props.id)}
      className="top-0 right-0 absolute h-full bg-background-400 border-l border-gray-400 hidden lg:block"
    >
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
            placeholder={selectedBlock?.position.x.toString() || 'In progress'}
            icon={<span className="text-sm text-gray-200">X</span>}
          />
          <IconInput
            disabled
            type="number"
            className="w-full px-2"
            id="position-edit-y"
            placeholder={selectedBlock?.position.y.toString() || 'In progress'}
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
            placeholder="In progress"
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
  );
};
