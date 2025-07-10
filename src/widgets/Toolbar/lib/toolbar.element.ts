import { getDataAttribute, setDataAttribute } from "shared/model";
import { Tools } from "../model/tools.config";

export const TOOL_ATTR_NAME = "tool";
export const getToolbarId = () => "toolbar";
export const getToolbarElement = () => document.getElementById(getToolbarId());

export const getTool = (): Tools | null => {
  const toolbar = getToolbarElement();
  if (!toolbar) return null;
  const tool = getDataAttribute(toolbar, TOOL_ATTR_NAME);
  return tool as Tools | null;
};

export const setTool = (tool: Tools) => {
  const toolbar = getToolbarElement();
  if (!toolbar) return;
  setDataAttribute(toolbar, TOOL_ATTR_NAME, tool);
};
