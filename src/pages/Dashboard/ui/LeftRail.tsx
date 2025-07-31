import { useViewer } from 'entities/viewer';
import { Search } from 'features/search';
import { Clock } from 'lucide-react';
import { RailContainer } from 'shared';
import { UserButton } from '@clerk/clerk-react';

export const LeftRail = () => {
  const { viewer } = useViewer();
  return (
    <RailContainer className="border-gray-400 hidden md:block">
      <div className="w-full h-fit py-3 px-4 text-sm font-bold flex items-center gap-2 ">
        <UserButton />
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
