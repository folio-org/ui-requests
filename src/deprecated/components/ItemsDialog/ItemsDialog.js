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
  NoValue,
} from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';

import {
  itemStatuses,
  itemStatusesTranslations,
  requestableItemStatuses,
  MAX_RECORDS,
  OPEN_REQUESTS_STATUSES,
} from '../../../constants';
import { Loading } from '../../../components';
import { getStatusQuery } from '../../../routes/utils';

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
  barcode: item => (item?.barcode || <NoValue />),
  itemStatus: item => <FormattedMessage id={itemStatusesTranslations[item.status.name]} />,
  location: item => get(item, 'effectiveLocation.name', <NoValue />),
  materialType: item => item.materialType.name,
  loanType: item => (item.temporaryLoanType ? get(item, 'temporaryLoanType.name', <NoValue />) : get(item, 'permanentLoanType.name', <NoValue />)),
};

export const MAX_HEIGHT = 500;
const CHUNK_SIZE = 40;

const ItemsDialog = ({
  onClose,
  open,
  isLoading,
  onRowClick = noop,
  mutator,
  skippedItemId,
  title = '',
  instanceId,
}) => {
  const [areItemsBeingLoaded, setAreItemsBeingLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const { formatMessage } = useIntl();

  const fetchHoldings = () => {
    const query = `instanceId==${instanceId}`;
    mutator.holdings.reset();

    return mutator.holdings.GET({ params: { query, limit: MAX_RECORDS } });
  };

  const fetchItems = async (holdings) => {
    const chunkedItems = chunk(holdings, CHUNK_SIZE);
    const data = [];

    for (const itemChunk of chunkedItems) {
      const query = itemChunk.map(i => `holdingsRecordId==${i.id}`).join(' or ');

      mutator.items.reset();
      // eslint-disable-next-line no-await-in-loop
      const result = await mutator.items.GET({ params: { query, limit: MAX_RECORDS } });

      data.push(...result);
    }

    return data;
  };

  const fetchRequests = async (itemsList) => {
    // Split the list of items into small chunks to create a short enough query string
    // that we can avoid a "414 Request URI Too Long" response from Okapi.
    const chunkedItems = chunk(itemsList, CHUNK_SIZE);
    const data = [];

    for (const itemChunk of chunkedItems) {
      let query = itemChunk.map(i => `itemId==${i.id}`).join(' or ');
      const statusQuery = getStatusQuery(OPEN_REQUESTS_STATUSES);

      query = `(${query}) and (${statusQuery})")`;

      mutator.requests.reset();
      // eslint-disable-next-line no-await-in-loop
      const result = await mutator.requests.GET({ params: { query, limit: MAX_RECORDS } });

      data.push(...result);
    }

    return data;
  };

  useLayoutEffect(() => {
    const getItems = async () => {
      setAreItemsBeingLoaded(true);

      const holdings = await fetchHoldings();
      let itemsList = await fetchItems(holdings);

      if (skippedItemId) {
        itemsList = itemsList.filter(item => requestableItemStatuses.includes(item.status?.name));
      }

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
  },
  // The deps react-hooks complains about here are the fetch* functions
  // but both the suggestions (making them deps, moving them inside this
  // function) cause test failures. I ... don't really understand the
  // details of the problem, beyond the fact that it's obviously some kind
  // of bad interaction between hooks and stripes-connect.
  //
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [instanceId, open]);

  const contentData = useMemo(() => {
    let resultItems = items;

    if (skippedItemId) {
      resultItems = resultItems
        .filter(item => skippedItemId !== item.id);
    }

    // items with status available must go first
    resultItems.sort((a) => (a.status.name === itemStatuses.AVAILABLE ? -1 : 1));
    return resultItems.map(item => ({
      ...item,
      status: {
        ...item.status,
      },
    }));
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
