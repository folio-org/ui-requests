import { getTlrSettings } from './utils';

describe('utils', () => {
  describe('getTlrSettings', () => {
    const defaultSettings = {
      titleLevelRequestsFeatureEnabled: true,
      createTitleLevelRequestsByDefault: false,
    };

    it('should return passed settings', () => {
      expect(getTlrSettings(JSON.stringify(defaultSettings))).toEqual(defaultSettings);
    });

    it('should return empty object if nothing passed', () => {
      expect(getTlrSettings()).toEqual({});
    });
  });
});
