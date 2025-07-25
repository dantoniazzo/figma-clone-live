import { SpaceType, type ISpace } from 'entities/space';
import { Trash2 } from 'lucide-react';
import { useSpacesMutation } from 'features/spaces-mutation';
import { useNavigate } from 'react-router-dom';
import { formatDate, Icon } from 'shared';

export interface SpaceProps {
  space: ISpace;
}

export const SpaceCard = (props: SpaceProps) => {
  const { deleteSpace } = useSpacesMutation();
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate(`/${props.space.type}/${props.space.id}`);
      }}
      className="cursor-pointer min-w-56 md:max-w-56 h-56 lg:w-auto flex-1/2  md:flex-1/4 lg:flex-1/5 xl:flex-1/6 flex flex-col gap-2 rounded-lg border border-gray-400 hover:bg-primary-200 transition-colors"
    >
      <div className="cursor-pointer h-9/12">
        <img
          src={
            props.space.type === SpaceType.DESIGN ? '/icon.png' : '/figjam.png'
          }
          className="w-full h-full object-contain"
        />
      </div>

      <div className="h-3/12 p-2 flex justify-between items-center gap-2 text-white border-t border-gray-400">
        <div className="flex items-center gap-2">
          {' '}
          <Icon name={`${props.space.name}-icon`} src="/icon.png" />
          <div className="flex flex-col items-baseline justify-center">
            <p className="text-sm">{props.space.name}</p>
            <p className="text-xs text-gray-300">
              Created: {formatDate(new Date(props.space.createdAt))}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents the click from bubbling up to the Link
            deleteSpace(props.space.id);
          }}
        >
          <Trash2
            size={16}
            className="text-red-800 hover:text-red-600 cursor-pointer transition-colors"
          />
        </button>
      </div>
    </div>
  );
};
