import {
  requestFilterTypes,
} from '../../constants';

export const escapingForSpecialCharactersWhichCanBreakCQL = (string = '') => string.replace(/[\\"?*]/g, '\\$&');

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
        return `(tags.tagList==(${value.map(v => `"*\\"*${escapingForSpecialCharactersWhichCanBreakCQL(v)}*\\"*"`).join(' or ')}))`;
      } else {
        return `(tags.tagList==("*\\"*${escapingForSpecialCharactersWhichCanBreakCQL(value)}*\\"*"))`;
      }
    }
  },
  {
    name: requestFilterTypes.PICKUP_SERVICE_POINT,
    cql: 'pickupServicePointId',
    values: [],
    operator: '==',
  },
];
