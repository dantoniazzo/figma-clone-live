import { getPointerPosition } from "features/pointer";
import { EDITOR_BACKGROUND_ID, EDITOR_CONTAINER_ID } from "../lib";
import { convertNodeToImage } from "./text-node-to-image";
import { getStage } from "entities/stage";
import { v4 as uuidv4 } from "uuid";
import "../ui/text.css";
import { setTool, Tools } from "widgets";
import { observeResize, type Position, type Size } from "shared/model";
import { type InitialText } from "./text.types";
import { TextEditor } from "../ui/text-editor";
import { listenToClickOutside, removeClickOutsideListener } from "shared";
import { selectEverythingInEditor } from "./text-selection";
import { TextBackgroundNode } from "../ui";
import { unScalePosition, unScaleSize } from "features/scale";
import { getLayer } from "entities/layer";
import { selectNode } from "features/selection";

export const creationConfig = {
  width: 0,
  height: 0,
};

let mouseover: string | null = null;

export const onClickOutside = (stageId: string, id: string) => {
  convertNodeToImage(stageId, id);
};

export const createFirstTextNode = async (stageId: string) => {
  const id = `${EDITOR_CONTAINER_ID}-${uuidv4()}`;
  const initialText = "Text";
  const pointerPosition = getPointerPosition(stageId);
  if (!pointerPosition) return;
  createTextNode({
    stageId,
    id,
    initialText,
    position: pointerPosition,
    shouldSelect: true,
  });
};
export interface TextCreationProps {
  stageId: string;
  id: string;
  initialText: InitialText;
  position: Position;
  size?: Size;
  shouldSelect?: boolean;
  shouldDisable?: boolean;
}

export const createTextNode = async (props: TextCreationProps) => {
  // Create editor container
  const editorContainer = document.createElement("div");
  editorContainer.id = props.id;
  editorContainer.style.position = "absolute";
  editorContainer.style.top = `${props.position.y}px`;
  editorContainer.style.left = `${props.position.x}px`;
  if (props.size) {
    editorContainer.style.width = `${props.size.width}px`;
    editorContainer.style.height = `${props.size.height}px`;
  }
  editorContainer.style.transformOrigin = "top left";
  editorContainer.style.transform = `scale(${getStage(
    props.stageId
  )?.scaleX()}, ${getStage(props.stageId)?.scaleY()})`;
  document.body.appendChild(editorContainer);

  const quill = TextEditor({ id: props.id });
  if (props.shouldDisable) quill.disable();
  const onDblClick = () => {
    quill.enable();
    selectEverythingInEditor({ quill });
  };
  editorContainer.addEventListener("dblclick", onDblClick);
  if (typeof props.initialText === "string") {
    quill.setText(props.initialText);
  } else {
    quill.setContents(props.initialText);
  }
  if (props.shouldSelect) selectEverythingInEditor({ quill });
  setTimeout(() => {
    quill.focus();
    const unScaledPosition = unScalePosition(props.stageId, props.position);
    if (unScaledPosition) {
      const backgroundNode = TextBackgroundNode({
        id: `${EDITOR_BACKGROUND_ID}-${props.id}`,
        position: unScaledPosition,
        size: {
          width: editorContainer.getBoundingClientRect().width,
          height: editorContainer.getBoundingClientRect().height,
        },
      });
      observeResize(editorContainer, () => {
        backgroundNode.width(editorContainer.offsetWidth);
        backgroundNode.height(editorContainer.offsetHeight);
      });
      backgroundNode.on("transform", () => {
        const { width, height, x, y } = backgroundNode.getClientRect();
        const scaledSize = unScaleSize(props.stageId, { width, height });
        if (!scaledSize) return;
        editorContainer.style.top = `${y}px`;
        editorContainer.style.left = `${x}px`;
        editorContainer.style.width = `${scaledSize.width}px`;
        editorContainer.style.height = `${scaledSize.height}px`;
      });
      getLayer(props.stageId)?.add(backgroundNode);
      selectNode(props.stageId, backgroundNode);
    }
  });

  const handleClickOutside = () => {
    if (mouseover && mouseover.includes("anchor")) return;
    onClickOutside(props.stageId, props.id);
    removeClickOutsideListener(editorContainer);
    editorContainer.removeEventListener("dblclick", onDblClick);
  };
  listenToClickOutside(editorContainer, handleClickOutside);
  const stage = getStage(props.stageId);
  if (!stage) return;

  stage.on("mouseover", (e) => {
    mouseover = e.target.attrs.name;
  });
  setTool(Tools.POINTER);
};
