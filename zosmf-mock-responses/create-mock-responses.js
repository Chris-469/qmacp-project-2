const axios = require('axios');
const path = require('path');
const fs = require('fs');

const zosmfURL = "https://winmvs3c.hursley.ibm.com:32070/zosmf/"
const fileName = 'zosmf-server-inaccessible.json';

async function utilityFunction() {

  let response;

  try {
    // Create the request config with valid credentials
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: zosmfURL + 'restfiles/ds/VICY.MQNL.V9XX.SCSQPROC(CSQ4ZPRM)',
      headers: {
        //'Authorization' : 'Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHkz'
        'Cookie': 'LtpaToken2=LcBUxQyEaxEuSSP/vN+gKVIQPwp00XjKFkc+8lYtxRuJk/pjhnXpIkOQCjkb3pfZbOalv7qWfk95R/VjHEX9QE1+pHZzE6ZucvkfI56XdwHy21REzDyll6DRQx916GRxNkW12L2ohyJ2c/xxG7MRzYUpPyc1AfV0RYHGl6x0hVak27UsA8Xs8YnX5ENvGMHA6hQJbA78jE+6dmmIz7z0Xheml7rnOcYfp87/qPh1NKrIdJVrtRplHvCElWvU2uBs58YLZmmCuBOqtHxOYWIaGEae/QX8eBrtSHtPE2q53sV4fc4h9N7oBHYU8czei0X9'
      }
    };

    try {
      // Do the request to zosmf
      response = await axios.request(config);
    }
    catch(e) {
      response = e.response;
    }
    
    // Write the response to a file
    const mockResponsesDir = path.join(__dirname, 'zosmf-mock-responses');
    const mockResponseFilePath = path.join(mockResponsesDir, fileName);

    // Build the file contents object using the fields of the response we care about object.
    // Note - including request in the mock response introduces circular error messages

    const fileContents = {
      status: response.status,
      statusText: response.statusText || "",
      headers: response.headers,
      config: response.config,
      data: response?.data || null
    }
    console.log("File contents object created successfully");

    // Check the type of the response object
    if (response && typeof response === 'object') {
      // Write the entire response object to the file using flatted
      fs.writeFileSync(mockResponseFilePath, JSON.stringify(fileContents, null, 2), 'utf8');
      console.log('Mock response has been saved to', mockResponseFilePath);
    } else {
      console.log('Response is not an object:', response);
    }

  } catch (error) {
    console.log("An error occurred");
    console.log(error.message);
  }
}

// Immediately Invoked Function Expression (IIFE) to handle top-level await
(async () => {
  console.log("Utility function started");
  await utilityFunction();
  console.log("Utility function finished");
})();