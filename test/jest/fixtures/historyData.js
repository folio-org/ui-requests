export const historyData = {
  length: 42,
  action: 'PUSH',
  location: {
    hash: '',
    key: '9pb09t',
    pathname: '/users/notes/new',
    search: '?instanceId=12345&foo=bar',
    state: {
      entityId: '2205005b-ca51-4a04-87fd-938eefa8f6de',
      entityName: 'rick, psych',
      entityType: 'user',
      referredRecordData: {
        instanceId: 'testInstanceId',
        instanceTitle: 'testInstanceTitle',
        itemBarcode: '90909090',
        itemId: 'testItemId',
        holdingsRecordId: 'testHoldingsRecordId',
        requestCreateDate: '2023-04-05',
        request: {
          requesterId: 'testRequesterId',
          requester: {
            lastName: 'testRequesterName',
          }
        }
      }
    }
  },
  createHref: () => {},
  push: jest.fn(),
  replace: jest.fn(),
  go: () => {},
  goBack: () => {},
  goForward: () => {},
  block: () => {},
  listen: () => {},
};
