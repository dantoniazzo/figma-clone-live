import { IconInput, type IconInputProps } from 'shared';

export type NodeMutationInputProps = IconInputProps;

export const NodeMutationInput = (props: NodeMutationInputProps) => {
  return (
    <IconInput
      disabled
      className="w-full px-2"
      {...props}
      iconClassName="cursor-pointer"
    />
  );
};
