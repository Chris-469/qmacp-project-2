const { readSysParm } = require('./zosmf-mq-services');
const axios = require('axios');

jest.mock('axios');

describe('readSysParm', () => {
  it('should return the value of the system parameter', async () => {
    const sysParm = 'TESTPARM';
    const qmName = 'QM1';
    const ltpaToken = 'dummy-token';
    const mockResponse = {
      status: 200,
      data: 'TESTPARM=VALUE,'
    };

    axios.request.mockResolvedValue(mockResponse);

    const value = await readSysParm(sysParm, qmName, ltpaToken);
    expect(value).toBe('VALUE');
  });

  it('should return null if the response status is not 200', async () => {
    const sysParm = 'TESTPARM';
    const qmName = 'QM1';
    const ltpaToken = 'dummy-token';
    const mockResponse = {
      status: 500,
      statusText: 'Internal Server Error'
    };

    axios.request.mockResolvedValue(mockResponse);

    const value = await readSysParm(sysParm, qmName, ltpaToken);
    expect(value).toBeNull();
  });
});