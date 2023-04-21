export const REQUEST_PARTS = {
  HEADERS: 'headers',
  CREDENTIALS: 'credentials',
};

export const HEADER_KEYS = {
  TENANT: 'X-Okapi-Tenant',
  TOKEN: 'X-Okapi-Token',
  CONTENT_TYPE: 'Content-Type',
};

export const CONTENT_TYPES = {
  JSON: 'application/json',
};

export const getTenant = (okapi = {}) => (
  okapi.tenant ? { [HEADER_KEYS.TENANT]: okapi.tenant } : {}
);

export const getToken = (okapi = {}) => (
  okapi.token ? { [HEADER_KEYS.TOKEN]: okapi.token } : {}
);

export const getHeader = (okapi = {}) => (
  {
    [REQUEST_PARTS.HEADERS]: {
      ...getTenant(okapi),
      ...getToken(okapi),
      [HEADER_KEYS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
    },
  }
);

export const getHeaderWithCredentials = (okapi = {}) => (
  {
    ...getHeader(okapi),
    [REQUEST_PARTS.CREDENTIALS]: 'include',
  }
);
