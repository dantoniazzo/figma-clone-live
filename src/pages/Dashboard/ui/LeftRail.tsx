import { useViewer } from 'entities/viewer';
import { Avatar } from 'entities/user';
import { Search } from 'features/search';
import { Clock } from 'lucide-react';
import { RailContainer } from 'shared';

export const LeftRail = () => {
  const { viewer } = useViewer();
  return (
    <RailContainer className="border-gray-400 hidden md:block">
      <div className="w-full h-fit py-3 px-4 text-sm font-bold flex items-center gap-2 ">
        <Avatar
          className="w-6 h-6"
          src={viewer?.imageUrl || ''}
          name={viewer?.fullName || ''}
        />
        {viewer?.fullName}
      </div>
      <Search className="mb-2" />
      <div className="w-full h-fit py-2 px-4 text-sm bg-gray-700 flex items-center gap-2">
        <Clock size={16} />
        Recents
      </div>
    </RailContainer>
  );
};
