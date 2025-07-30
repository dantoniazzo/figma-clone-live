import { RailContainer } from 'shared';
import { useStorage } from '@liveblocks/react/suspense';
import { BlockTypes, type IBlock } from 'entities/block';
import { findNode } from 'entities/node';
import { selectNode } from 'features/selection';
import { Square, Type, Spline } from 'lucide-react';
export interface LeftRailProps {
  id: string;
}

export const LeftRail = (props: LeftRailProps) => {
  const { id } = props;
  const blocks = useStorage((storage) => storage.blocks);

  return (
    <RailContainer className="absolute top-0 left-0 bg-background-400 border-gray-400 hidden lg:block">
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
  );
};
