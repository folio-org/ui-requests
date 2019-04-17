import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: (i) => 'requestId' + i,
  requestType: () => faker.random.arrayElement(['Hold', 'Page', 'Recall']),
  requestDate: () => faker.date.past().toISOString().substring(0, 10),
  status: () => 'Open - Not yet filled',
  position: (i) => i + 1,
  fulfilmentPreference: 'Hold Shelf',
  holdShelfExpirationDate: '2017-01-20',
  loan: {
    dueDate: '2017-09-19T12:42:21.000Z',
  },
  afterCreate(request, server) {
    const user = server.create('user');
    const item = server.create('item');

    request.update({
      item: item.attrs,
      itemId: item.id,
      requesterId: user.id,
      requester: {
        lastName: user.personal.lastName,
        firstName: user.personal.firstName,
        barcode: user.barcode,
        patronGroup: {
          id: user.patronGroup,
          group: 'test',
          desc: 'test'
        },
        patronGroupId: user.patronGroup,
      },
      deliveryAddressTypeId: user.personal.addresses[0].addressTypeId
    });
  }
});
