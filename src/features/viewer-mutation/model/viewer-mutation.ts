import { useUser } from "@clerk/clerk-react";

export const useViewerMutation = () => {
  const { user } = useUser();

  const updateViewerMetadata = async (data: UserUnsafeMetadata) => {
    await user?.update({ unsafeMetadata: data });
  };

  return {
    updateViewerMetadata,
  };
};
