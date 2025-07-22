import { Icon } from "shared";
import { SpaceType, useSpacesMutation } from "features/spaces-mutation";
import { useSpaces } from "entities/space";
import { forwardRef } from "react";

export const NewFileContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div
      {...props}
      ref={ref}
      className="w-fit h-fit py-1 pl-2 pr-3 flex items-center rounded-4xl bg-gray-600 border border-gray-400 text-xs cursor-pointer hover:bg-gray-400 transition-colors"
    >
      {children}
    </div>
  );
});

interface NewFileProps {
  type: SpaceType;
}

export const NewFile = (props: NewFileProps) => {
  const { createSpace } = useSpacesMutation();
  const { spaces } = useSpaces();
  switch (props.type) {
    case SpaceType.DESIGN:
      return (
        <NewFileContainer
          onClick={() => {
            createSpace(`File ${spaces.length + 1}`);
          }}
        >
          <Icon name="new-file" src="/icon.png" />
          Design
        </NewFileContainer>
      );
    case SpaceType.FIGJAM:
      return (
        <NewFileContainer>
          <Icon name="new-file" src="/figjam.png" />
          FigJam
        </NewFileContainer>
      );
    default:
      return null;
  }
};

export const TopBar = () => {
  return (
    <div className="h-16 border-b border-gray-400 flex items-center justify-between px-4 text-white text-sm">
      Recents
      <div className="flex items-center gap-2">
        <NewFile type={SpaceType.DESIGN} />
        <NewFile type={SpaceType.FIGJAM} />
      </div>
    </div>
  );
};
