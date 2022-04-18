import { noop } from 'lodash';

// eslint-disable-next-line import/prefer-default-export
export const buildStripes = (otherProperties = {}) => ({
  hasPerm: noop,
  hasInterface: noop,
  clone: noop,
  logger: { log: noop },
  config: {},
  okapi: {
    url: '',
    tenant: '',
  },
  withOkapi: true,
  setToken: noop,
  actionNames: [],
  setLocale: noop,
  setTimezone: noop,
  setCurrency: noop,
  setSinglePlugin: noop,
  setBindings: noop,
  connect: noop,
  ...otherProperties,
});
