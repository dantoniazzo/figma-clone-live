import { forwardRef } from 'react';
import { cn } from 'shared/utils';

export const RailContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        'w-64 h-full border-r text-white flex flex-col gap-2',
        props.className
      )}
    >
      {children}
    </div>
  );
});
