const path = require('path');
const axios = require('axios');
const fs = require('fs');
const express = require('express');

const serverURL = "http://9.20.194.48:3005/"
const testQueueManager = "MQNL";
let testVersion = "9XX";

const validCredentials = "Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHk0";
let ltpaToken2 = false;

let config = {
  method: 'get',
  timeout: 10000,
  maxBodyLength: Infinity,
  url: serverURL,
  headers: {
    'Authorization': validCredentials,
    },
 }

/**
 * Endpoint testing for GET /qm/sysparms/download
*/
describe('UR(7) - Sending a GET request to /qm/sysparm/download results in response code 200 and JSON contents with the current system parameters.',  () => {

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
  
  it('GET request to the /qm/sysparm/download with valid credentials + qmName returns response code 200', async () => {

    // build the body basic config for the requests
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms/download?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        'Cookie' : ltpaToken2
        },
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

  it('GET request to the /qm/sysparm/download without qmName returns response 400', async () => {

    // build the body basic config for the requests
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms/download?qmVersion=" + testVersion,
      headers: {
        'Cookie' : ltpaToken2
        },
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);

      // check response status
      expect(response.status).toBe(400);
      }
      catch (error) {
        expect(error.status).toBe(400);
      }
  });

  it('GET request to the /qm/sysparm/download without credentials returns response code 400', async () => {

    // build the body basic config for the requests
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms/download?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        },
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);

      // check response status
      expect(response.status).toBe(400);
      }
      catch (error) {
        expect(error.status).toBe(400);
      }
  });

  it('should return a file object from the API', async () => {

    // build the body basic config for the requests
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms/download?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        },
    }

    try {
      const response = await axios.request(config);

      // Check that the response status is 200
      expect(response.status).toBe(200);

      // Check that the Content-Disposition header indicates a file download
      expect(response.headers['content-type']).toBe('application/json');
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });

  // Check that the Content-Disposition header indicates a file download
  it('response should contain an attachment, the file to be downloaded', async () => {

    // build the body basic config for the requests
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms/download?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        },
    }

    try {
      const response = await axios.request(config);

      // Check that the response status is 200
      expect(response.status).toBe(200);

      // Check that the Content-Disposition header indicates a file download
      expect(response.headers['content-disposition']).toContain('attachment');
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });

  // Try saving the file and verify its existence
  it('file returned by the response should be saveable', async () => {

    // build the body basic config for the requests
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms/download?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        },
    }

    try {
      const response = await axios.request(config);

      const filePath = '../tmp/test-sysparm-download.json';
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Check that the file was saved
      expect(fs.existsSync(filePath)).toBe(true);

      // Clean up test file after test
      fs.unlinkSync(filePath);

    } catch (error) {
      expect(error.status).toBe(400);
    }
  });
});