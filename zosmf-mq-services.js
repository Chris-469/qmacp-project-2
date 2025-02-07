const axios = require('axios');

const zosmfURL = "https://winmvs3c.hursley.ibm.com:32070/zosmf/"

/**
 * Read a system parameter from CSQ4ZPRM.
 * @param {string} sysParm - The system parameter to read.
 * @param {string} qmName - The queue manager name.
 * @param {string} ltpaToken - The LTTP token.
 * @returns {Promise<string>} The value of the parameter.
 */
async function readSysParm(sysParm, qmName, ltpaToken) {

  // get the CSQ4ZPRM dataset for this queue manager
  try {
    // Build the request config
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: zosmfURL + 'restfiles/ds/' + 'VICY.' + qmName + '.V9XX.SCSQPROC(CSQ4ZPRM)',
      headers: {
        'Cookie': 'LtpaToken2=' + ltpaToken
      }
    };

    console.log(config);
    const response = await axios.request(config);

    // Parse the value from the response
    const value = response.data.value;

    // Return the value
    return value;

  } catch(error) {
    console.error('Error reading parameter:', error);
    throw error;
  }
}

module.exports = {
  readSysParm
};