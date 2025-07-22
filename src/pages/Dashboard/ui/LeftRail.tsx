import { useViewer } from 'entities/viewer';
import { Avatar } from 'entities/user';
import { Input } from 'shared';
import { Search } from 'lucide-react';

export const LeftRail = () => {
  const { viewer } = useViewer();
  return (
    <div className="w-64 border-r border-gray-400 text-white flex flex-col gap-2">
      <div className="w-full h-fit py-2 px-4 text-sm font-bold flex items-center gap-2 ">
        <Avatar
          className="w-6 h-6"
          src={viewer?.imageUrl || ''}
          name={viewer?.fullName || ''}
        />
        {viewer?.fullName}
      </div>
      <div className="w-11/12 mx-auto h-fit border-2 border-transparent bg-gray-600 focus-within:border-primary-100 rounded-sm flex items-center px-2 py-1 gap-2">
        <Search size={16} />
        <Input
          className="outline-none border-none text-sm"
          placeholder="Search files"
        />
      </div>
      <div className="w-full h-fit py-2 px-4 text-sm bg-gray-400">Recents</div>
    </div>
  );
};
