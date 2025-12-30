import {
  getTlrSettings,
  getRequester,
} from './utils';

describe('utils', () => {
  describe('getTlrSettings', () => {
    const defaultSettings = {
      titleLevelRequestsFeatureEnabled: true,
      createTitleLevelRequestsByDefault: false,
    };

    it('should return passed settings', () => {
      expect(getTlrSettings(defaultSettings)).toEqual(defaultSettings);
    });

    it('should return empty object if nothing passed', () => {
      expect(getTlrSettings()).toEqual({});
    });
  });

  describe('getRequester', () => {
    const selectedUser = {
      id: 'selectedUserId',
    };

    it('should return proxy user', () => {
      const proxy = {
        id: 'proxyId',
      };

      expect(getRequester(proxy, selectedUser)).toEqual(proxy);
    });

    it('should return selected user', () => {
      expect(getRequester(null, selectedUser)).toEqual(selectedUser);
    });
  });
});
