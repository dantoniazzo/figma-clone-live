import type { Node } from 'konva/lib/Node';
import { useEffect, useState } from 'react';
import { IconInput, type IconInputProps } from 'shared';

export interface NodeMutationInputProps extends IconInputProps {
  node: Node;
}

export const NodeMutationInput = (props: NodeMutationInputProps) => {
  const [value, setValue] = useState<string | number | undefined>(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);
  return (
    <IconInput
      onChange={(e) => setValue(e.target.value)}
      className="w-full px-2"
      {...props}
      value={value}
      iconClassName="cursor-pointer"
    />
  );
};
