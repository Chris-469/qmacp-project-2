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

    // Check the response status, only proceed if response succeeded
    if (response.status != 200) {
      console.log("An error occured when calling zosmf");
      console.log(response.status);
      console.log(response.statusText);
      return null;
    } else {
      console.log("Authentication with zosmf successful");
    }

    // Parse the value from the response
    const value = await extractParm(response.data, sysParm);
    return value;

  } catch(error) {
    console.error('Error occured in readSysParm:', error.response.statusMessage);
    throw error;
  }
}

// Assisted by watsonx Code Assistant
/**
 * Extracts a parameter from a JCL string.
 * @param {string} jcl - The JCL string to search.
 * @param {string} sysParm - The parameter to extract.
 * @returns {string|null} The value of the parameter if found, or null if not found.
 */
async function extractParm(jcl, sysParm) {
  // Split the jcl into lines
  const lines = jcl.split('\n');

  // Iterate over each line
  for (const line of lines) {
    // Check if the line contains the search string
    if (line.includes(sysParm)) {

      // Check that this line is not a commnet
      if(line.trim().substring(0,sysParm.length) != sysParm) {
        console.log("Parm found but not on the correct line");
        continue;
      }

      // Extract the parameter value
      const paramPosition = line.indexOf(sysParm);
      const value = line.substring(paramPosition + sysParm.length + 1, line.indexOf(","));

      // Return the parameter value
      return value;
    }
  }
  return null; // Return null if the parameter is not found
}

module.exports = {
  readSysParm,
  extractParm
};