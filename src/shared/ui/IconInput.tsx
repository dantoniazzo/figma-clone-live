import { cn } from 'shared/utils';
import { Input } from './input';

export interface IconInputProps {
  icon: React.ReactNode;
  placeholder?: string;
  id?: string;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
  type?: React.HTMLInputTypeAttribute;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const IconInput = (props: IconInputProps) => {
  return (
    <div
      className={cn(
        'w-11/12 mx-auto h-fit border-2 border-transparent bg-gray-600 focus-within:border-primary-100 rounded-sm grid grid-cols-10 items-center',
        props.className
      )}
    >
      <div className={cn('col-span-2', props.iconClassName)}>{props.icon}</div>
      <Input
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
