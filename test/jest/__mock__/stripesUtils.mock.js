import React from 'react';

jest.mock('@folio/stripes/util', () => ({
  exportCsv: jest.fn(),
  effectiveCallNumber: jest.fn(),
  getHeaderWithCredentials: jest.fn()
}));
