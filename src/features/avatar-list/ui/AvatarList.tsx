import { Avatar, type IUser } from 'entities/user';
import { useOthers, useSelf } from '@liveblocks/react/suspense';
import { UserButton } from '@clerk/clerk-react';

export const AvatarList = () => {
  const others = useOthers();
  const self = useSelf();
  return (
    <div className="absolute top-5 right-5 gap-1 flex w-fit items-center">
      {self && <UserButton />}
      {others.map((other, i) => {
        return (
          <Avatar
            className="w-7 h-7 border-0"
            name={(other.presence.user as IUser).firstName || 'User'}
            key={`other-${i}`}
            src={
              (other.presence.user as IUser).imageUrl ||
              'https://via.placeholder.com/150'
            }
          />
        );
      })}
    </div>
  );
};
