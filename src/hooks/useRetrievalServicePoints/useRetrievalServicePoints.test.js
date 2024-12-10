import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import useRetrievalServicePoints from './useRetrievalServicePoints';
import { LOCATIONS_API, SERVICE_POINTS_API } from '../../constants';

const mockTenantId = 'tenantId';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: jest.fn(() => ['test']),
  useOkapiKy: jest.fn(),
  useStripes: jest.fn(() => ({
    okapi: {
      tenant: mockTenantId,
    },
  })),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const retrievalSPsOptions = [
  {
    value: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
    label: 'Circ desk 1',
  },
  {
    value: '9d1b77e8-f02e-4b7f-b296-3f2042ddac54',
    label: 'Circ desk 2',
  },
];

const kyResponseMap = {
  [LOCATIONS_API]: { locations: [
    { id: '1', primaryServicePoint: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f' },
    { id: '2', primaryServicePoint: '9d1b77e8-f02e-4b7f-b296-3f2042ddac54' },
  ] },
  [SERVICE_POINTS_API]: { servicepoints: [
    { id: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f', name: 'Circ desk 1' },
    { id: '9d1b77e8-f02e-4b7f-b296-3f2042ddac54', name: 'Circ desk 2' },
    { id: '1', name: 'Circ desk 3' },
    { id: '2', name: 'Circ desk 4' },
  ] },
};

describe('useRetrievalServicePoints', () => {
  const setHeaderMock = jest.fn();
  const kyMock = jest.fn(() => ({
    extend: jest.fn(({ hooks: { beforeRequest } }) => {
      beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

      return {
        get: (path) => ({
          json: () => Promise.resolve(kyResponseMap[path]),
        }),
      };
    }),
  }));

  beforeEach(() => {
    kyMock.mockClear();
    useOkapiKy.mockImplementation(kyMock);
  });

  it('should fetch retrieval service points', async () => {
    const { result } = renderHook(() => useRetrievalServicePoints(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.retrievalSPsOptions).toEqual(retrievalSPsOptions);
  });
});
