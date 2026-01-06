export const getTlrSettings = (settings) => settings || {};

export const getRequester = (proxy, selectedUser) => {
  if (proxy && proxy.id !== selectedUser?.id) {
    return proxy;
  }

  return selectedUser;
};
