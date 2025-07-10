import { forwardRef } from 'react';

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`p-2 text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
