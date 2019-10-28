const urls = {
  requests: () => '/requests',
  requestView: id => `/requests/view/${id}`,
  requestQueueView: id => `/requests/view/${id}/reorder`,
};

export default urls;
