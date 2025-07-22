import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { SignInButton } from "features/auth";
import { useViewer } from "entities/viewer";
import { useEffect } from "react";

export const Home = () => {
  const { viewer, isSignedIn } = useViewer();
  const _auth = useAuth();
  const _navigate = useNavigate();

  useEffect(() => {
    if (_auth.isSignedIn) {
      _navigate("/files");
    }
  }, [_auth.isSignedIn, _navigate]);
  if (_auth.isSignedIn) {
    return null;
  }
  return (
    <div className="w-full h-full items-center justify-center flex flex-col gap-12 bg-background-500 ">
      <SignedIn>
        <div className="absolute top-5 right-5">
          <UserButton />
        </div>
      </SignedIn>

      <SignedOut>
        <h1 className="text-6xl font-bold text-white text-center">
          Welcome {isSignedIn ? viewer?.firstName : "to Figma clone"}
        </h1>
        <SignInButton />
      </SignedOut>
    </div>
  );
};
