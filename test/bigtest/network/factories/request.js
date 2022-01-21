import { Factory, trait } from 'miragejs';
import faker from 'faker';

import { REQUEST_LEVEL_TYPES } from '../../../../src/constants';

export default Factory.extend({
  id: (i) => 'requestId' + i,
  // requestType: () => faker.random.arrayElement(['Hold', 'Page', 'Recall']),
  // Including 'Page' as a request type here causes some tests to fail inconsistently
  // because the choose request type dialog in MoveRequestManager isn't always required,
  // depending on the destination request type. Taking it out of the equation for now.
  requestType: () => faker.random.arrayElement(['Hold', 'Recall']),
  requestDate: () => faker.date.past().toISOString().substring(0, 10),
  status: () => 'Open - Not yet filled',
  position: (i) => i + 1,
  itemRequestCount: (i) => i + 1,
  fulfilmentPreference: 'Hold Shelf',
  pickupServicePointId: 'servicepointId1',
  holdShelfExpirationDate: '2017-01-20',
  loan: {
    dueDate: '2017-09-19T12:42:21.000Z',
  },
  tags: { tagList: ['tag1'] },
  afterCreate(request, server) {
    const user = server.create('user');
    const instance = server.create('instance', 'withHoldingAndItems');
    const item = instance.holdings.models[0].items.models[0].attrs;

    request.update({
      requestLevel: REQUEST_LEVEL_TYPES.ITEM,
      holdingsRecordId: item.holdingsRecordId,
      instanceId: item.instanceId,
      instance: {
        title: item.title,
        contributorNames: item.contributorNames,
      },
      item: {
        barcode: item.barcode,
        status: item.status,
      },
      itemId: item.id,
      requesterId: user.id,
      requester: {
        lastName: user.personal.lastName,
        firstName: user.personal.firstName,
        barcode: user.barcode,
        patronGroup: {
          id: user.patronGroup,
          group: 'test',
          desc: 'test',
        },
        patronGroupId: user.patronGroup,
      },
      metadata: {
        createdDate: '2020-07-07T03:56:29.238+0000',
        createdByUserId: '4d088ad2-fc70-5142-bd4d-9b60707846af',
        updatedDate: '2020-07-07T03:56:29.238+0000',
        updatedByUserId: '4d088ad2-fc70-5142-bd4d-9b60707846af',
      },
      deliveryAddressTypeId: user.personal.addresses[0].addressTypeId,
    });
  },

  withPagedItems: trait({
    afterCreate(request, server) {
      const user = server.create('user');
      const instance = server.create('instance', 'withHoldingAndPagedItems');
      const item = instance.holdings.models[0].items.models[0].attrs;

      request.update({
        requestLevel: REQUEST_LEVEL_TYPES.ITEM,
        holdingsRecordId: item.holdingsRecordId,
        instanceId: item.instanceId,
        instance: {
          title: item.title,
          contributorNames: item.contributorNames,
        },
        item: {
          barcode: item.barcode,
          status: item.status,
        },
        itemId: item.id,
        requesterId: user.id,
        requester: {
          lastName: user.personal.lastName,
          firstName: user.personal.firstName,
          barcode: user.barcode,
          patronGroup: {
            id: user.patronGroup,
            group: 'test',
            desc: 'test',
          },
          patronGroupId: user.patronGroup,
        },
        deliveryAddressTypeId: user.personal.addresses[0].addressTypeId,
      });
    },
  }),

  withCallNumber: trait({
    afterCreate(request, server) {
      const item = server.create('item', {
        callNumberComponents: {
          prefix: 'prefix',
          callNumber: 'callNumber',
          suffix: 'suffix',
        },
        volume: 'volume',
        enumeration: 'enumeration',
        chronology: 'chronology',
      });

      request.update({
        requestLevel: REQUEST_LEVEL_TYPES.ITEM,
        holdingsRecordId: item.holdingsRecordId,
        instanceId: item.instanceId,
        instance: {
          title: item.title,
          contributorNames: item.contributorNames,
        },
        item: {
          barcode: item.barcode,
          status: item.status,
        },
        itemId: item.id,
      });
    },
  }),
});
