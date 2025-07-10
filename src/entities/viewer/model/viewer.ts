import { useUser } from "@clerk/clerk-react";
import type { FigjamUserUnsafeMetadata } from "./viewer.types";

export const useViewer = () => {
  const { user, isSignedIn } = useUser();

  const getViewerMetadata = () => {
    return user?.unsafeMetadata as FigjamUserUnsafeMetadata | undefined;
  };

  return {
    viewer: user,
    getViewerMetadata,
    isSignedIn,
  };
};
