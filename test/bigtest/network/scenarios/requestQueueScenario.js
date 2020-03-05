export default function (server) {
  server.createList('request', 3, { requestType: 'Page' }, 'withPagedItems', 'withCallNumber');
}
