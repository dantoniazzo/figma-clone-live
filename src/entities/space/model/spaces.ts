import { useViewer } from "entities/viewer";

export const useSpaces = () => {
  const { getViewerMetadata } = useViewer();

  return {
    spaces: getViewerMetadata()?.spaces || [],
  };
};
