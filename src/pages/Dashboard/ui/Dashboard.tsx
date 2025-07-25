import { SpaceList } from 'widgets/SpaceList';
import { LeftRail } from './LeftRail';
import { TopBar } from './TopBar';

export const Dashboard = () => {
  return (
    <div className="w-full h-full flex bg-background-500">
      <LeftRail />

      <div className="flex flex-col flex-1">
        <TopBar />
        <SpaceList />
      </div>
    </div>
  );
};
