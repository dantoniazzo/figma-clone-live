import { SignInButton as SignInClerkButton } from "@clerk/clerk-react";

export const SignInButton = () => {
  return (
    <SignInClerkButton>
      <button className="bg-primary-100 w-fit mx-auto hover:bg-primary-500 text-white font-bold py-2 px-4 rounded cursor-pointer">
        Sign In
      </button>
    </SignInClerkButton>
  );
};
