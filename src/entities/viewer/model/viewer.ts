import { useUser } from '@clerk/clerk-react';
import type { FigmaUserUnsafeMetadata } from './viewer.types';

export const useViewer = () => {
  const { user, isSignedIn } = useUser();

  const getViewerMetadata = () => {
    return user?.unsafeMetadata as FigmaUserUnsafeMetadata | undefined;
  };

  return {
    viewer: user,
    getViewerMetadata,
    isSignedIn,
  };
};
