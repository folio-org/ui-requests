/* istanbul ignore file */

// default scenario is used during `yarn start --mirage`
export default function defaultScenario(server) {
  server.create('servicePoint', {
    id: 'servicepointId1',
    name: 'Circ Desk 1',
    code: 'cd1',
    discoveryDisplayName: 'Circulation Desk -- Hallway',
    pickupLocation: true,
  });

  server.createList('request', 20);

  server.create('user', {
    id: '123',
    barcode: '',
  });

  const servicePoint = server.create('servicePoint', {
    id: 'servicepointId2',
    name: 'Circ Desk 2',
    code: 'cd2',
    discoveryDisplayName: 'Circulation Desk -- Back Entrance',
    pickupLocation: true,
  });

  server.create('cancellationReason', {
    name: 'Patron Cancelled',
    description: 'Cancelled at patron’s request',
    requiresAdditionalInformation: false,
  });

  server.create('cancellationReason', {
    name: 'Other',
    description: 'Other',
    requiresAdditionalInformation: true,
  });

  server.create('cancellationReason', {
    name: 'Needed For Course Reserves',
    description: 'Item is needed for course reserves',
    publicDescription: 'Item is no longer available for request',
    requiresAdditionalInformation: false,
  });

  server.create('cancellationReason', {
    name: 'Item Not Available',
    description: 'Item is no longer available',
    requiresAdditionalInformation: false,
  });

  server.get('/circulation/requests-reports/hold-shelf-clearance/:id', {
    'requests': [
      {
        'id': 'f5cec279-0da6-4b44-a3df-f49b0903f325',
        'requestType': 'Hold',
        'requestDate': '2017-08-05T11:43:23Z',
        'requesterId': '61d939e4-f2ae-4c53-95d2-224a802fa2a6',
        'itemId': '3e5d5433-a271-499c-94f4-5f3e4652e537',
        'fulfilmentPreference': 'Hold Shelf',
        'requestExpirationDate': '2017-08-31T22:25:37Z',
        'holdShelfExpirationDate': '2017-09-01T22:25:37Z',
        'position': 1,
        'status': 'Closed - Pickup expired',
        'pickupServicePointId': servicePoint.id,
        'awaitingPickupRequestClosedDate': '2019-03-11T15:45:23.000+0000',
        'item': {
          'title': 'Children of Time',
          'barcode': '760932543816',
          'callNumber': 'A344JUI'
        },
        'requester': {
          'firstName': 'Stephen',
          'lastName': 'Jones',
          'middleName': 'Anthony',
          'barcode': '567023127436'
        }
      }
    ],
    'totalRecords': 1
  });
}
