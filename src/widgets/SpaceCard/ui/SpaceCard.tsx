import { type ISpace } from "entities/space";
import { Trash2 } from "lucide-react";
import { useSpacesMutation } from "features/spaces-mutation";
import { useNavigate } from "react-router-dom";

export interface SpaceProps {
  space: ISpace;
}

export const SpaceCard = (props: SpaceProps) => {
  const { deleteSpace } = useSpacesMutation();
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate(`/test/${props.space.id}`);
      }}
      className=" cursor-pointer hover:border-primary-100 w-full h-12 flex items-center justify-between bg-gray-500 shadow-2xs shadow-background-300 rounded-sm p-4 hover:shadow-background-400 transition-shadow duration-200 ease-in-out"
    >
      <h2 className="text-md font-semibold text-white cursor-pointer">
        {props.space.name}
      </h2>

      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevents the click from bubbling up to the Link
          deleteSpace(props.space.id);
        }}
      >
        <Trash2 className="text-red-800 hover:text-red-600 cursor-pointer transition-colors" />
      </button>
    </div>
  );
};
