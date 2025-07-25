import { Search as SearchIcon } from 'lucide-react';
import { IconInput } from 'shared';
import { SEARCH_ID } from '../lib/search.element';

export const Search = () => {
  return (
    <IconInput
      className="px-2 py-1"
      id={SEARCH_ID}
      placeholder="Search files"
      icon={<SearchIcon size={16} />}
    />
  );
};
