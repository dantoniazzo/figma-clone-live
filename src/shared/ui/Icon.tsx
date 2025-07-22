import { cn } from "shared/utils";
interface IconProps {
  name: string;
  src: string;
  className?: string;
}

export const Icon = ({ name, src, className }: IconProps) => {
  return (
    <img
      src={src}
      alt={name}
      className={cn("w-5 h-5 object-contain", className)}
    />
  );
};
