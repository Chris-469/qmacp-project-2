const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { extractParm } = require('../app/zosmf-mq-services');
const express = require('express');
const app = express();
const PORT = 3000;

const serverURL = "http://9.20.194.48:3000/"
const testQueueManager = "MQNL";
let testVersion = "9XX";

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
 * Endpoint testing for GET /qm/sysparms
*/
describe('UR(4) - Users must be able to retrieve the current system parameters of an MQ queue manager',  () => {

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
  
  it('UR(4.1) - a GET request to the /system-parameters endpoint returns response code 200', async () => {

    // build the body basic config for the requests
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        'Cookie' : ltpaToken2
        },
      data: {
        "sysParms" : "INBUFF,QSGDATA"
      }
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);

      // check response status
      expect(response.status).toBe(200);
      }
      catch (error) {
        console.log("An error occurred while reading the parameter in testing: " + error);
        const response = error?.status || error.message;
  
        expect(response).toBe(200);
      }
  });

  it('UR(4.1) - specifying no sysparms returns all sysparms', async () => {

    // build the body basic config for the requests
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        'Cookie' : ltpaToken2
        }
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);

      // check length of 51, indicating all sysparms returned
      const sysparmsLength = Object.keys(response.data.data).length;
      expect(sysparmsLength).toBe(51);
      }
      catch (error) {
        console.log("An error occurred while reading the parameter in testing: " + error);
        const response = error?.status || error.message;
  
        expect(response).toBe(200);
      }
  });

  it('UR(4.1) - requesting one sysparm only returns that sysparm', async () => {

    // build the body basic config for the requests
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        'Cookie' : ltpaToken2
        },
      data: {
        "sysParms" : "INBUFF"
      }
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);
      const keys = Object.keys(response.data.data);

      // Check that the first key is "INBUFF"
      expect(keys.length).toBe(1); // Ensure only one key is returned
      expect(keys[0]).toBe("INBUFF"); // Check that the key is "INBUFF"
      }
      catch (error) {
        console.log("An error occurred while reading the parameter in testing: " + error);
        const response = error?.status || error.message;
  
        expect(response).toBe(200);
      }
  });

  it('UR(4.1) - requesting several sysparms returns only those sysparms', async () => {

    // build the body basic config for the requests
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        'Cookie' : ltpaToken2
        },
      data: {
        "sysParms" : "INBUFF,QSGDATA,MAXRTU,DEALLCT"
      }
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);
      const keys = Object.keys(response.data.data);

      // Check that the first key is "INBUFF"
      expect(keys.length).toBe(4); // Ensure only one key is returned
      
      // Check that the keys are "INBUFF", "QSGDATA", "MAXRTU", and "DEALLCT"
      expect(keys[0]).toBe("INBUFF");
      expect(keys[1]).toBe("QSGDATA");
      expect(keys[2]).toBe("MAXRTU");
      expect(keys[3]).toBe("DEALLCT");
      }
      catch (error) {
        console.log("An error occurred while reading the parameter in testing: " + error);
        const response = error?.status || error.message;
  
        expect(response).toBe(200);
      }
  });

  it('UR(XX) - requesting params of certain qm returned CSQ4ZPRM of that qm', async () => {

    // build the body basic config for the requests
    let testQmName = "MQNL";
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms?qmName=" + testQmName + "&qmVersion=" + testVersion,
      headers: {
        'Cookie' : ltpaToken2
        }
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);

      expect(response.status).toBe(200);
      expect(response.data.qmName).toBe(testQmName);
      }
      catch (error) {
        console.log("An error occurred while reading the parameter in testing: " + error);
        const response = error?.status || error.message;
  
        expect(response).toBe(200);
      }
  });

  it('UR(XX) - requesting version 910 returns params for version 910', async () => {

    // build the body basic config for the requests
    testVersion = "910";
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        'Cookie' : ltpaToken2
        }
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);

      expect(response.status).toBe(200);
      expect(response.data.qmVersion).toBe(testVersion);
      }
      catch (error) {
        console.log("An error occurred while reading the parameter in testing: " + error);
        const response = error?.status || error.message;
  
        expect(response).toBe(200);
      }
  });

  it('UR(XX) - requesting version 920 returns params for version 920', async () => {

    // build the body basic config for the requests
    testVersion = "920";
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        'Cookie' : ltpaToken2
        }
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);

      expect(response.status).toBe(200);
      expect(response.data.qmVersion).toBe(testVersion);
      }
      catch (error) {
        console.log("An error occurred while reading the parameter in testing: " + error);
        const response = error?.status || error.message;
  
        expect(response).toBe(200);
      }
  });

  it('UR(XX) - requesting version 9XX returns params for version 9XX', async () => {

    // build the body basic config for the requests
    testVersion = "9XX";
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: serverURL + "qm/sysparms?qmName=" + testQueueManager + "&qmVersion=" + testVersion,
      headers: {
        'Cookie' : ltpaToken2
        }
    }

    try {
      let response;

      // send the request to update the parameter
      response = await axios.request(config);

      expect(response.status).toBe(200);
      expect(response.data.qmVersion).toBe("9XX");
      }
      catch (error) {
        console.log("An error occurred while reading the parameter in testing: " + error);
        const response = error?.status || error.message;
  
        expect(response).toBe(200);
      }
  });
});

