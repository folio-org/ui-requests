import { requestFilterTypes } from '../../constants';
import filtersConfig from './RequestsFiltersConfig';

describe('RequestsFiltersConfig', () => {
  it('should have a filter for requestType', () => {
    const requestTypeFilter = filtersConfig.find(f => f.name === 'requestType');
    expect(requestTypeFilter.cql).toEqual('requestType');
  });

  it('should have a filter for requestStatus', () => {
    const requestStatusFilter = filtersConfig.find(f => f.name === 'requestStatus');
    expect(requestStatusFilter.cql).toEqual('status');
    expect(requestStatusFilter.label).toEqual('ui-requests.requestMeta.status');
  });

  it('should have a filter for request levels', () => {
    const requestLevelsFilter = filtersConfig.find(f => f.name === requestFilterTypes.REQUEST_LEVELS);
    expect(requestLevelsFilter.cql).toEqual('requestLevel');
  });

  it('should return the expected query string for a single tag', () => {
    const tagsFilter = filtersConfig.find(f => f.name === 'tags');
    expect(tagsFilter.cql).toEqual('tags.tagList');
    expect(tagsFilter.parse('tag1')).toEqual('tags.tagList==*"*tag1*"*');
  });
  it('should return the expected query string for an array of tags', () => {
    const tagsFilter = filtersConfig.find(f => f.name === 'tags');
    expect(tagsFilter.parse(['tag1', 'tag2'])).toEqual('tags.tagList==(*"*tag1*"* or *"*tag2*"*)');
  });
  it('should have a filter for pickup service point', () => {
    const pickupServicePointFilter = filtersConfig.find(f => f.name === requestFilterTypes.PICKUP_SERVICE_POINT);
    expect(pickupServicePointFilter.cql).toEqual('pickupServicePointId');
  });
});
