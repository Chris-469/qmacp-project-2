const axios = require('axios');

const zosmfURL = "https://winmvs3c.hursley.ibm.com:32070/zosmf/"

// Assisted by watsonx Code Assistant
/**
 * Read one or more system parameters from CSQ4ZPRM.
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
    let response = await axios.request(config);

    // Check the response status, only proceed if response succeeded
    if (response.status != 200) {
      return response;
    }

    // Parse the value from the response
    const value = await extractParm(response.data, sysParm);
    response.data = value;
    return response;

  } catch(error) {
    console.error('Error occured in readSysParm');

    // Return all other axios errors and use optional chaining and default values to catch misc errors
    return {
      status: error.response?.status || 500,
      statusText: error.response?.statusText || 'Internal Server Error',
      data: error.response?.data || error.message
    };

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

// Assisted by watsonx Code Assistant
/**
 * Make a request to z/OSMF using the provided configuration.
 * @param {object} config - The configuration object for the request.
 * @returns {Promise<object>} - A promise that resolves to an object containing the response status, status text, and data.
 */
async function zosmfRequest(config) {
  try {
    // Do the request to zosmf
    const response = await axios.request(config);

    // Return response andf the cookie
    return response;

  } catch(error) {
      // Handle axios errors
      console.log("An axios error occurred in zosmfRequest");

      // Check for timeout error
      if(error.code == 'ECONNABORTED') {
        return {
          status: 501,
          statusText: 'Request to z/OSMF exceeded timeout',
          data: 'The request from the API server to the z/OSMF server exceeded the timout window. This usually means there is a problem with z/OSMF on PLEX1 so please check that the z/OSMF server is active before continuing.'
        };
      }

      // Return all other axios errors and use optional chaining and default values to catch misc errors
      return {
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Internal Server Error',
        data: error.response?.data || error.message
      };
  }
}

module.exports = {
  readSysParm,
  extractParm,
  zosmfRequest
};