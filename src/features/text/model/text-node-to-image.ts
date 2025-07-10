import { unScalePosition } from 'features/scale';
import html2canvas from 'html2canvas';
import { getQlEditor } from '../lib';
import { getLayer } from 'entities/layer';
import { TextImageNode } from '../ui';
import { getEditor } from '../ui/text-editor';

export const convertNodeToImage = async (stageId: string, id: string) => {
  const editorContainer = document.getElementById(id);
  const qlEditor = getQlEditor(id);
  if (!editorContainer || !qlEditor) return;
  editorContainer.style.border = 'none';
  editorContainer.style.opacity = '0';
  editorContainer.style.transform = 'none';
  const canvas = await html2canvas(qlEditor, {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    y: 7,
  });
  const position = unScalePosition(stageId, {
    x: editorContainer.offsetLeft,
    y: editorContainer.offsetTop,
  });
  const contents = getEditor(id)?.getContents();
  if (!contents) return;
  const image = TextImageNode({
    stageId,
    id,
    position,
    image: canvas,
    initialText: contents,
  });

  getLayer(stageId)?.add(image);
  editorContainer.remove();
};
