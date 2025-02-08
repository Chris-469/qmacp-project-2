const fs = require('fs');
const path = require('path');
const { readSysParm, extractParm } = require('./zosmf-mq-services');
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

describe('extractParm', () => {
  let jclContent;

  beforeAll(() => {
    // Read the contents of the example-csq4zprm.jcl file
    const filePath = path.join(__dirname, 'example-csq4zprm.jcl');
    jclContent = fs.readFileSync(filePath, 'utf8');
  });

  test('should extract the value of ACELIM', async () => {
    const value = await extractParm(jclContent, 'ACELIM');
    expect(value).toBe('0');
  });

  test('should extract the value of CLCACHE', async () => {
    const value = await extractParm(jclContent, 'CLCACHE');
    expect(value).toBe('STATIC');
  });

  test('should return null for a non-existent parameter', async () => {
    const value = await extractParm(jclContent, 'NONEXISTENT');
    expect(value).toBeNull();
  });
});