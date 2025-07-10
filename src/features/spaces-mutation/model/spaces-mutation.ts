import { useSpaces } from "entities/space";
import { useViewerMutation } from "features/viewer-mutation";
import { v4 as uuidv4 } from "uuid";

export const useSpacesMutation = () => {
  const { spaces } = useSpaces();
  const { updateViewerMetadata } = useViewerMutation();

  const createSpace = (name: string) => {
    const newSpace = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString(),
    };

    const updatedSpaces = [...spaces, newSpace];
    updateViewerMetadata({ spaces: updatedSpaces });
  };

  const updateSpace = (spaceId: string, name: string) => {
    const updatedSpaces = spaces.map((space) =>
      space.id === spaceId ? { ...space, name } : space
    );
    updateViewerMetadata({ spaces: updatedSpaces });
  };

  const deleteSpace = (spaceId: string) => {
    const updatedSpaces = spaces.filter((space) => space.id !== spaceId);
    updateViewerMetadata({ spaces: updatedSpaces });
  };

  return {
    createSpace,
    updateSpace,
    deleteSpace,
  };
};
