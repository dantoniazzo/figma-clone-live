import { useOthers, type JsonObject } from "@liveblocks/react/suspense";
import type { IUser } from "entities/user";
import { CanvasCursor } from "shared";
import type { Position } from "shared/model";

export interface CanvasCursorProps {
  stageId: string;
}

export const Presences = (props: CanvasCursorProps) => {
  const others = useOthers();
  return (
    <>
      {others
        .filter((other) => other.presence.cursor !== null)
        .map(({ connectionId, presence }) => {
          if (!presence.cursor) return null;
          return (
            <CanvasCursor
              key={connectionId}
              stageId={props.stageId}
              id={(presence.user as IUser).id}
              name={(presence.user as IUser).firstName}
              position={{
                x: (presence.cursor as JsonObject as unknown as Position).x,
                y: (presence.cursor as JsonObject as unknown as Position).y,
              }}
            />
          );
        })}
    </>
  );
};
