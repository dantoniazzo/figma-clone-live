import { cn } from 'shared/utils';
import { Input } from './input';

interface IconInputProps {
  icon: React.ReactNode;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  type?: React.HTMLInputTypeAttribute;
}

export const IconInput = (props: IconInputProps) => {
  return (
    <div
      className={cn(
        'w-11/12 mx-auto h-fit border-2 border-transparent bg-gray-600 focus-within:border-primary-100 rounded-sm grid grid-cols-10 items-center',
        props.className
      )}
    >
      <div className="col-span-2">{props.icon}</div>
      <Input
        type={props.type}
        disabled={props.disabled}
        id={props.id}
        className="col-span-8 outline-none border-none text-sm"
        placeholder={props.placeholder}
      />
    </div>
  );
};
