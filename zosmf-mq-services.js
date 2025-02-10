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
 * Extracts a single parameter from a CSQ4ZPRM formatted JCL job.
 * @param {string} jcl - The JCL string to search.
 * @param {string} sysParm - The parameter to extract.
 * @returns {string|null} The value of the parameter if found, or null if not found.
 */
async function extractParm(jcl, sysParm) {
  // Split the jcl into lines
  const lines = jcl.split('\n');

  // Iterate over each line
  for (let line of lines) {
    // Check if the line contains the search string
    if (line.includes(sysParm)) {

      // Extract the start position of parameter
      const paramPosition = line.indexOf(sysParm);

      // Check that this line is not a comment, jcl statement or inside another parameter word
      if(line.substring(0,2) == "//" ||
         line.substring(paramPosition + sysParm.length, paramPosition + sysParm.length + 1) != "=" ||
         line.substring(paramPosition - 1, paramPosition) != " ") {
        console.log("Parm found but not on the correct line");
        continue;
      }

      // Find the position of the value using the first space
      let endPos = line.indexOf(" ", paramPosition + sysParm.length);

      // Account for commas at the end of lines
      if (line.substring(endPos - 1, endPos) == ",") {
        endPos -= 1;
      }

      // Extract the actual value from the line
      const value = line.substring(paramPosition + sysParm.length + 1, endPos);

      // Return the parameter value
      return value;
    }
  }
  return null; // Return null if the parameter is not found
}

async function zosmfRequest(config) {
  try {
    // Do the request to zosmf
    const response = await axios.request(config);

    // Return response
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    };

  } catch(error) {
    const response  = {
      "status": 500,
      "statusMessage" : error.message
    }

    return response;
  }
}

module.exports = {
  readSysParm,
  extractParm,
  zosmfRequest
};