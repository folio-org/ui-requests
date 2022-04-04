const urls = {
  requests: () => '/requests',
  requestView: id => `/requests/view/${id}`,
  requestQueueView: (requestId, id) => `/requests/view/${requestId}/${id}/reorder`,
};

export default urls;
