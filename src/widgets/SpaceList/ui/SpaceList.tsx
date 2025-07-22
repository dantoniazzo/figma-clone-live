import { useSpaces } from 'entities/space';
import { getSearchElement } from 'features/search';
import { useEffect, useState } from 'react';
import { SpaceCard } from 'widgets/SpaceCard';

export const SpaceList = () => {
  const [value, setValue] = useState<string | null>(null);
  const { spaces } = useSpaces();

  const onFilesSearch = (e: Event) => {
    setValue(((e as InputEvent).target as HTMLInputElement).value);
  };
  useEffect(() => {
    const search = getSearchElement();
    if (!search) return;
    search.addEventListener('input', onFilesSearch);
    return () => {
      search.removeEventListener('input', onFilesSearch);
    };
  }, []);
  return (
    <div className="w-full h-full p-4 overflow-auto scrollbar-thin scrollbar">
      {!spaces || spaces.length === 0 ? (
        <p className="text-white text-center mt-8">
          No files available. Create a new file to get started.
        </p>
      ) : null}
      <div className="flex flex-row flex-wrap gap-4">
        {spaces
          ?.filter((space) => {
            if (!value) return space;
            return space.name.toLowerCase().includes(value.toLowerCase());
          })
          .map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
      </div>
    </div>
  );
};