/**
 * Function testing section
 */
describe('The extractParm function should extract the value of any valid system parameter', () => {
  let jclContent;

  beforeAll(() => {
    // Read the contents of the example-csq4zprm.jcl file
    const filePath = path.join(__dirname, '..', 'example-csq4zprm.jcl');
    jclContent = fs.readFileSync(filePath, 'utf8');
  });

  // Testing CSQ6LOGP parameters
  test('should extract the value of INBUFF', async () => {
    const value = await extractParm(jclContent, 'INBUFF');
    expect(value).toBe('60');
  });

  test('should extract the value of OUTBUFF', async () => {
    const value = await extractParm(jclContent, 'OUTBUFF');
    expect(value).toBe('4000');
  });

  test('should extract the value of MAXRTU', async () => {
    const value = await extractParm(jclContent, 'MAXRTU');
    expect(value).toBe('2');
  });

  test('should extract the value of DEALLCT', async () => {
    const value = await extractParm(jclContent, 'DEALLCT');
    expect(value).toBe('0');
  });

  test('should extract the value of OFFLOAD', async () => {
    const value = await extractParm(jclContent, 'OFFLOAD');
    expect(value).toBe('YES');
  });

  test('should extract the value of MAXARCH', async () => {
    const value = await extractParm(jclContent, 'MAXARCH');
    expect(value).toBe('500');
  });

  test('should extract the value of TWOACTV', async () => {
    const value = await extractParm(jclContent, 'TWOACTV');
    expect(value).toBe('YES');
  });

  test('should extract the value of TWOARCH', async () => {
    const value = await extractParm(jclContent, 'TWOARCH');
    expect(value).toBe('YES');
  });

  test('should extract the value of TWOBSDS', async () => {
    const value = await extractParm(jclContent, 'TWOBSDS');
    expect(value).toBe('YES');
  });

  test('should extract the value of COMPLOG', async () => {
    const value = await extractParm(jclContent, 'COMPLOG');
    expect(value).toBe('NONE');
  });

  test('should extract the value of WRTHRSH', async () => {
    const value = await extractParm(jclContent, 'WRTHRSH');
    expect(value).toBe('20');
  });

  test('should extract the value of ZHYWRITE', async () => {
    const value = await extractParm(jclContent, 'ZHYWRITE');
    expect(value).toBe('NO');
  });

  // CSQ6ARVP parameters
  test('should extract the value of ALCUNIT', async () => {
    const value = await extractParm(jclContent, 'ALCUNIT');
    expect(value).toBe('BLK');
  });

  test('should extract the value of ARCPFX1', async () => {
    const value = await extractParm(jclContent, 'ARCPFX1');
    expect(value).toBe('CSQARC1');
  });

  test('should extract the value of ARCPFX2', async () => {
    const value = await extractParm(jclContent, 'ARCPFX2');
    expect(value).toBe('CSQARC2');
  });

  test('should extract the value of ARCRETN', async () => {
    const value = await extractParm(jclContent, 'ARCRETN');
    expect(value).toBe('30');
  });

  test('should extract the value of ARCWRTC', async () => {
    const value = await extractParm(jclContent, 'ARCWRTC');
    expect(value).toBe('(1,3,4)');
  });

  test('should extract the value of ARCWTOR', async () => {
    const value = await extractParm(jclContent, 'ARCWTOR');
    expect(value).toBe('YES');
  });

  test('should extract the value of BLKSIZE', async () => {
    const value = await extractParm(jclContent, 'BLKSIZE');
    expect(value).toBe('24576');
  });

  test('should extract the value of CATALOG', async () => {
    const value = await extractParm(jclContent, 'CATALOG');
    expect(value).toBe('NO');
  });

  test('should extract the value of COMPACT', async () => {
    const value = await extractParm(jclContent, 'COMPACT');
    expect(value).toBe('NO');
  });

  test('should extract the value of PRIQTY', async () => {
    const value = await extractParm(jclContent, 'PRIQTY');
    expect(value).toBe('25715');
  });

  test('should extract the value of PROTECT', async () => {
    const value = await extractParm(jclContent, 'PROTECT');
    expect(value).toBe('NO');
  });

  test('should extract the value of QUIESCE', async () => {
    const value = await extractParm(jclContent, 'QUIESCE');
    expect(value).toBe('5');
  });

  test('should extract the value of SECQTY', async () => {
    const value = await extractParm(jclContent, 'SECQTY');
    expect(value).toBe('540');
  });

  test('should extract the value of TSTAMP', async () => {
    const value = await extractParm(jclContent, 'TSTAMP');
    expect(value).toBe('NO');
  });

  test('should extract the value of UNIT', async () => {
    const value = await extractParm(jclContent, 'UNIT');
    expect(value).toBe('TAPE');
  });

  test('should extract the value of UNIT2', async () => {
    const value = await extractParm(jclContent, 'UNIT2');
    expect(value).toBe('');
  });

  // CSQ6SYSP parameters
  test('should extract the value of ACELIM', async () => {
    const value = await extractParm(jclContent, 'ACELIM');
    expect(value).toBe('0');
  });

  test('should extract the value of CLCACHE', async () => {
    const value = await extractParm(jclContent, 'CLCACHE');
    expect(value).toBe('STATIC');
  });

  test('should extract the value of CMDUSER', async () => {
    const value = await extractParm(jclContent, 'CMDUSER');
    expect(value).toBe('CSQOPR');
  });

  test('should extract the value of EXCLMSG', async () => {
    const value = await extractParm(jclContent, 'EXCLMSG');
    expect(value).toBe('()');
  });

  test('should extract the value of EXITLIM', async () => {
    const value = await extractParm(jclContent, 'EXITLIM');
    expect(value).toBe('30');
  });

  test('should extract the value of EXITTCB', async () => {
    const value = await extractParm(jclContent, 'EXITTCB');
    expect(value).toBe('8');
  });

  test('should extract the value of LOGLOAD', async () => {
    const value = await extractParm(jclContent, 'LOGLOAD');
    expect(value).toBe('500000');
  });

  test('should extract the value of OTMACON', async () => {
    const value = await extractParm(jclContent, 'OTMACON');
    expect(value).toBe('(MQSERIES,,DFSYDRU0,2147483647,CSQ)');
  });

  test('should extract the value of QINDXBLD', async () => {
    const value = await extractParm(jclContent, 'QINDXBLD');
    expect(value).toBe('WAIT');
  });

  test('should extract the value of QMCCSID', async () => {
    const value = await extractParm(jclContent, 'QMCCSID');
    expect(value).toBe('0');
  });

  test('should extract the value of QSGDATA', async () => {
    const value = await extractParm(jclContent, 'QSGDATA');
    expect(value).toBe('(SQL3,DSNV12P1,DKP1,4,4)');
  });

  test('should extract the value of RESAUDIT', async () => {
    const value = await extractParm(jclContent, 'RESAUDIT');
    expect(value).toBe('YES');
  });

  test('should extract the value of ROUTCDE', async () => {
    const value = await extractParm(jclContent, 'ROUTCDE');
    expect(value).toBe('1');
  });

  test('should extract the value of SMFACCT', async () => {
    const value = await extractParm(jclContent, 'SMFACCT');
    expect(value).toBe('NO');
  });

  test('should extract the value of SMFSTAT', async () => {
    const value = await extractParm(jclContent, 'SMFSTAT');
    expect(value).toBe('NO');
  });

  test('should extract the value of SPLCAP', async () => {
    const value = await extractParm(jclContent, 'SPLCAP');
    expect(value).toBe('NO');
  });

  test('should extract the value of STATIME', async () => {
    const value = await extractParm(jclContent, 'STATIME');
    expect(value).toBe('30');
  });

  test('should extract the value of TRACSTR', async () => {
    const value = await extractParm(jclContent, 'TRACSTR');
    expect(value).toBe('YES');
  });

  test('should extract the value of TRACTBL', async () => {
    const value = await extractParm(jclContent, 'TRACTBL');
    expect(value).toBe('99');
  });

  test('should extract the value of WLMTIME', async () => {
    const value = await extractParm(jclContent, 'WLMTIME');
    expect(value).toBe('30');
  });

  test('should extract the value of WLMTIMU', async () => {
    const value = await extractParm(jclContent, 'WLMTIMU');
    expect(value).toBe('MINS');
  });

  test('should extract the value of SERVICE', async () => {
    const value = await extractParm(jclContent, 'SERVICE');
    expect(value).toBe('0');
  });

  // CSQ6USGP parameters
  test('should extract the value of QMGRPROD', async () => {
    const value = await extractParm(jclContent, 'QMGRPROD');
    expect(value).toBe('');
  });

  test('should extract the value of QMGRPROD', async () => {
    const value = await extractParm(jclContent, 'QMGRPROD');
    expect(value).toBe('');
  });

  // Testing parameters that dont exist
  test('should return null for a non-existent parameter', async () => {
    const value = await extractParm(jclContent, 'NONEXISTENT');
    expect(value).toBeNull();
  });
});

