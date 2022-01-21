import '../test/jest/__mock__';

import { asyncValidateInstance } from './asyncValidate';
import { getInstanceQueryString } from './utils';

describe('asyncValidateInstance', () => {
  const mockedValues = {
    instance: {
      hrid: 'instanceHrid',
    },
    instanceId: 'instanceId',
  };
  const mockedReset = jest.fn();
  const mockedGET = jest.fn()
    .mockResolvedValueOnce([{ id: mockedValues.instanceId }])
    .mockResolvedValueOnce([]);
  const mockedProps = {
    parentMutator: {
      instanceUniquenessValidator: {
        reset: mockedReset,
        GET: mockedGET,
      },
    },
  };

  beforeEach(() => {
    mockedReset.mockClear();
    mockedGET.mockClear();
  });

  it('should return null if instance is founded', async () => {
    const { instance:{ hrid }, instanceId } = mockedValues;
    const expectedResult = getInstanceQueryString(hrid, instanceId);

    expect(await asyncValidateInstance(mockedValues, mockedProps)).toBe(null);
    expect(mockedReset).toHaveBeenCalled();
    expect(mockedGET).toHaveBeenCalledWith({ params: { query: expectedResult } });
  });

  it('should return an error if instance is not founded', async () => {
    expect(await asyncValidateInstance(mockedValues, mockedProps)).not.toBe(null);
  });
});
