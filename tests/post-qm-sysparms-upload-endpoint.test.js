const path = require('path');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const express = require('express');

// const serverURL = "http://9.20.194.48:3000/"
const serverURL = "http://localhost:3000/"
const testQueueManager = "MQ1A";

const validCredentials = "Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHk0";
let ltpaToken2 = false;

/**
 * Endpoint testing for POST /qm/sysparms/upload
*/
describe('UR(8) - Users must be able to use a previously saved file to restore system parameters to a QM.',  () => {

  // Perform authentication before running the tests
  beforeAll(async () => {
    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "authenticate",
      headers: {
        'Authorization': validCredentials, // Valid Credentials
        },
      }

    try{
       // execute the request to the server
       const response = await axios.request(config);

       // set the ltpatoken2 test variable for subsequent tests
       ltpaToken2 = response.headers['set-cookie'];

       expect(response.status).toBe(200);
    } catch(error) {
       console.log("An error occurred in testing: " + error?.status || error.message);
       const response = error?.status || error.message;

       expect(response).toBe(200);
    }
  });
  
  it('POST request to the /qm/sysparm/upload with valid credentials + qmName + file returns response code 200', async () => {

    // Create the body of the request with the file
    let data = new FormData();  
    const filePath = '/Users/chriscocklin/Downloads/sysparms-MQ1A-1746717836886.json';
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    data.append('sysParms', fs.createReadStream(filePath));

    // Build the body of the request including the file
    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms/upload?qmName=" + testQueueManager,
      headers: {
        'Cookie' : ltpaToken2,
        ...data.getHeaders()
        },
      data: data
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);

      // check response status
      expect(response.status).toBe(200);
      }
      catch (error) {
        expect(error.status).toBe(200);
      }
  });
});