const urls = {
  requests: () => '/requests',
  requestView: id => `/requests/view/${id}`,
  requestQueueView: (requestId, itemId) => `/requests/view/${requestId}/${itemId}/reorder`,
};

export default urls;
