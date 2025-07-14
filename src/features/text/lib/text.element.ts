export const getQuillId = (id: string) => {
  return `quill-editor-${id}`;
};

export const getQlEditorElement = (id: string) => {
  return document.getElementById(getQuillId(id));
};

export const getQlEditor = (id: string) => {
  const qlEditor = document.querySelector(`#${id} .ql-editor`);
  if (!qlEditor) {
    throw new Error('Quill editor not found');
  }
  return qlEditor as HTMLElement;
};
