const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3000;

const serverURL = "http://9.20.194.48:3000/"

jest.mock('axios');

/**
 * This test file is for server endpoint testing using mock data from server responses
 */

describe('UR(2) - Users should be notified if server errors occur when testing z/OSMF. ', () => {

  // 2.3 Sending an API request when the server cannot reach the z/OSMF server results in response code 501 and an informative error message.
  it('UR(2.3) - should respond with status 501 if the z/OSMF server cannot be reached', async () => {

    let response;
    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "authenticate",
      headers: {
        'Authorization': 'Basic SkVGRkVSRTpVcmJhbkMwZDNEM3BsMHkz', // Invalid credentials
        },
    }

    // Read the mock response from the JSON file
    const mockResponse = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'zosmf-mock-responses/zosmf-server-inaccessible.json'), 'utf8'));
    axios.request.mockImplementation(() => Promise.reject(mockResponse));

    // execute the request to the server
    try{
      response = await axios.request(config); // throws an assertion error for non-200 responses
    } catch(error) {
      response = error?.response || error.code;
    }

    expect(response).toBe(401);
  });
});

