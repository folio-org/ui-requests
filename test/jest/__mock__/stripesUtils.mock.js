import React from 'react';

jest.mock('@folio/stripes/util', () => ({
  exportCsv: jest.fn(),
  effectiveCallNumber: jest.fn().mockReturnValue('effectiveCallNumber'),
  getHeaderWithCredentials: jest.fn()
}));
