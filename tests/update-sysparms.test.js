const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3000;

const serverURL = "http://9.20.194.48:3000"
let ltpaToken2 = 'LtpaToken2=4ZRcqWkDgfebL12tVa/QcNn7ECCwcTurMHXTPKO6Ca0E0/Ai357okQ9sX9QERykHgUq2dgD/MKAnm4yynk7vKmqg7L6JnLO8ZYRpgr19sIikV3rHYkSeHzELsNipyGwS02rGEyuAgK3BrzrbvO2j1iYvA35YLVxheAoTiwDdqPxfZSaBfk8yojL46Y8WHyf4dyqC943oo9g+zGjE6BoVuVlz6cR/uT5bLPOq2efiyT0e/iKg4bEHXxE+7qokQYUzx7mfFUSQ+dzvQTnHasSCuKVhHHPtXb/C378+ivZweROS/9rBMvevgWajmHRwUWXt; Path=/; Secure; HttpOnly'

const validCredentials = "Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHk0";
const invalidCredentials = "Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHk0";

let validCredentialsConfig = {
  method: 'put',
  timeout: 10000,
  maxBodyLength: Infinity,
  url: serverURL,
  headers: {
    'Authorization': validCredentials,
    },
 }

/**
 * This file will test the PUT /-qm-systems endpoint which should update system parameters on a given queue manager
*/

describe('UR(6) - Users should be able to update system parameters using the API',  () => {

  it('UR(6.1) - should respond with status 401 if invalid credentials are used to authenticate', async () => {
  
      let config = {
        method: 'put',
        timeout: 10000,
        maxBodyLength: Infinity,
        url: serverURL + "qm-sysparms",
        headers: {
          'Authorization': invalidCredentials, // Invalid credentials
          },
        }
  
      let response;
  
      // execute the request to the server
      try{
         response = await axios.request(config); // throws an assertion error for non-200 responses
      } catch(error) {
        const response = error?.response.status || error.message;
        expect(response).toBe(401);
      }
    });
  
  it('UR(6.1) - should respond with an informative message if invalid credentials are used to authenticate', async () => {
  
      let validCredentialsConfig = {
        method: 'put',
        timeout: 10000,
        maxBodyLength: Infinity,
        url: serverURL + "qm-sysparms",
        headers: {
          'Authorization': invalidCredentials, // Invalid credentials
          },
        }
  
      let response;
  
      // execute the request to the server
      try{
         response = await axios.request(validCredentialsConfig); // throws an assertion error for non-200 responses
      } catch(error) {
        const response = error?.response.data.statusText || error.message;
        expect(response).toBe("Unauthorized");
      }
    });

  it('UR(6.2) - should update INBUFF parameter to a random int between 28-60', async () => {
    let response;

    // sets inbuff to a random value between 28-60
    let inbuffValue = Math.floor(Math.random() * (60 - 28 + 1)) + 28;

    let tokenConfig = {
      method: 'put',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm-sysparms",
      headers: {
        'Cookie' : ltpaToken2
        },
      data: {
        "qmName" : "MQ1A",
        "INBUFF" : inbuffValue.toString()
        }
      }

    // update INBUFF
    try {
      // send the request to update the parameter
      response = await axios.request(config);
      
      // build the body for the request
      const reqBody = {
        "qmName": "MQ1A",
        "sysParms" : "INBUFF"
      }
      
      // change fields to make request read parameters
      tokenConfig.method = 'get';
      tokenConfig.data = {
        "qmName" : "MQ1A",
        "sysParms" : "INBUFF"
      }

      // send the request to read the parameter
      response = await axios.request(config);
      
      //check it against what we expect
      expect(reqBody.body.data.INBUFF).toBe(inbuffValue);
      
    } catch(error) {
      throw new Error(`Unexpected error: ${error?.response.data.statusText || error.message}`);
    }
  });
});