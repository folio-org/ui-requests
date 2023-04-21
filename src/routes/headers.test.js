import {
  REQUEST_PARTS,
  HEADER_KEYS,
  CONTENT_TYPES,
  getTenant,
  getToken,
  getHeader,
  getHeaderWithCredentials,
} from './headers';

describe('headers', () => {
  const tenant = 'tenant';
  const token = 'token';

  describe('getTenant', () => {
    it('should return tenant', () => {
      expect(getTenant({
        tenant,
      })).toEqual({
        [HEADER_KEYS.TENANT]: tenant,
      });
    });

    it('should return empty object', () => {
      expect(getTenant()).toEqual({});
    });
  });

  describe('getToken', () => {
    it('should return token', () => {
      expect(getToken({
        token,
      })).toEqual({
        [HEADER_KEYS.TOKEN]: token,
      });
    });

    it('should return empty object', () => {
      expect(getToken()).toEqual({});
    });
  });

  describe('getHeader', () => {
    it('should return header', () => {
      expect(getHeader({
        tenant,
        token,
      })).toEqual({
        [REQUEST_PARTS.HEADERS]: {
          [HEADER_KEYS.TENANT]: tenant,
          [HEADER_KEYS.TOKEN]: token,
          [HEADER_KEYS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
        },
      });
    });

    it('should return header with out tenant', () => {
      expect(getHeader({
        token,
      })).toEqual({
        [REQUEST_PARTS.HEADERS]: {
          [HEADER_KEYS.TOKEN]: token,
          [HEADER_KEYS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
        },
      });
    });

    it('should return header with out token', () => {
      expect(getHeader({
        tenant,
      })).toEqual({
        [REQUEST_PARTS.HEADERS]: {
          [HEADER_KEYS.TENANT]: tenant,
          [HEADER_KEYS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
        },
      });
    });

    it('should return content types', () => {
      expect(getHeader()).toEqual({
        [REQUEST_PARTS.HEADERS]: {
          [HEADER_KEYS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
        },
      });
    });
  });

  describe('getHeaderWithCredentials', () => {
    it('should return header and credentials', () => {
      expect(getHeaderWithCredentials({
        tenant,
        token
      })).toEqual({
        [REQUEST_PARTS.HEADERS]: {
          [HEADER_KEYS.TENANT]: tenant,
          [HEADER_KEYS.TOKEN]: token,
          [HEADER_KEYS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
        },
        [REQUEST_PARTS.CREDENTIALS]: 'include',
      });
    });

    it('should return content types and credentials', () => {
      expect(getHeaderWithCredentials()).toEqual({
        [REQUEST_PARTS.HEADERS]: {
          [HEADER_KEYS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
        },
        [REQUEST_PARTS.CREDENTIALS]: 'include',
      });
    });
  });
});
