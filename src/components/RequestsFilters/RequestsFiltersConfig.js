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
    operator: '==',
    parse: (value) => {
      if (Array.isArray(value)) {
        return `tags.tagList==(${value.map(v => `"*${v}*"`)
          .join(' or ')})`;
      } else return `tags.tagList=="*${value}*"`;
    }
  },
  {
    name: requestFilterTypes.PICKUP_SERVICE_POINT,
    cql: 'pickupServicePointId',
    values: [],
    operator: '==',
  },
];
