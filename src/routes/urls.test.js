import urls from './urls';

describe('urls', () => {
  const id = '11111111-1111-1111-1111-111111111111';
  const requestId = '22222222-2222-2222-2222-222222222222';

  it('should requests url', () => {
    expect(urls.requests()).toBe('/requests');
  });

  it('should request view url', () => {
    expect(urls.requestView(id)).toBe(`/requests/view/${id}`);
  });

  it('should request queue view url', () => {
    expect(urls.requestQueueView(requestId, id)).toBe(`/requests/view/${requestId}/${id}/reorder`);
  });
});
