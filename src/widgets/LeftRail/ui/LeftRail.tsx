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
    <RailContainer className="h-full absolute top-0 left-0 bg-background-400 border-gray-400 hidden lg:block pt-16">
      <div className="w-full h-fit py-2 px-6 text-sm font-bold flex items-center gap-2 ">
        Layers
      </div>
      <div className="h-11/12 overflow-y-auto scrollbar">
        {blocks &&
          (blocks as IBlock[]).map((block) => (
            <div
              className="w-full mt-1 h-fit px-4 text-sm flex items-center"
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
