import { useSpaces } from 'entities/space';
import { SpaceCard } from 'widgets/SpaceCard';
import { Button } from 'shared';
import { useSpacesMutation } from 'features/spaces-mutation';
import { Plus } from 'lucide-react';

export const SpaceList = () => {
  const { spaces } = useSpaces();
  const { createSpace } = useSpacesMutation();

  return (
    <div className="w-full h-1/3 overflow-y-auto mx-auto md:max-w-1/2 scrollbar">
      {!spaces || spaces.length === 0 ? (
        <p className="text-white text-center">
          No spaces available. Create a new space to get started.
        </p>
      ) : null}
      <div className=" flex flex-col gap-1">
        {spaces?.map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>

      <Button
        onClick={() => {
          createSpace(`Space ${spaces.length + 1}`);
        }}
        className="w-full rounded-lg bg-background-400 flex justify-center items-center flex-wrap"
      >
        <Plus />
      </Button>
    </div>
  );
};
