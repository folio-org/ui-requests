export const getTlrSettings = (settings) => {
  try {
    return JSON.parse(settings);
  } catch (error) {
    return {};
  }
};

export const getRequester = (proxy, selectedUser) => {
  if (proxy && proxy.id !== selectedUser?.id) {
    return proxy;
  }

  return selectedUser;
};
