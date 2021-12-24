import {
  requestFilterTypes,
} from '../../constants';

export default [
  {
    name: 'requestType',
    cql: 'requestType',
    values: [],
    operator: '==',
  },
  {
    label: 'ui-requests.requestMeta.status',
    name: 'requestStatus',
    cql: 'status',
    values: [],
    operator: '==',
  },
  {
    name: requestFilterTypes.REQUEST_LEVELS,
    cql: 'requestLevel',
    values: [],
    operator: '==',
  },
  {
    name: 'tags',
    cql: 'tags.tagList',
    values: [],
    operator: '=',
  },
  {
    name: requestFilterTypes.PICKUP_SERVICE_POINT,
    cql: 'pickupServicePointId',
    values: [],
    operator: '==',
  },
];
