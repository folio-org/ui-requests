export default function (server) {
  server.createList('request', 3, { requestType: 'Hold' }, 'withPagedItems', 'withCallNumber');
}
