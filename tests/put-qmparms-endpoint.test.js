const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { editJclLine, editJCL } = require('../zosmf-mq-services');
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
 * Endpoint testing section
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
        "sysParms" : {
          "INBUFF" : inbuffValue
        } 
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

/**
 * Function testing section
 */
describe('The editJclLine function should edit the value of any given parameter', () => {
  let jclContent;

  beforeAll(() => {
    // Read the contents of the example-csq4zprm.jcl file
    const filePath = path.join(__dirname, '..', 'example-csq4zprm.jcl');
    jclContent = fs.readFileSync(filePath, 'utf8');
  });

  // Testing CSQ6LOGP parameters
  test('should modify the value of INBUFF to 35', async () => {
    let testValue = '35';
    const line = extractLine(jclContent, 'INBUFF');
    const editedLine = await editJclLine(line, 'INBUFF', testValue);
    const value = extractValue(editedLine, 'INBUFF');
    expect(value).toBe(testValue);
  });

  test('should modify the value of OUTBUFF to 8000', async () => {
    let testValue = '8000';
    const line = extractLine(jclContent, 'OUTBUFF');
    const editedLine = await editJclLine(line, 'OUTBUFF', testValue);
    const value = extractValue(editedLine, 'OUTBUFF');
    expect(value).toBe(testValue);
  });

  test('should modify the value of MAXRTU to 4', async () => {
    let testValue = '4';
    const line = extractLine(jclContent, 'MAXRTU');
    const editedLine = await editJclLine(line, 'MAXRTU', testValue);
    const value = extractValue(editedLine, 'MAXRTU');
    expect(value).toBe(testValue);
  });

  test('should modify the value of DEALLCT to 10', async () => {
    let testValue = '10';
    const line = extractLine(jclContent, 'DEALLCT');
    const editedLine = await editJclLine(line, 'DEALLCT', testValue);
    const value = extractValue(editedLine, 'DEALLCT');
    expect(value).toBe(testValue);
  });

  test('should modify the value of OFFLOAD to NO', async () => {
    let testValue = 'NO';
    const line = extractLine(jclContent, 'OFFLOAD');
    const editedLine = await editJclLine(line, 'OFFLOAD', testValue);
    const value = extractValue(editedLine, 'OFFLOAD');
    expect(value).toBe(testValue);
  });

  test('should modify the value of MAXARCH to 1000', async () => {
    let testValue = '1000';
    const line = extractLine(jclContent, 'MAXARCH');
    const editedLine = await editJclLine(line, 'MAXARCH', testValue);
    const value = extractValue(editedLine, 'MAXARCH');
    expect(value).toBe(testValue);
  });

  test('should modify the value of TWOACTV to NO', async () => {
    let testValue = 'NO';
    const line = extractLine(jclContent, 'TWOACTV');
    const editedLine = await editJclLine(line, 'TWOACTV', testValue);
    const value = extractValue(editedLine, 'TWOACTV');
    expect(value).toBe(testValue);
  });

  test('should modify the value of TWOARCH to NO', async () => {
    let testValue = 'NO';
    const line = extractLine(jclContent, 'TWOARCH');
    const editedLine = await editJclLine(line, 'TWOARCH', testValue);
    const value = extractValue(editedLine, 'TWOARCH');
    expect(value).toBe(testValue);
  });

  test('should modify the value of TWOBSDS to NO', async () => {
    let testValue = 'NO';
    const line = extractLine(jclContent, 'TWOBSDS');
    const editedLine = await editJclLine(line, 'TWOBSDS', testValue);
    const value = extractValue(editedLine, 'TWOBSDS');
    expect(value).toBe(testValue);
  });

  test('should modify the value of COMPLOG to GZIP', async () => {
    let testValue = 'GZIP';
    const line = extractLine(jclContent, 'COMPLOG');
    const editedLine = await editJclLine(line, 'COMPLOG', testValue);
    const value = extractValue(editedLine, 'COMPLOG');
    expect(value).toBe(testValue);
  });

  test('should modify the value of WRTHRSH to 50', async () => {
    let testValue = '50';
    const line = extractLine(jclContent, 'WRTHRSH');
    const editedLine = await editJclLine(line, 'WRTHRSH', testValue);
    const value = extractValue(editedLine, 'WRTHRSH');
    expect(value).toBe(testValue);
  });

  test('should modify the value of ZHYWRITE to YES', async () => {
    let testValue = 'YES';
    const line = extractLine(jclContent, 'ZHYWRITE');
    const editedLine = await editJclLine(line, 'ZHYWRITE', testValue);
    const value = extractValue(editedLine, 'ZHYWRITE');
    expect(value).toBe(testValue);
  });

  // Test CSQ6SYSP Values
  test('should modify the value of ACELIM to 1024', async () => {
    let testValue = '1024';
    const line = extractLine(jclContent, 'ACELIM');
    const editedLine = await editJclLine(line, 'ACELIM', testValue);
    const value = extractValue(editedLine, 'ACELIM');
    expect(value).toBe(testValue);
  });

  test('should modify the value of CLCACHE to DYNAMIC', async () => {
    let testValue = 'DYNAMIC';
    const line = extractLine(jclContent, 'CLCACHE');
    const editedLine = await editJclLine(line, 'CLCACHE', testValue);
    const value = extractValue(editedLine, 'CLCACHE');
    expect(value).toBe(testValue);
  });

  test('should modify the value of CMDUSER to ADMIN', async () => {
    let testValue = 'ADMIN';
    const line = extractLine(jclContent, 'CMDUSER');
    const editedLine = await editJclLine(line, 'CMDUSER', testValue);
    const value = extractValue(editedLine, 'CMDUSER');
    expect(value).toBe(testValue);
  });

  test('should modify the value of EXCLMSG to (MSG1,MSG2)', async () => {
    let testValue = '(MSG1,MSG2)';
    const line = extractLine(jclContent, 'EXCLMSG');
    const editedLine = await editJclLine(line, 'EXCLMSG', testValue);
    const value = extractValue(editedLine, 'EXCLMSG');
    expect(value).toBe(testValue);
  });

  test('should modify the value of EXITLIM to 60', async () => {
    let testValue = '60';
    const line = extractLine(jclContent, 'EXITLIM');
    const editedLine = await editJclLine(line, 'EXITLIM', testValue);
    const value = extractValue(editedLine, 'EXITLIM');
    expect(value).toBe(testValue);
  });

  test('should modify the value of EXITTCB to 16', async () => {
    let testValue = '16';
    const line = extractLine(jclContent, 'EXITTCB');
    const editedLine = await editJclLine(line, 'EXITTCB', testValue);
    const value = extractValue(editedLine, 'EXITTCB');
    expect(value).toBe(testValue);
  });

  test('should modify the value of LOGLOAD to 1000000', async () => {
    let testValue = '1000000';
    const line = extractLine(jclContent, 'LOGLOAD');
    const editedLine = await editJclLine(line, 'LOGLOAD', testValue);
    const value = extractValue(editedLine, 'LOGLOAD');
    expect(value).toBe(testValue);
  });

  test('should modify the value of OTMACON to (MQSERIES,,DFSYDRU1,1000000,CSQ)', async () => {
    let testValue = '(MQSERIES,,DFSYDRU1,1000000,CSQ)';
    const line = extractLine(jclContent, 'OTMACON');
    const editedLine = await editJclLine(line, 'OTMACON', testValue);
    const value = extractValue(editedLine, 'OTMACON');

    expect(value).toBe(testValue);
  });

  test('should modify the value of QINDXBLD to NO', async () => {
    let testValue = 'NO';
    const line = extractLine(jclContent, 'QINDXBLD');
    const editedLine = await editJclLine(line, 'QINDXBLD', testValue);
    const value = extractValue(editedLine, 'QINDXBLD');
    expect(value).toBe(testValue);
  });

  test('should modify the value of QMCCSID to 1208', async () => {
    let testValue = '1208';
    const line = extractLine(jclContent, 'QMCCSID');
    const editedLine = await editJclLine(line, 'QMCCSID', testValue);
    const value = extractValue(editedLine, 'QMCCSID');
    expect(value).toBe(testValue);
  });

  test('should modify the value of QSGDATA to (SQL4,DSNV13P1,DKP2,8,8)', async () => {
    let testValue = '(SQL4,DSNV13P1,DKP2,8,8)';
    const line = extractLine(jclContent, 'QSGDATA');
    const editedLine = await editJclLine(line, 'QSGDATA', testValue);
    const value = extractValue(editedLine, 'QSGDATA');
    expect(value).toBe(testValue);
  });

  test('should modify the value of RESAUDIT to NO', async () => {
    let testValue = 'NO';
    const line = extractLine(jclContent, 'RESAUDIT');
    const editedLine = await editJclLine(line, 'RESAUDIT', testValue);
    const value = extractValue(editedLine, 'RESAUDIT');
    expect(value).toBe(testValue);
  });

  test('should modify the value of ROUTCDE to 2', async () => {
    let testValue = '2';
    const line = extractLine(jclContent, 'ROUTCDE');
    const editedLine = await editJclLine(line, 'ROUTCDE', testValue);
    const value = extractValue(editedLine, 'ROUTCDE');
    expect(value).toBe(testValue);
  });

  test('should modify the value of SMFACCT to YES', async () => {
    let testValue = 'YES';
    const line = extractLine(jclContent, 'SMFACCT');
    const editedLine = await editJclLine(line, 'SMFACCT', testValue);
    const value = extractValue(editedLine, 'SMFACCT');
    expect(value).toBe(testValue);
  });

  test('should modify the value of SMFSTAT to YES', async () => {
    let testValue = 'YES';
    const line = extractLine(jclContent, 'SMFSTAT');
    const editedLine = await editJclLine(line, 'SMFSTAT', testValue);
    const value = extractValue(editedLine, 'SMFSTAT');
    expect(value).toBe(testValue);
  });

  test('should modify the value of SPLCAP to YES', async () => {
    let testValue = 'YES';
    const line = extractLine(jclContent, 'SPLCAP');
    const editedLine = await editJclLine(line, 'SPLCAP', testValue);
    const value = extractValue(editedLine, 'SPLCAP');
    expect(value).toBe(testValue);
  });

  test('should modify the value of STATIME to 60', async () => {
    let testValue = '60';
    const line = extractLine(jclContent, 'STATIME');
    const editedLine = await editJclLine(line, 'STATIME', testValue);
    const value = extractValue(editedLine, 'STATIME');
    expect(value).toBe(testValue);
  });

  test('should modify the value of TRACSTR to NO', async () => {
    let testValue = 'NO';
    const line = extractLine(jclContent, 'TRACSTR');
    const editedLine = await editJclLine(line, 'TRACSTR', testValue);
    const value = extractValue(editedLine, 'TRACSTR');
    expect(value).toBe(testValue);
  });

  test('should modify the value of TRACTBL to 128', async () => {
    let testValue = '128';
    const line = extractLine(jclContent, 'TRACTBL');
    const editedLine = await editJclLine(line, 'TRACTBL', testValue);
    const value = extractValue(editedLine, 'TRACTBL');
    expect(value).toBe(testValue);
  });

  test('should modify the value of WLMTIME to 60', async () => {
    let testValue = '60';
    const line = extractLine(jclContent, 'WLMTIME');
    const editedLine = await editJclLine(line, 'WLMTIME', testValue);
    const value = extractValue(editedLine, 'WLMTIME');
    expect(value).toBe(testValue);
  });

  test('should modify the value of WLMTIMU to SECS', async () => {
    let testValue = 'SECS';
    const line = extractLine(jclContent, 'WLMTIMU');
    const editedLine = await editJclLine(line, 'WLMTIMU', testValue);
    const value = extractValue(editedLine, 'WLMTIMU');
    expect(value).toBe(testValue);
  });

  test('should modify the value of SERVICE to 1', async () => {
    let testValue = '1';
    const line = extractLine(jclContent, 'SERVICE');
    const editedLine = await editJclLine(line, 'SERVICE', testValue);
    const value = extractValue(editedLine, 'SERVICE');
    expect(value).toBe(testValue);
  });
});

