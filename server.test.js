const path = require('path');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3000;

jest.mock("axios"); // Mock axios
const serverURL = "http://QmAutoConfigProject1.fyre.ibm.com:3000/"
const ltpaToken = "LtpaToken2=LcBUxQyEaxEuSSP/vN+gKVIQPwp00XjKFkc+8lYtxRuJk/pjhnXpIkOQCjkb3pfZbOalv7qWfk95R/VjHEX9QE1+pHZzE6ZucvkfI56XdwHy21REzDyll6DRQx916GRxNkW12L2ohyJ2c/xxG7MRzYUpPyc1AfV0RYHGl6x0hVak27UsA8Xs8YnX5ENvGMHA6hQJbA78jE+6dmmIz7z0Xheml7rnOcYfp87/qPh1NKrIdJVrtRplHvCElWvU2uBs58YLZmmCuBOqtHxOYWIaGEae/QX8eBrtSHtPE2q53sV4fc4h9N7oBHYU8czei0X9; Path=/; Secure; HttpOnly;"

// Since I'm mocking the axios request responses, the config can be anything
let config = {
  method: 'get',
  timeout: 10000,
  maxBodyLength: Infinity,
  url: serverURL + 'qm-sysparms',
  headers: {
    'Cookie': ltpaToken
    }
  }

// describe('POST /authenticate', () => {
//   it('UR1.1 - should respond with status 200, an informative status message and an LtpaToken2 cookie if valid credentials are used', async () => {

//     // Set the mocked response
//     const mockResponseFilePath = path.join(__dirname, 'zosmf-mock-responses/authenticate-valid-credentials.json');
//     const mockResponseData = JSON.parse(fs.readFileSync(mockResponseFilePath, 'utf8'));

//     // Mock the axios request to return the contents of the JSON file
//     axios.request.mockResolvedValue(mockResponseData);

//     // Execute the request
//     const response = await axios.request(config);

//     // Check the response
//     expect(response.status).toBe(200);
//     expect(response.statusText).toBe("OK");
//     expect(response.headers["set-cookie"]).toBeDefined();
//   });
  
//   it('UR2.1 - should respond with status 401, an informative status message and no cookie if invalid credentials are used', async () => {

//     // Set the mocked response
//     const mockResponseFilePath = path.join(__dirname, 'zosmf-mock-responses/authenticate-invalid-credentials.json');
//     const mockResponseData = JSON.parse(fs.readFileSync(mockResponseFilePath, 'utf8'));

//     // Mock the axios request to return the contents of the JSON file
//     axios.request.mockResolvedValue(mockResponseData);

//     // Execute the request
//     const response = await axios.request(config);

//     // Check the response
//     expect(response.status).toBe(401);
//     expect(response.statusText).toBe("Unauthorized");
//     expect(response.headers["set-cookie"]).not.toBeDefined();
//   });

//   it('UR2.3 - should respond with status 500 and an informative message when the z/OSMF server is not active', async () => {

//     // Mock the axios request to simulate a timeout error
//     axios.request.mockRejectedValue({
//       code: 'ECONNABORTED',
//       message: 'timeout of 10000ms exceeded'
//     });

//     // Execute the request
//     const response = await axios.request(config);

//     // Check the response
//     expect(response.status).toBe(500);
//     expect(response.statusText).toBeDefined();
//   });
// });

describe('GET dataset API server',  () => {
  it('UR1.1 - should respond with status 200', async () => {

   // Execute the request
   const response = await axios.request(config);

    // Check the response
    expect(response.status).toBe(200);
  });
});