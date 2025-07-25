import { cn } from 'shared/utils';

interface RailContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const RailContainer = (props: RailContainerProps) => {
  return (
    <div
      className={cn(
        'w-64 h-full border-r text-white flex flex-col gap-2',
        props.className
      )}
    >
      {props.children}
    </div>
  );
};
