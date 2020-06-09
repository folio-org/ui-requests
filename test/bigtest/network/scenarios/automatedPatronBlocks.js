/* istanbul ignore file */

export default (server) => {
  server.get('/automated-patron-blocks/:id', {
    automatedPatronBlocks: [{
      'patronBlockConditionId': 'ac13a725-b25f-48fa-84a6-4af021d13afe',
      'blockBorrowing': false,
      'blockRenewals': false,
      'blockRequests': true,
      'message': 'Patron has reached maximum allowed outstanding fee/fine balance for his/her patron group'
    }],
    totalRecords: 1,
  });
};
