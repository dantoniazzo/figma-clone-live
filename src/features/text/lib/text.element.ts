export const getQlEditor = (id: string) => {
  const qlEditor = document.querySelector(`#${id} .ql-editor`);
  if (!qlEditor) {
    throw new Error("Quill editor not found");
  }
  return qlEditor as HTMLElement;
};
