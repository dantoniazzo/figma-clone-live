export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e: unknown) {
    console.error(e);
    return false;
  }
  return true;
};
