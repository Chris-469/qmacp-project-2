const path = require('path');
const axios = require('axios');
const http = require('http');
const express = require('express');
const app = express();
const PORT = 3000;

const localURL = `http://localhost:${PORT}/`;

// Import your server code here
require('./server');

let server;

// Start the server before any tests
beforeAll((done) => {
  server = app.listen(PORT, done);
});

describe('POST /authenticate', () => {
  it('UR2.1 - should respond with status 401 if invalid credentials are used', async () => {
    
    // Build a request with invalid credentials
    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: localURL + "authenticate",
      headers: {
        'Authorization' : 'REFWSUQxOk1ZUEFTUzIz'
      }
    };

    // Execute the request
    const response = await axios.request(config);

    // Check the response
    expect(response.status).toBe(401);
  });
});

// Stop the server after all tests have finished
afterAll((done) => {
  server.close(done);
});