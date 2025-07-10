export interface AvatarProps {
  name: string;
  src: string;
  alt?: string;
}

export const Avatar = (props: AvatarProps) => {
  return (
    <img
      title={props.name}
      className="w-10 h-10 border-2 border-primary-100 rounded-full object-cover shadow-md cursor-pointer hover:scale-110 transition-transform duration-200"
      loading="lazy"
      src={props.src}
      alt={props.alt}
    />
  );
};
