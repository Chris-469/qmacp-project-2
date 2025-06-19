const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3005;

const serverURL = "http://9.20.194.48:3005/"
let ltpaToken2;

/**
 * This test file is for server endpoint testing using real server responses
 */

describe('UR(1) - The API must allow users to authenticate using their z/OSMF credentials',  () => {

  it('UR(1.1) - should respond with status 200 if valid credentials are used', async () => {

    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "authenticate",
      headers: {
        'Authorization': 'Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHk0', // Valid Credentials
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
        'Authorization': 'Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHk0', // Valid Credentials
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
        'Authorization': 'Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHk0', // Valid Credentials
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
       response = await axios.request(config); // throws an assertion error for non-200 responses
    } catch(error) {
      const response = error?.response.status || error.message;
      expect(response).toBe(401);
    }
  });

  it('UR(2.1) - should respond with an informative message if invalid credentials are used to authenticate', async () => {

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
       response = await axios.request(config); // throws an assertion error for non-200 responses
    } catch(error) {
      const response = error?.response.data.statusText || error.message;
      expect(response).toBe("Unauthorized");
    }
  });

  it('UR(2.1) - should not respond with an LtpaToken2 cookie if invalid credentials are used to authenticate', async () => {

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
       response = await axios.request(config); // throws an assertion error for non-200 responses
    } catch(error) {
      const response = error?.response.headers || error.message;
      expect(response["set-cookie"]).not.toBeDefined();
    }
  });

  it('UR(2.2) - should respond with status 400 if no cookie & no credentials are provided', async () => {

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
    } catch(error) {
       const response = error?.response.status || error.message;
       expect(response).toBe(400);
    }
  });

  it('UR(2.4) - should respond with an informative message if no cookie & no credentials are provided', async () => {

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
    } catch(error) {
       const response = error?.response.data.statusText || error.message;
       expect(response).toBe("Authorization header missing");
    }
  });

  it('UR(2.4) - should respond without a cookie, if no cookie & no credentials are provided', async () => {

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
    } catch(error) {
       const response = error?.response.headers || error.message;
       expect(response["set-cookie"]).not.toBeDefined();
    }
  });
});

