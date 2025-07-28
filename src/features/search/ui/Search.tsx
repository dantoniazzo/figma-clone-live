import { Search as SearchIcon } from 'lucide-react';
import { IconInput, cn } from 'shared';
import { SEARCH_ID } from '../lib/search.element';
interface SearchProps {
  className?: string;
}

export const Search = (props: SearchProps) => {
  return (
    <IconInput
      className={cn('px-2 py-1', props.className)}
      id={SEARCH_ID}
      placeholder="Search files"
      icon={<SearchIcon size={16} />}
    />
  );
};
