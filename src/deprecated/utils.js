export const getTlrSettings = (settings) => {
  try {
    return JSON.parse(settings);
  } catch (error) {
    return {};
  }
};
