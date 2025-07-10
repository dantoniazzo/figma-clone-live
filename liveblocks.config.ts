import { IBlock } from "./src/entities/block/model/block.types";
import { IUser } from "./src/entities/user/model/user.types";
import { LiveList, LiveObject } from "@liveblocks/client";

export type LiveBlock = LiveObject<IBlock>;

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      user: IUser;
      cursor: { x: number; y: number } | null;
    };
    // The storage object, for useStorage, useObject, etc.
    Storage: {
      blocks: LiveList<LiveBlock>;
    };
  }
}

export {};
