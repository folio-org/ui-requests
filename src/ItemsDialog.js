import React, {
  useState,
  useLayoutEffect,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import {
  get,
  noop,
  countBy,
  chunk,
} from 'lodash';
import {
  useIntl,
  FormattedMessage,
} from 'react-intl';

import {
  Modal,
  MultiColumnList,
  Pane,
  Paneset,
} from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';

import { itemStatuses } from './constants';
import { Loading } from './components';

import css from './ItemsDialog.css';

export const COLUMN_NAMES = [
  'barcode',
  'itemStatus',
  'requestQueue',
  'location',
  'materialType',
  'loanType',
];

export const COLUMN_WIDTHS = {
  barcode: '16%',
  itemStatus: '16%',
  requestQueue: '16%',
  location: '16%',
  materialType: '16%',
  loanType: '16%',
};

export const COLUMN_MAP = {
  barcode: <FormattedMessage id="ui-requests.barcode" />,
  itemStatus: <FormattedMessage id="ui-requests.item.status" />,
  requestQueue: <FormattedMessage id="ui-requests.requestQueue" />,
  location: <FormattedMessage id="ui-requests.location" />,
  materialType: <FormattedMessage id="ui-requests.materialType" />,
  loanType: <FormattedMessage id="ui-requests.loanType" />,
};

export const formatter = {
  itemStatus: item => item.status.name,
  location: item => get(item, 'effectiveLocation.name', ''),
  materialType: item => item.materialType.name,
  loanType: item => (item.temporaryLoanType ? get(item, 'temporaryLoanType.name', '') : get(item, 'permanentLoanType.name', '')),
};

export const MAX_HEIGHT = 500;

const ItemsDialog = ({
  onClose,
  open,
  isLoading,
  onRowClick = noop,
  mutator,
  skippedItemId,
  title,
  instanceId,
}) => {
  const [areItemsBeingLoaded, setAreItemsBeingLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const { formatMessage } = useIntl();

  const fetchHoldings = () => {
    const query = `instanceId==${instanceId}`;
    mutator.holdings.reset();

    return mutator.holdings.GET({ params: { query } });
  };

  const fetchItems = (holdings) => {
    const query = holdings.map(h => `holdingsRecordId==${h.id}`).join(' or ');
    mutator.items.reset();

    return mutator.items.GET({ params: { query, limit: 1000 } });
  };

  const fetchRequests = async (itemsList) => {
    // Split the list of items into small chunks to create a short enough query string
    // that we can avoid a "414 Request URI Too Long" response from Okapi.
    const CHUNK_SIZE = 40;

    const chunkedItems = chunk(itemsList, CHUNK_SIZE);

    const data = [];

    for (const itemChunk of chunkedItems) {
      let query = itemChunk.map(i => `itemId==${i.id}`).join(' or ');
      query = `(${query}) and (status="Open")`;

      mutator.requests.reset();
      // eslint-disable-next-line no-await-in-loop
      const result = await mutator.requests.GET({ params: { query, limit: 1000 } });

      data.push(...result);
    }

    return data;
  };

  useLayoutEffect(() => {
    const getItems = async () => {
      setAreItemsBeingLoaded(true);

      const holdings = await fetchHoldings();
      let itemsList = await fetchItems(holdings);
      const requests = await fetchRequests(itemsList);
      const requestMap = countBy(requests, 'itemId');

      itemsList = itemsList.map(item => ({ ...item, requestQueue: requestMap[item.id] || 0 }));

      setAreItemsBeingLoaded(false);
      setItems(itemsList);
    };

    if (open && instanceId) {
      getItems();
    }

    return () => setItems([]);
  }, [
    open,
    instanceId,
  ]);

  const contentData = useMemo(() => {
    let resultItems = items;

    if (skippedItemId) {
      resultItems = resultItems
        .filter(item => skippedItemId !== item.id);
    }

    // items with status available must go first
    // eslint-disable-next-line no-confusing-arrow
    return resultItems.sort((a) => a.status.name === itemStatuses.AVAILABLE ? -1 : 1);
  }, [items, skippedItemId]);

  const itemsAmount = contentData.length;

  return (
    <Modal
      data-test-move-request-modal
      label={formatMessage({ id: 'ui-requests.items.selectItem' })}
      open={open}
      contentClass={css.content}
      onClose={onClose}
      dismissible
    >
      <Paneset
        id="itemsDialog"
        isRoot
        static
      >
        <Pane
          id="items-dialog-instance-items-list"
          paneTitle={formatMessage({ id: 'ui-requests.items.instanceItems' }, { title })}
          paneSub={formatMessage({ id: 'ui-requests.resultCount' }, { count: itemsAmount })}
          defaultWidth="fill"
        >
          {isLoading || areItemsBeingLoaded
            ? <Loading data-testid="loading" />
            : <MultiColumnList
              id="instance-items-list"
              interactive
              ariaLabel={formatMessage({ id: 'ui-requests.items.instanceItems' })}
              contentData={contentData}
              visibleColumns={COLUMN_NAMES}
              columnMapping={COLUMN_MAP}
              columnWidths={COLUMN_WIDTHS}
              formatter={formatter}
              maxHeight={MAX_HEIGHT}
              isEmptyMessage={formatMessage({ id: 'ui-requests.items.instanceItems.notFound' })}
              onRowClick={onRowClick}
            />
          }
        </Pane>
      </Paneset>
    </Modal>
  );
};

ItemsDialog.manifest = {
  holdings: {
    type: 'okapi',
    records: 'holdingsRecords',
    path: 'holdings-storage/holdings',
    accumulate: true,
    fetch: false,
  },
  items: {
    type: 'okapi',
    records: 'items',
    path: 'inventory/items',
    accumulate: true,
    fetch: false,
  },
  requests: {
    type: 'okapi',
    path: 'circulation/requests',
    records: 'requests',
    accumulate: true,
    fetch: false,
  },
};

ItemsDialog.defaultProps = {
  title: '',
};

ItemsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  instanceId: PropTypes.string,
  skippedItemId: PropTypes.string,
  onRowClick: PropTypes.func,
  mutator: PropTypes.shape({
    holdings: PropTypes.shape({
      GET: PropTypes.func.isRequired,
      reset: PropTypes.func.isRequired,
    }).isRequired,
    items: PropTypes.shape({
      GET: PropTypes.func.isRequired,
      reset: PropTypes.func.isRequired,
    }).isRequired,
    requests: PropTypes.shape({
      GET: PropTypes.func.isRequired,
      reset: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};

export default stripesConnect(ItemsDialog);
