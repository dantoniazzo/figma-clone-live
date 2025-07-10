import Quill from "quill";
import { getEditor } from "../ui/text-editor";

export const selectEverythingInEditor = ({
  id,
  quill,
}: {
  id?: string;
  quill?: Quill;
}) => {
  const editor = quill ? quill : id ? getEditor(id) : null;
  if (!editor) return;
  const range = editor.getLength();
  editor.setSelection(0, range);
  editor.focus();
};
