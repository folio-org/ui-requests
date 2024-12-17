import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { LOCATIONS_API, SERVICE_POINTS_API } from '../../constants';

const DEFAULT_DATA = [];
const MAX_RECORDS = 1000;

const useRetrievalServicePoints = (params = {}, options = {}) => {
  const stripes = useStripes();
  const defaultTenantId = stripes.okapi?.tenant;
  const [namespace] = useNamespace('locations');
  const {
    limit = stripes?.config?.maxUnpagedResourceCount || MAX_RECORDS,
    query = 'cql.allRecords=1',
  } = params;
  const {
    enabled = true,
    tenantId,
  } = options;
  const ky = useOkapiKy({ tenant: tenantId });
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId || defaultTenantId)],
    },
  });
  const searchParams = { limit, query };

  const {
    data,
    isFetched,
    isFetching,
    isLoading,
  } = useQuery(
    [namespace],
    async ({ signal }) => {
      const servicePointsData = await api.get(SERVICE_POINTS_API, { searchParams })
        .json()
        .then(({ servicepoints }) => servicepoints);

      const locationsData = await api.get(LOCATIONS_API, { searchParams, signal })
        .json()
        .then(({ locations }) => locations);

      const retrievalSPs = new Set();

      // primary SP of item's effective location is a retrieval service point
      // collect the primary service point of each location of a tenant.
      // prepare the options for retrieval service points filter
      locationsData.forEach(location => {
        if (location.primaryServicePoint) retrievalSPs.add(location.primaryServicePoint);
      });

      const retrievalSPsOptions = servicePointsData
        .filter(sp => retrievalSPs.has(sp.id))
        .map(sp => ({ label: sp.name, value: sp.id }));

      return retrievalSPsOptions;
    },
    enabled,
  );

  const retrievalSPsOptions = data?.length ? data : DEFAULT_DATA;

  return {
    isFetched,
    isFetching,
    isLoading,
    retrievalSPsOptions
  };
};

export default useRetrievalServicePoints;
