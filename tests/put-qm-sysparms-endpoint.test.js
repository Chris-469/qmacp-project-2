const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { editJclLine, editJCL } = require('../zosmf-mq-services');
const express = require('express');
const app = express();
const PORT = 3000;

const serverURL = "http://9.20.194.48:3000/"
const testQueueManager = "MQ1A";

const validCredentials = "Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHk0";
const invalidCredentials = "Basic Q0hSSVNDTzpVcmJhbkMwZDNEM3BsMHk0";
let ltpaToken2 = false;

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
 * Endpoint testing for PUT /qm-sysparms
*/
describe('UR(6) - The PUT qm-sysparms endpoint should be able to update sysparms',  () => {

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
  
  it('UR(6.2) - should update INBUFF parameter to 28-60 int', async () => {

    // sets inbuff to a random value between 28-60
    let inbuffValue = getRandomInt(28, 60);

    // build the body basic config for the requests
    let tokenConfig = {
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm-sysparms?qmName=" + testQueueManager,
      headers: {
        'Cookie' : ltpaToken2
        },
    }

    try {
      // change fields to make request put parameters
      let response;
      tokenConfig.method = 'put';
      tokenConfig.data = {
        "sysParms" : {
          "INBUFF" : inbuffValue.toString()
        } 
      }

      // send the request to update the parameter
      response = await axios.request(tokenConfig);
      console.log("PUT response:", response.data);

    } catch(error) {
      console.log("An error occurred while updating the parameter in testing: " + error);
      const response = error?.status || error.message;

      expect(response).toBe(200);
    }

    try {
      // build the config to read the parameters
      let response;
      tokenConfig.method = 'get';
      tokenConfig.data = {
        "sysParms" : "INBUFF"
      }

      // send the request to read the parameter
      response = await axios.request(tokenConfig);
      expect(response.data.data.INBUFF).toBe(inbuffValue.toString());
    }
    catch (error) {
      console.log("An error occurred while reading the parameter in testing: " + error);
      const response = error?.status || error.message;

      expect(response).toBe(200);
    }

  });

  // it('UR(6.2) - should update TWOARCH parameter to YES/NO', async () => {
  // let twoarchValue = getRandomYesOrNo();

  // let tokenConfig = {
  //   timeout: 10000,
  //   maxBodyLength: Infinity,
  //   url: serverURL + "qm-sysparms?qmName=" + testQueueManager,
  //   headers: {
  //     'Cookie': ltpaToken2,
  //   },
  // };

  // try {
  //   tokenConfig.method = 'put';
  //   tokenConfig.data = {
  //     "sysParms": {
  //       "TWOARCH": twoarchValue,
  //     },
  //   };

  //   let response = await axios.request(tokenConfig);
  //   console.log("PUT response:", response.data);

  //   await new Promise(resolve => setTimeout(resolve, 500));
  // } catch (error) {
  //   console.log("An error occurred while updating TWOARCH:", error);
  //   const response = error?.status || error.message;
  //   expect(response).toBe(200);
  // }

  // try {
  //   tokenConfig.method = 'get';
  //   tokenConfig.data = {
  //     "sysParms": "TWOARCH",
  //   };

  //   let response = await axios.request(tokenConfig);
  //   console.log("GET response:", response.data);

  //   expect(response.data.data.TWOARCH).toBe(twoarchValue);
  // } catch (error) {
  //   console.log("An error occurred while reading TWOARCH:", error);
  //   const response = error?.status || error.message;
  //   expect(response).toBe(200);
  // }
  // });

  // it('UR(6.2) - should update ARCWRTC parameter to random (1,3,4)', async () => {
  //   let arcwrtcValue = '(1,' + getRandomInt(1, 4) + ',4)';

  //   let tokenConfig = {
  //     timeout: 10000,
  //     maxBodyLength: Infinity,
  //     url: serverURL + "qm-sysparms?qmName=" + testQueueManager,
  //     headers: {
  //       'Cookie': ltpaToken2,
  //     },
  //   };

  //   try {
  //     tokenConfig.method = 'put';
  //     tokenConfig.data = {
  //       "sysParms": {
  //         "ARCWRTC": arcwrtcValue,
  //       },
  //     };

  //     let response = await axios.request(tokenConfig);
  //     console.log("PUT response:", response.data);

  //     await new Promise(resolve => setTimeout(resolve, 500));
  //   } catch (error) {
  //     console.log("An error occurred while updating ARCWRTC:", error);
  //     const response = error?.status || error.message;
  //     expect(response).toBe(200);
  //   }

  //   try {
  //     tokenConfig.method = 'get';
  //     tokenConfig.data = {
  //       "sysParms": "ARCWRTC",
  //     };

  //     let response = await axios.request(tokenConfig);
  //     console.log("GET response:", response.data);

  //     expect(response.data.data.ARCWRTC).toBe(arcwrtcValue);
  //   } catch (error) {
  //     console.log("An error occurred while reading ARCWRTC:", error);
  //     const response = error?.status || error.message;
  //     expect(response).toBe(200);
  //   }
  // });

  // it('UR(6.2) - should update OTMACON parameter to (MQSERIES,,DFSYDRU0,2147483647,CSQ) with random account number', async () => {
  //   let otmaconValue = '(MQSERIES,,DFSYDRU0,' + getRandomInt(1000000000, 5000000000) + ',CSQ)';

  //   let tokenConfig = {
  //     timeout: 10000,
  //     maxBodyLength: Infinity,
  //     url: serverURL + "qm-sysparms?qmName=" + testQueueManager,
  //     headers: {
  //       'Cookie': ltpaToken2,
  //     },
  //   };

  //   try {
  //     tokenConfig.method = 'put';
  //     tokenConfig.data = {
  //       "sysParms": {
  //         "OTMACON": otmaconValue,
  //       },
  //     };

  //     let response = await axios.request(tokenConfig);
  //     console.log("PUT response:", response.data);

  //     await new Promise(resolve => setTimeout(resolve, 500));
  //   } catch (error) {
  //     console.log("An error occurred while updating OTMACON:", error);
  //     const response = error?.status || error.message;
  //     expect(response).toBe(200);
  //   }

  //   try {
  //     tokenConfig.method = 'get';
  //     tokenConfig.data = {
  //       "sysParms": "OTMACON",
  //     };

  //     let response = await axios.request(tokenConfig);
  //     console.log("GET response:", response.data);

  //     expect(response.data.data.OTMACON).toBe(otmaconValue);
  //   } catch (error) {
  //     console.log("An error occurred while reading OTMACON:", error);
  //     const response = error?.status || error.message;
  //     expect(response).toBe(200);
  //   }
  // });

  // it('UR(6.2) - should update TRACSTR parameter to YES/NO', async () => {
  //   let tracstrValue = getRandomYesOrNo();

  //   let tokenConfig = {
  //     timeout: 10000,
  //     maxBodyLength: Infinity,
  //     url: serverURL + "qm-sysparms?qmName=" + testQueueManager,
  //     headers: {
  //       'Cookie': ltpaToken2,
  //     },
  //   };

  //   try {
  //     tokenConfig.method = 'put';
  //     tokenConfig.data = {
  //       "sysParms": {
  //         "TRACSTR": tracstrValue,
  //       },
  //     };

  //     let response = await axios.request(tokenConfig);
  //     console.log("PUT response:", response.data);

  //     await new Promise(resolve => setTimeout(resolve, 500));
  //   } catch (error) {
  //     console.log("An error occurred while updating TRACSTR:", error);
  //     const response = error?.status || error.message;
  //     expect(response).toBe(200);
  //   }

  //   try {
  //     tokenConfig.method = 'get';
  //     tokenConfig.data = {
  //       "sysParms": "TRACSTR",
  //     };

  //     let response = await axios.request(tokenConfig);
  //     console.log("GET response:", response.data);

  //     expect(response.data.data.TRACSTR).toBe(tracstrValue);
  //   } catch (error) {
  //     console.log("An error occurred while reading TRACSTR:", error);
  //     const response = error?.status || error.message;
  //     expect(response).toBe(200);
  //   }
  // });

  // it('UR(6.2) - should update EXITLIM parameter to 0-30 int', async () => {
  //   let exitlimValue = getRandomInt(1, 30);

  //   let tokenConfig = {
  //     timeout: 10000,
  //     maxBodyLength: Infinity,
  //     url: serverURL + "qm-sysparms?qmName=" + testQueueManager,
  //     headers: {
  //       'Cookie': ltpaToken2,
  //     },
  //   };

  //   try {
  //     tokenConfig.method = 'put';
  //     tokenConfig.data = {
  //       "sysParms": {
  //         "EXITLIM": exitlimValue.toString(),
  //       },
  //     };

  //     let response = await axios.request(tokenConfig);
  //     console.log("PUT response:", response.data);

  //     await new Promise(resolve => setTimeout(resolve, 500));
  //   } catch (error) {
  //     console.log("An error occurred while updating EXITLIM:", error);
  //     const response = error?.status || error.message;
  //     expect(response).toBe(200);
  //   }

  //   try {
  //     tokenConfig.method = 'get';
  //     tokenConfig.data = {
  //       "sysParms": "EXITLIM",
  //     };

  //     let response = await axios.request(tokenConfig);
  //     console.log("GET response:", response.data);

  //     expect(response.data.data.EXITLIM).toBe(exitlimValue.toString());
  //   } catch (error) {
  //     console.log("An error occurred while reading EXITLIM:", error);
  //     const response = error?.status || error.message;
  //     expect(response).toBe(200);
  //   }
  // });

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

describe('The editJcl parameter should return a correctly edited CSQ4RPRM', () => {
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

/**
 * Returns a random integer between min and max (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer between min and max.
 */
function getRandomInt(min, max) {
  if (min > max) {
    throw new Error("The min value must be less than or equal to the max value.");
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random value of either "YES" or "NO".
 * @returns {string} "YES" or "NO".
 */
function getRandomYesOrNo() {
  return Math.random() < 0.5 ? "YES" : "NO";
}