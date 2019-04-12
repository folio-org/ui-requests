import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: (i) => 'requestId' + i,
  requestType: () => faker.random.arrayElement(['Hold', 'Page', 'Recall']),
  requestDate: () => faker.date.past().toISOString().substring(0, 10),
  itemId: () => 'bb5a6689-c008-4c96-8f8f-b666850ee12d',
  status: () => 'Open - Not yet filled',
  position: (i) => i + 1,
  item: () => {
    return {
      title: 'Interesting Times',
      barcode: '326547658598',
      holdingsRecordId: '67cd0046-e4f1-4e4f-9024-adf0b0039d09',
      instanceId: 'a89eccf0-57a6-495e-898d-32b9b2210f2f',
      location: {
        name: 'SECOND FLOOR'
      },
      contributorNames: [{
        name: 'Pratchett, Terry'
      }],
      status: 'Checked out',
      callNumber: 'D15.H63 A3 2002'
    };
  },
  fulfilmentPreference: 'Hold Shelf',
  holdShelfExpirationDate: '2017-01-20',
  loan: {
    dueDate: '2017-09-19T12:42:21.000Z'
  },
  afterCreate(request, server) {
    const user = server.create('user');
    request.update('requesterId', user.id);
    request.update('requester', {
      lastName: user.personal.lastName,
      firstName: user.personal.firstName,
      barcode: user.barcode,
      patronGroup: {
        id: user.patronGroup,
        group: 'test',
        desc: 'test'
      },
      patronGroupId: user.patronGroup,
    });
    request.save();
  }
});
