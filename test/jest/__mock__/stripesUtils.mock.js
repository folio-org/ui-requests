import React from 'react';

jest.mock('@folio/stripes/util', () => ({
  effectiveCallNumber: jest.fn().mockReturnValue('effectiveCallNumber'),
  getHeaderWithCredentials: jest.fn()
}));
