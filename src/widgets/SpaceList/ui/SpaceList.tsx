import { useSpaces } from "entities/space";
import { SpaceCard } from "widgets/SpaceCard";

export const SpaceList = () => {
  const { spaces } = useSpaces();

  return (
    <div className="w-full h-full p-4 overflow-auto scrollbar-thin scrollbar">
      {!spaces || spaces.length === 0 ? (
        <p className="text-white text-center">
          No spaces available. Create a new space to get started.
        </p>
      ) : null}
      <div className="flex flex-row flex-wrap gap-4">
        {spaces?.map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>
    </div>
  );
};
