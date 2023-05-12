import { requestFilterTypes } from '../../constants';
import filtersConfig from './RequestsFiltersConfig';

describe('RequestsFiltersConfig', () => {
  it('should have a filter for requestType', () => {
    const requestTypeFilter = filtersConfig.find(f => f.name === 'requestType');
    expect(requestTypeFilter).toBeTruthy();
    expect(requestTypeFilter.cql).toEqual('requestType');
    expect(requestTypeFilter.values).toEqual([]);
    expect(requestTypeFilter.operator).toEqual('==');
  });

  it('should have a filter for requestStatus', () => {
    const requestStatusFilter = filtersConfig.find(f => f.name === 'requestStatus');
    expect(requestStatusFilter).toBeTruthy();
    expect(requestStatusFilter.cql).toEqual('status');
    expect(requestStatusFilter.values).toEqual([]);
    expect(requestStatusFilter.operator).toEqual('==');
    expect(requestStatusFilter.label).toEqual('ui-requests.requestMeta.status');
  });

  it('should have a filter for request levels', () => {
    const requestLevelsFilter = filtersConfig.find(f => f.name === requestFilterTypes.REQUEST_LEVELS);
    expect(requestLevelsFilter).toBeTruthy();
    expect(requestLevelsFilter.cql).toEqual('requestLevel');
    expect(requestLevelsFilter.values).toEqual([]);
    expect(requestLevelsFilter.operator).toEqual('==');
  });

  it('should have a filter for tags', () => {
    const tagsFilter = filtersConfig.find(f => f.name === 'tags');
    expect(tagsFilter).toBeTruthy();
    expect(tagsFilter.cql).toEqual('tags.tagList');
    expect(tagsFilter.values).toEqual([]);
    expect(tagsFilter.operator).toEqual('==');
    expect(tagsFilter.parse('tag1')).toEqual('tags.tagList==*"*tag1*"*');
    expect(tagsFilter.parse(['tag1', 'tag2'])).toEqual('tags.tagList==(*"*tag1*"* or *"*tag2*"*)');
  });

  it('should have a filter for pickup service point', () => {
    const pickupServicePointFilter = filtersConfig.find(f => f.name === requestFilterTypes.PICKUP_SERVICE_POINT);
    expect(pickupServicePointFilter).toBeTruthy();
    expect(pickupServicePointFilter.cql).toEqual('pickupServicePointId');
    expect(pickupServicePointFilter.values).toEqual([]);
    expect(pickupServicePointFilter.operator).toEqual('==');
  });
});
