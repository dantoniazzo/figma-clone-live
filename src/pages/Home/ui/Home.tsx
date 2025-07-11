import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { SignInButton } from 'features/auth';
import { useViewer } from 'entities/viewer';
import { SpaceListTable } from 'widgets/SpaceList';

export const Home = () => {
  const { viewer, isSignedIn } = useViewer();
  return (
    <div className="w-full h-full items-center justify-center flex flex-col gap-12 bg-background-500 ">
      <SignedIn>
        <div className="absolute top-5 right-5">
          <UserButton />
        </div>
      </SignedIn>
      <h1 className="text-6xl font-bold text-white text-center">
        Welcome {isSignedIn ? viewer?.firstName : 'to Figma clone'}
      </h1>

      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <div className="w-2/3">
          <SpaceListTable />
        </div>
      </SignedIn>
    </div>
  );
};
