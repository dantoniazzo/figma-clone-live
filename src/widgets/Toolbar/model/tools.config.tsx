import {
  MousePointer2,
  BadgePlus,
  Hand,
  Pencil,
  Square,
  Spline,
  Type,
  Frame,
} from 'lucide-react';

export enum Tools {
  POINTER = 'pointer',
  HAND = 'hand',
  ADD = 'add',
  PENCIL = 'pencil',
  RECTANGLE = 'rectangle',
  LINE = 'line',
  TEXT = 'text',
  FRAME = 'frame',
}

export interface ToolConfig {
  icon: React.ReactNode;
  enabled: boolean;
  show: boolean;
}

export const toolsConfig: { [key in Tools]: ToolConfig } = {
  [Tools.POINTER]: {
    icon: <MousePointer2 />,
    enabled: true,
    show: true,
  },
  [Tools.HAND]: {
    icon: <Hand />,
    show: true,
    enabled: true,
  },
  [Tools.ADD]: {
    icon: <BadgePlus />,
    enabled: true,
    show: true,
  },
  [Tools.PENCIL]: {
    icon: <Pencil />,
    enabled: false,
    show: false,
  },
  [Tools.RECTANGLE]: {
    icon: <Square />,
    enabled: true,
    show: false,
  },
  [Tools.LINE]: {
    icon: <Spline />,
    enabled: true,
    show: false,
  },
  [Tools.TEXT]: {
    icon: <Type />,
    enabled: true,
    show: false,
  },
  [Tools.FRAME]: {
    icon: <Frame />,
    enabled: false,
    show: false,
  },
};
