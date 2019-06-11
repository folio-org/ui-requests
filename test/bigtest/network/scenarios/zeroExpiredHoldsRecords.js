/* istanbul ignore file */

export default (server) => {
  server.get('circulation/requests-reports/hold-shelf-clearance/:id', {
    requests: [],
    totalRecords: 0,
  });
};
