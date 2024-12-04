import {
  useState,
} from 'react';
import {
  useIntl,
} from 'react-intl';
import {
  cloneDeep,
  isEmpty,
  isString,
  unset,
} from 'lodash';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';

import RequestForm from './RequestForm';
import {
  getRequestLevelValue,
} from './utils';
import {
  fulfillmentTypeMap,
  REQUEST_LEVEL_TYPES,
  RESOURCE_TYPES,
} from './constants';

const RequestFormContainer = ({
  parentResources,
  request,
  onSubmit,
  isEcsTlrSettingEnabled,
  ...rest
}) => {
  const {
    requester,
    requesterId,
    item,
  } = request || {};
  const intl = useIntl();
  const [selectedItem, setSelectedItem] = useState(item);
  const [selectedUser, setSelectedUser] = useState({ ...requester, id: requesterId });
  const [selectedInstance, setSelectedInstance] = useState(request?.instance);
  const [isPatronBlocksOverridden, setIsPatronBlocksOverridden] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const setItem = (optedItem) => {
    setSelectedItem(optedItem);
  };

  const setUser = (user) => {
    setSelectedUser(user);
  };

  const setInstance = (instance) => {
    setSelectedInstance(instance);
  };

  const setIsBlocked = (value) => {
    setBlocked(value);
  };

  const setStateIsPatronBlocksOverridden = (value) => {
    setIsPatronBlocksOverridden(value);
  };

  const getPatronManualBlocks = (resources) => {
    return (resources?.patronBlocks?.records || [])
      .filter(b => b.requests === true)
      .filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
  };

  const getAutomatedPatronBlocks = (resources) => {
    const automatedPatronBlocks = resources?.automatedPatronBlocks?.records || [];

    return automatedPatronBlocks.reduce((blocks, block) => {
      if (block.blockRequests) {
        blocks.push(block.message);
      }

      return blocks;
    }, []);
  };

  const hasBlocking = () => {
    const [block = {}] = getPatronManualBlocks(parentResources);
    const automatedPatronBlocks = getAutomatedPatronBlocks(parentResources);
    const isBlocked = (
      (block?.userId === selectedUser.id || !isEmpty(automatedPatronBlocks)) &&
      !isPatronBlocksOverridden
    );

    setIsBlocked(isBlocked);

    return isBlocked;
  };

  const handleSubmit = (data) => {
    const {
      timeZone,
    } = intl;

    const requestData = cloneDeep(data);

    const {
      requestExpirationDate,
      holdShelfExpirationDate,
      holdShelfExpirationTime,
      fulfillmentPreference,
      deliveryAddressTypeId,
      pickupServicePointId,
    } = requestData;

    if (hasBlocking()) return undefined;

    if (!requestExpirationDate) {
      unset(requestData, 'requestExpirationDate');
    }
    if (holdShelfExpirationDate) {
      // Recombine the values from datepicker and timepicker into a single date/time
      const date = moment.tz(holdShelfExpirationDate, timeZone).format('YYYY-MM-DD');
      const time = holdShelfExpirationTime.replace('Z', '');
      const combinedDateTime = moment.tz(`${date} ${time}`, timeZone);
      requestData.holdShelfExpirationDate = combinedDateTime.utc().format();
    } else {
      unset(requestData, 'holdShelfExpirationDate');
    }
    if (fulfillmentPreference === fulfillmentTypeMap.HOLD_SHELF && isString(deliveryAddressTypeId)) {
      unset(requestData, 'deliveryAddressTypeId');
    }
    if (fulfillmentPreference === fulfillmentTypeMap.DELIVERY && isString(pickupServicePointId)) {
      unset(requestData, 'pickupServicePointId');
    }

    if (isPatronBlocksOverridden) {
      requestData.requestProcessingParameters = {
        overrideBlocks: {
          patronBlock: {},
        },
      };
    }

    requestData.instanceId = request?.instanceId || selectedInstance?.id || selectedItem?.instanceId;
    requestData.requestLevel = request?.requestLevel || getRequestLevelValue(requestData.createTitleLevelRequest);

    if (requestData.requestLevel === REQUEST_LEVEL_TYPES.ITEM) {
      requestData.holdingsRecordId = request?.holdingsRecordId || selectedItem?.holdingsRecordId;
    }

    if (requestData.requestLevel === REQUEST_LEVEL_TYPES.TITLE) {
      unset(requestData, 'itemId');
      unset(requestData, 'holdingsRecordId');
      unset(requestData, RESOURCE_TYPES.ITEM);
    }

    unset(requestData, 'itemRequestCount');
    unset(requestData, 'titleRequestCount');
    unset(requestData, 'createTitleLevelRequest');
    unset(requestData, 'numberOfReorderableRequests');
    unset(requestData, RESOURCE_TYPES.INSTANCE);
    unset(requestData, 'keyOfItemBarcodeField');
    unset(requestData, 'keyOfUserBarcodeField');
    unset(requestData, 'keyOfInstanceIdField');
    unset(requestData, 'keyOfRequestTypeField');

    return onSubmit(requestData);
  };

  return (
    <RequestForm
      {...rest}
      parentResources={parentResources}
      request={request}
      blocked={blocked}
      intl={intl}
      selectedItem={selectedItem}
      selectedUser={selectedUser}
      selectedInstance={selectedInstance}
      isPatronBlocksOverridden={isPatronBlocksOverridden}
      onGetPatronManualBlocks={getPatronManualBlocks}
      onGetAutomatedPatronBlocks={getAutomatedPatronBlocks}
      onSetBlocked={setIsBlocked}
      onSetSelectedItem={setItem}
      onSetSelectedUser={setUser}
      onSetSelectedInstance={setInstance}
      onSetIsPatronBlocksOverridden={setStateIsPatronBlocksOverridden}
      onSubmit={handleSubmit}
      isEcsTlrSettingEnabled={isEcsTlrSettingEnabled}
    />
  );
};

RequestFormContainer.propTypes = {
  request: PropTypes.object,
  parentResources: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isEcsTlrSettingEnabled: PropTypes.bool.isRequired,
};

export default RequestFormContainer;
