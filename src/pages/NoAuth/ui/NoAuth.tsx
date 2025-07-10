import { SignInButton } from "features/auth";
export const NoAuth = () => {
  return (
    <div className="w-full h-full flex flex-col flex-wrap content-center justify-center bg-background-500 ">
      <SignInButton />
    </div>
  );
};
