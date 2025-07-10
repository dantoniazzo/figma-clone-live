import { Avatar, type IUser } from "entities/user";
import { useOthers, useSelf } from "@liveblocks/react/suspense";

export const AvatarList = () => {
  const others = useOthers();
  const self = useSelf();
  return (
    <div className="absolute top-5 right-5 flex w-fit items-center">
      {self && (
        <Avatar
          name={(self.presence.user as IUser).firstName || "User"}
          src={
            (self.presence.user as IUser).imageUrl ||
            "https://via.placeholder.com/150"
          }
        />
      )}
      {others.map((other, i) => {
        return (
          <Avatar
            name={(other.presence.user as IUser).firstName || "User"}
            key={`other-${i}`}
            src={
              (other.presence.user as IUser).imageUrl ||
              "https://via.placeholder.com/150"
            }
          />
        );
      })}
    </div>
  );
};
