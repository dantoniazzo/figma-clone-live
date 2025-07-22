import { Search as SearchIcon } from 'lucide-react';
import { Input } from 'shared';
import { SEARCH_ID } from '../lib/search.element';

export const Search = () => {
  return (
    <div className="w-11/12 mx-auto h-fit border-2 border-transparent bg-gray-600 focus-within:border-primary-100 rounded-sm flex items-center px-2 py-1 gap-2">
      <SearchIcon size={16} />
      <Input
        id={SEARCH_ID}
        className="outline-none border-none text-sm"
        placeholder="Search files"
      />
    </div>
  );
};
