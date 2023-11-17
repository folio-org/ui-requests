import {
  Router,
} from 'react-router-dom';
import {
  createMemoryHistory,
} from 'history';

import {
  render,
  act,
} from '@folio/jest-config-stripes/testing-library/react';

import RequestFormContainer from './RequestFormContainer';
import RequestForm from './RequestForm';

jest.mock('./RequestForm', () => jest.fn(() => <div>RequestForm</div>));

const data = {
  requestExpirationDate: '',
  holdShelfExpirationDate: '',
  holdShelfExpirationTime: '',
  fulfillmentPreference: '',
  deliveryAddressTypeId: '',
  pickupServicePointId: '',
  itemId: '',
  holdingsRecordId: '',
  item: '',
  itemRequestCount: '',
  titleRequestCount: '',
  createTitleLevelRequest: '',
  numberOfReorderableRequests: '',
  instance: '',
  keyOfItemBarcodeField: '',
  keyOfUserBarcodeField: '',
  keyOfInstanceIdField: '',
};

const renderContainerRequestForm = ({
  history = createMemoryHistory(),
  parentResources,
  request,
  ...rest
} = {}) => {
  return render(
    <Router history={history}>
      <RequestFormContainer
        parentResources={parentResources}
        request={request}
        {...rest}
      />
    </Router>
  );
};

describe('RequestFormContainer', () => {
  const onSubmit = jest.fn();

  const commonProps = {
    onSubmit,
  };

  beforeEach(() => {
    RequestForm.mockClear();
  });

  it('should be rendered', () => {
    const { container } = renderContainerRequestForm(commonProps);
    expect(container).toBeVisible();
  });

  describe('handle Submit', () => {
    it('should display the PatronBlockModal', () => {
      const userId = '123';
      renderContainerRequestForm({
        ...commonProps,
        parentResources: {
          patronBlocks: {
            records: [
              {
                requests: true,
                userId,
              },
            ],
          },
        },
      });

      act(() => { RequestForm.mock.calls[0][0].onSetSelectedUser({ id: userId }); });
      act(() => { RequestForm.mock.calls[1][0].onSubmit(data); });
      expect(RequestForm.mock.calls[2][0].blocked).toBeTruthy();
    });

    it('should pass correct payload', () => {
      const payload = {
        deliveryAddressTypeId: '',
        fulfillmentPreference: '',
        holdShelfExpirationTime: '',
        holdingsRecordId: undefined,
        instanceId: undefined,
        pickupServicePointId: '',
        requestLevel: 'Item',
        item: '',
        itemId: '',
      };
      renderContainerRequestForm(commonProps);
      act(() => { RequestForm.mock.calls[0][0].onSetSelectedUser({ id: '123' }); });
      act(() => { RequestForm.mock.calls[1][0].onSubmit(data); });
      expect(onSubmit).toHaveBeenCalledWith(payload);
    });
  });
});
