import { SpaceType } from "entities/space";
import {
  MousePointer2,
  BadgePlus,
  Hand,
  Pencil,
  Square,
  PenTool,
  Type,
  Frame,
} from "lucide-react";

export enum Tools {
  POINTER = "pointer",
  HAND = "hand",
  ADD = "add",
  PENCIL = "pencil",
  RECTANGLE = "rectangle",
  LINE = "line",
  TEXT = "text",
  FRAME = "frame",
}

export interface ToolConfig {
  icon: React.ReactNode;
  enabled: SpaceType[];
  show: SpaceType[];
}

export const toolsConfig: { [key in Tools]: ToolConfig } = {
  [Tools.POINTER]: {
    icon: <MousePointer2 />,
    enabled: [SpaceType.DESIGN, SpaceType.FIGJAM],
    show: [SpaceType.DESIGN, SpaceType.FIGJAM],
  },
  [Tools.HAND]: {
    icon: <Hand />,
    show: [SpaceType.DESIGN, SpaceType.FIGJAM],
    enabled: [SpaceType.DESIGN, SpaceType.FIGJAM],
  },
  [Tools.ADD]: {
    icon: <BadgePlus />,
    enabled: [],
    show: [],
  },
  [Tools.PENCIL]: {
    icon: <Pencil />,
    enabled: [],
    show: [],
  },
  [Tools.RECTANGLE]: {
    icon: <Square />,
    enabled: [SpaceType.DESIGN, SpaceType.FIGJAM],
    show: [SpaceType.DESIGN, SpaceType.FIGJAM],
  },
  [Tools.LINE]: {
    icon: <PenTool />,
    enabled: [SpaceType.DESIGN],
    show: [SpaceType.DESIGN],
  },
  [Tools.TEXT]: {
    icon: <Type />,
    enabled: [SpaceType.DESIGN, SpaceType.FIGJAM],
    show: [SpaceType.DESIGN, SpaceType.FIGJAM],
  },
  [Tools.FRAME]: {
    icon: <Frame />,
    enabled: [],
    show: [],
  },
};
