import Quill from "quill";

export interface TextEditorProps {
  id: string;
}

export const TextEditor = (props: TextEditorProps) => {
  const quill = new Quill(`#${props.id}`, {
    placeholder: "Write something...",
    bounds: `#${props.id}`,
    theme: "snow",
  });

  return quill;
};

export const getEditor = (id: string) => {
  const editorContainer = document.getElementById(id);
  if (!editorContainer) return null;
  return Quill.find(editorContainer) as Quill;
};
