import { getColor } from "shared";
import { BlockTypes } from "./block.types";
import { FULL_SIZE } from "features/grid";

export const config = {
  name: "block",
  width: FULL_SIZE * 5,
  height: FULL_SIZE * 5,
  fill: getColor("--color-gray-500"),
  cornerRadius: 6,
};

export const colorConfig: {
  [key in BlockTypes]: { fill: string; text: string };
} = {
  [BlockTypes.INTEGRATION]: {
    fill: getColor("--color-yellow-500"),
    text: getColor("--color-yellow-100"),
  },
  [BlockTypes.CONDITION]: {
    fill: getColor("--color-blue-500"),
    text: getColor("--color-blue-100"),
  },
  [BlockTypes.INPUT]: {
    fill: getColor("--color-green-500"),
    text: getColor("--color-green-100"),
  },
  [BlockTypes.OUTPUT]: {
    fill: getColor("--color-red-500"),
    text: getColor("--color-red-100"),
  },
  [BlockTypes.TIME]: {
    fill: getColor("--color-pink-500"),
    text: getColor("--color-pink-100"),
  },
};
