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

    // do the request to zosmf
    const response = await axios.request(config);

    // Parse the value from the response
    const value = await extractParm(response.data, sysParm);

    return value;

  } catch(error) {
    console.error('Error reading parameter:', error);
    throw error;
  }
}

async function extractParm(jcl, sysParm) {
  // Split the jcl into lines
  const lines = jcl.split('\n');

  // Iterate over each line
  lines.forEach(line => {
    // Check if the line contains the search string
    if (line.includes(sysParm)) {

      // Determine if this is the correct line
      const paramPosition = line.indexOf(sysParm);

      const value = line.substring(paramPosition + sysParm.length + 1,(line.indexOf(",")));

      return value;
    }
  });
  return;
}

module.exports = {
  readSysParm
};