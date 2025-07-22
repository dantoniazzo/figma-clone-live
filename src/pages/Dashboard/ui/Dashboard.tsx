import { SpaceList } from 'widgets/SpaceList';
import { LeftRail } from './LeftRail';
import { TopBar } from './TopBar';
import { useIsMobile } from 'shared';

export const Dashboard = () => {
  const isMobile = useIsMobile();
  return (
    <div className="w-full h-full flex bg-background-500">
      {!isMobile && <LeftRail />}

      <div className="flex flex-col flex-1">
        <TopBar />
        <SpaceList />
      </div>
    </div>
  );
};
