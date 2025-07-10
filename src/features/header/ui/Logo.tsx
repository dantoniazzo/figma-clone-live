import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link className="cursor-pointer" to={"/"}>
      <img src={"/icon.png"} width={30} height={30} />
    </Link>
  );
};
