export const env = {
  liveblocks: {
    publicApiKey: import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY || "",
  },
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "",
  },
};
