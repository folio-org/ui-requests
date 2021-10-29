import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  noop,
  orderBy,
} from 'lodash';
import {
  useIntl,
  FormattedMessage,
} from 'react-intl';

import {
  Modal,
  MultiColumnList,
  Pane,
} from '@folio/stripes/components';
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
  request: {
    item: {
      title,
    },
  },
  onClose,
  open,
  items,
  isLoading,
  onRowClick = noop,
}) => {
  const { formatMessage } = useIntl();
  const contentData = orderBy(items, 'requestQueue');
  const count = items.length;

  return (
    <Modal
      data-test-move-request-modal
      label={formatMessage({ id: 'ui-requests.items.selectItem' })}
      open={open}
      contentClass={css.content}
      onClose={onClose}
      dismissible
    >
      <Pane
        paneTitle={formatMessage({ id: 'ui-requests.items.instanceItems' }, { title })}
        paneSub={formatMessage({ id: 'ui-requests.resultCount' }, { count })}
        defaultWidth="fill"
        noOverflow
      >
        {isLoading
          ? <Loading />
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
    </Modal>
  );
};

ItemsDialog.defaultProps = {
  items: [],
};

ItemsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  request: PropTypes.shape({
    item: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      records: PropTypes.array,
      requestQueue: PropTypes.number.isRequired,
    })
  ),
  onRowClick: PropTypes.func,
};

export default ItemsDialog;