describe('The editJcl parameter should return a correctly edited CSQ4ZPRM', () => {
  let jclContent;

  beforeAll(() => {
    // Read the contents of the example-csq4zprm.jcl file
    const filePath = path.join(__dirname, '..', 'example-csq4zprm.jcl');
    jclContent = fs.readFileSync(filePath, 'utf8');
  });

   // Tests that INBUFF is modified to 35 through the editJCL function
   test('should modify the value of INBUFF to 35', async () => {
    let testParm = 'INBUFF';
    let testValue = '35';

    let testSysParms = {
      [testParm] : testValue,
    };

    const updatedJCL = await editJCL(jclContent, testSysParms);
    const line = extractLine(updatedJCL, testParm);
    const value = extractValue(line, testParm);

    expect(value).toBe(testValue);
  });

  test('should modify the value of ARCWRTC to (2,4,6)', async () => {
    let testParm = 'ARCWRTC';
    let testValue = '(2,4,6)';

    let testSysParms = {
      [testParm]: testValue,
    };

    const updatedJCL = await editJCL(jclContent, testSysParms);
    const line = extractLine(updatedJCL, testParm);
    const value = extractValue(line, testParm);

    expect(value).toBe(testValue);
  });

  test('should modify the value of PROTECT to YES', async () => {
    let testParm = 'PROTECT';
    let testValue = 'YES';

    let testSysParms = {
      [testParm]: testValue,
    };

    const updatedJCL = await editJCL(jclContent, testSysParms);
    const line = extractLine(updatedJCL, testParm);
    const value = extractValue(line, testParm);

    expect(value).toBe(testValue);
  });

  test('should modify the value of QSGDATA to (SQL4,DSNV13P1,DKP2,8,8)', async () => {
    let testParm = 'QSGDATA';
    let testValue = '(SQL4,DSNV13P1,DKP2,8,8)';

    let testSysParms = {
      [testParm]: testValue,
    };

    const updatedJCL = await editJCL(jclContent, testSysParms);
    const line = extractLine(updatedJCL, testParm);
    const value = extractValue(line, testParm);

    expect(value).toBe(testValue);
  });

  test('should modify the value of STATIME to 60', async () => {
    let testParm = 'STATIME';
    let testValue = '60';

    let testSysParms = {
      [testParm]: testValue,
    };

    const updatedJCL = await editJCL(jclContent, testSysParms);
    const line = extractLine(updatedJCL, testParm);
    const value = extractValue(line, testParm);

    expect(value).toBe(testValue);
  });

  test('should always result in a line less than 72 characters long', async () => {
    let testParm = 'STATIME';
    let testValue = '60000000';

    let testSysParms = {
      [testParm]: testValue,
    };

    const updatedJCL = await editJCL(jclContent, testSysParms);
    const line = extractLine(updatedJCL, testParm);

    expect(line.length).toBeLessThan(73);
  });

});

// Returns the line containing the parameter name from the JCL
function extractLine(jcl, paramName) {

  // Split the jcl into lines
  let lines = jcl.split('\n');

  // Iterate over each line
  for (let line of lines) {

  // Check if the line contains the parameter
  if (line.includes(paramName)) {

    // Extract the start position of parameter
    const paramPosition = line.indexOf(paramName);

    // Check that this line is not a comment, jcl statement or inside another parameter word
    if(line.substring(0,2) == "//" ||
      line.substring(paramPosition + paramName.length, paramPosition + paramName.length + 1) != "=" ||
      line.substring(paramPosition - 1, paramPosition) != " ") {
      continue;
    }

    // Update the line with the new parameter value
    return line;
    }
  }
}

// Extracts the value of a parameter from a line
function extractValue(line, paramName) {
  // Find the position of the parameter name
  const paramPosition = line.indexOf(paramName);

  // Find the position of the value using the first space
  let endPos = line.indexOf(" ", paramPosition + paramName.length);

  // Account for commas at the end of lines
  if (line.substring(endPos - 1, endPos) == ",") {
    endPos -= 1;
  }

  // Extract the actual value from the line
  const value = line.substring(paramPosition + paramName.length + 1, endPos);   

  // Return the value
  return value;
}