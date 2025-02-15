const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3000;

const serverURL = "http://9.20.194.48:3000/"
const ltpaToken = "LtpaToken2=EOtiPsKmrWQov1Qcx8l9n2igXqcbxHHyjS89nGpV4Rl2XyNWieyeQ8jJw+vZY8QynnBl18pBuS6kIrMiVXEi8jIqfCSBbMFoGmHpYHg1mMKZ4tNIi8hL5VaPk2sPMD0yKCeuLSZ1KVNl99rp1+EMfvNVG8QDrtz5e/iHqxO9mjsVLcIZi1ye82gONC4D5S9lq7zvtX7gXGYghPvyhIe4lvwAmkWc1Pw7iXpwuvM6cVw4INo4OiEdj+kW3nD1hKyBk1q90Ac/tCidit2rIRmONyNYYFXE8weW/3X+W8uYML2pTg7jOZE2igK4GeMNvbmH"

describe('Test the qmacp server is running',  () => {
  it('should respond with status 200', async () => {

    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL,
      headers: {
        'Cookie': ltpaToken
        },
      }

    let response;

    try{
       // execute the request to the server
       response = await axios.request(config);
    } catch(e) {
       console.log("an error occurred");
       response = e.message;
       console.log(e);
    }
  
     // Check the response and return ECONNREFUSED if the server is not running
     expect(response?.status || response).toBe(200);
  });
});

describe('Test the POST /authenticate endpoint ',  () => {
  it('should respond with status 400, an informative message and no cookies if no credentials are provided', async () => {

    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "authenticate",
      headers: {
        //'Authorization': 'Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHkz', 
        },
      }

    try{
       // execute the request to the server
       const response = await axios.request(config);
       expect(response.status).toBe(400); 
    } catch(e) {
       console.log("An error occurred");
       const response = e?.status || e.message;
       expect(response).toBe(400); 
    }
  });
  
  it('should respond with status 200, an informative message and an LtpaToken2 if valid credentials are used', async () => {

    let config = {
      method: 'post',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "authenticate",
      headers: {
        'Authorization': 'Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHkz', 
        },
      }

    try{
       // execute the request to the server
       const response = await axios.request(config);
       expect(response.status).toBe(200); 
    } catch(error) {
       console.log("An error occurred");
       console.log(error);
       const response = error?.status || error.message;
       expect(response).toBe(200);
    }
  });
});