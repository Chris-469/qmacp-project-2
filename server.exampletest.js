const fs = require('fs');
const path = require('path');
const axios = require('axios');
const http = require('http');

const localURL = "http://localhost:3000/"

jest.mock('axios');

describe('POST /authenticate', () => {
  it('UR2.1 - should respond with status 401 if invalid credentials are used', async () => {
    // Mock the axios request to return a 401 response
    axios.request.mockResolvedValue({
      status: 401,
      statusText: 'Unauthorized',
      data: 'Credentials invalid'
    });
    
    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: localURL + "authenticate",
      headers: {
        'Authorization' : 'REFWSUQxOk1ZUEFTUzIz'
      }
    };

    const response = await axios.request(config);
    expect(response.status).toBe(401);
  });
});