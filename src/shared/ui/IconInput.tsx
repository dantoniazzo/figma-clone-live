import { cn } from 'shared/utils';
import { Input } from './input';

export interface IconInputProps {
  icon: React.ReactNode;
  placeholder?: string;
  id?: string;
  className?: string;
  iconClassName?: string;
  onIconClick?: () => void;
  disabled?: boolean;
  type?: React.HTMLInputTypeAttribute;
  value?: string | number;
  min?: number;
  max?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const IconInput = (props: IconInputProps) => {
  return (
    <div
      className={cn(
        'relative w-11/12 mx-auto h-fit border-2 border-transparent bg-gray-600 focus-within:border-primary-100 rounded-sm grid grid-cols-10 items-center',
        props.className
      )}
    >
      <div
        onClick={props.onIconClick}
        className={cn('col-span-2', props.iconClassName)}
      >
        {props.icon}
      </div>
      <Input
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={props.onChange}
        type={props.type}
        disabled={props.disabled}
        id={props.id}
        className="col-span-8 outline-none border-none text-sm"
        placeholder={props.placeholder}
      />
    </div>
  );
};
