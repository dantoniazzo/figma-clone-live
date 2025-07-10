import { Button } from "shared";
import { Tools, toolsConfig } from "../model/tools.config";

interface ToolbarButtonProps {
  tool: Tools;
  onClick: () => void;
  selectedTool: Tools;
}

export const ToolbarButton = (props: ToolbarButtonProps) => {
  return (
    <Button
      disabled={!toolsConfig[props.tool].enabled}
      onClick={props.onClick}
      className={`rounded-sm  ${
        props.selectedTool === props.tool
          ? "bg-primary-100"
          : "bg-background-400"
      } hover:bg-gray-400`}
    >
      {toolsConfig[props.tool].icon}
    </Button>
  );
};
