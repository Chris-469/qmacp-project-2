const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3000;

const serverURL = "http://9.20.194.48:3000/"
let ltpaToken2;

describe('Test the qmacp server is running', () => {
  it('should respond with status 200', async () => {

    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL,
      headers: {},
      }

    let response;

    try{
       // execute the request to the server
       response = await axios.request(config);

    } catch(error) {
       console.log("An error occurred in testing: " + error?.status || error.message);
       response = error.message;
    }
  
     // Check the response and return ECONNREFUSED if the server is not running
     expect(response?.status || response).toBe(200);
  });
});

describe('UR(1) - The API must allow users to authenticate using their z/OSMF credentials',  () => {
    
  it('UR(1.1) - should respond with status 200 if valid credentials are used', async () => {

    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "authenticate",
      headers: {
        'Authorization': 'Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHkz', // Valid Credentials
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

  it('UR(1.1) - should respond with an informative message if valid credentials are used', async () => {

    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "authenticate",
      headers: {
        'Authorization': 'Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHkz', // Valid Credentials
        },
      }

    try{
       // execute the request to the server
       const response = await axios.request(config);

       expect(response.statusText).toBe("OK");
    } catch(error) {
       console.log("An error occurred in testing: " + error?.status || error.message);
       const response = error?.status || error.message;

       expect(response).toBe(200);
    }
  });

  it('UR(1.1) - should respond with an LtpaToken2 if valid credentials are used', async () => {

    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "authenticate",
      headers: {
        'Authorization': 'Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHkz', // Valid Credentials
        },
      }

    try{
       // execute the request to the server
       const response = await axios.request(config);

       expect(response.headers["set-cookie"]).toBeDefined();
    } catch(error) {
       console.log("An error occurred in testing: " + error?.status || error.message);
       const response = error?.status || error.message;

       expect(response).toBe(200);
    }
  });
});

describe('UR(2) - Users should be notified if an error occurs when authenticating with z/OSMF. ', () => {

  it('UR(2.1) - should respond with status 401 if invalid credentials are used to authenticate', async () => {

    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "authenticate",
      headers: {
        'Authorization': 'Basic SkVGRkVSRTpVcmJhbkMwZDNEM3BsMHkz', // Invalid credentials
        },
      }
    
    let response;
  
    // execute the request to the server
    try{
       response = await axios.request(config);

       expect(response.status).toBe(401);  // throws an assertion error if it fails
    } catch(error) {
      console.log("An error occurred");
      const response = error?.status || error.message;
      expect(response).toBe(401); 
    }
  });

  it('UR(2.2) - should respond with status 400 no credentials are provided', async () => {

    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "authenticate",
      headers: {},
      }
  
    // execute the request to the server
    try{
       const response = await axios.request(config);
       expect(response.status).toBe(400); 
    } catch(error) {
       console.log("An error occurred");
       const response = error?.status || error.message;
       expect(response).toBe(400); 
    }
  });
});

