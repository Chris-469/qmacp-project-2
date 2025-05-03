const axios = require('axios');
const path = require('path');
const fs = require('fs');
const https = require('https');

const zosmfURL = "https://winmvs3c.hursley.ibm.com:32070/zosmf/"

// Create an HTTPS agent with rejectUnauthorized set to false
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Assisted by watsonx Code Assistant
/**
 * Read one or more system parameters from CSQ4RPRM.
 * @param {string} sysParm - The system parameter to read.
 * @param {string} qmName - The queue manager name.
 * @param {string} ltpaToken - The LTTP token.
 * @returns {Promise<string>} The value of the parameter.
 */
async function readSysParms(ltpaToken, requestBody) {
  // Extract the queue manager name from the request body
  const qmName = requestBody.qmName;
  let returnParameters = {};

  // Check whether we need to extract all system parameters from csq4zprm
  if(!requestBody.sysParms) {
    requestBody.sysParms = 'ALL';
  }

  // get the CSQ4RPRM dataset for this queue manager
  try {
    // Build the request config
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: zosmfURL + 'restfiles/ds/' + 'VICY.' + qmName + '.V9XX.SCSQPROC(CSQ4RPRM)',
      headers: {
        'Cookie': 'LtpaToken2=' + ltpaToken
      },
      httpsAgent
    };

    // do the request to zosmf
    let zosmfResponse = await zosmfRequest(config);

    // Check the zosmfResponse status, only proceed if zosmfResponse succeeded
    if (zosmfResponse.status != 200) {
      return zosmfResponse;
    }

    // Parse the system parameters from the csq4zprm file
    if(requestBody.sysParms == 'ALL') {

      console.log("Reading all parameters from json file");

      // Read the contents of system-parameters.json into a variable
      const systemParametersPath = path.join(__dirname, 'system-parameters.json');
      const systemParametersContent = fs.readFileSync(systemParametersPath, 'utf8');
      const allSystemParameters = JSON.parse(systemParametersContent);

      // Iterate over all parameters and add each one to a response JSON
      Object.keys(allSystemParameters).forEach(async key => {
        // Get the value of the parameter
        const value = await extractParm(zosmfResponse.data, allSystemParameters[key]);

        // Add the parameter to the return value
        returnParameters[allSystemParameters[key]] = value;
      });

    }
    else
    {
      // Check if the last character of sysParms is a comma and remove it if necessary
      while (requestBody.sysParms.endsWith(',')) {
        requestBody.sysParms = requestBody.sysParms.slice(0, -1);
      }

      // Return only the selected system parameters
      const requestSysParms = requestBody.sysParms.split(',');

      // Loop through all requested sysparms and return each one
      for (const parm of requestSysParms) {
        // Extract the value of the parameter
        const value = await extractParm(zosmfResponse.data, parm);

        // Add it to the response
        returnParameters[parm] = value;
      }
    }
    return {
      status: 200,
      statusText: 'Request successful',
      data: returnParameters
    }
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

/**
 * Edit a parameter in CSQ4RPRM.
 * @param {string} sysParm - The system parameter to edited and its new value.
 * @param {string} qmName - The queue manager name.
 * @param {string} ltpaToken - The LTPA token.
 * @returns {Promise<string>} The value of the parameter.
 */
async function editSysParms(ltpaToken, requestBody) {

  // Extract the queue manager name from the request body
  const qmName = requestBody.qmName;

  // get the whole CSQ4RPRM dataset for this queue manager
  try {
    // Build the request config
    let config = {
      method: 'get',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: zosmfURL + 'restfiles/ds/' + 'VICY.' + qmName + '.V9XX.SCSQPROC(CSQ4RPRM)',
      headers: {
        'Cookie': 'LtpaToken2=' + ltpaToken
      },
      httpsAgent
    };

    // Execute the zOSMF request to get the dataset
    let zosmfResponse = await zosmfRequest(config);

    // Check the zosmfResponse status, only proceed if zosmfResponse succeeded
    if (zosmfResponse.status != 200) {
      return zosmfResponse;
    }

    // Update the JCL with the new parameter value
    let updatedJCL = await editJCL(zosmfResponse.data, requestBody.sysParms);

    // Execute zOSMF request to update the dataset TODO update CSQ4RPRM to correct name when testing has finshed
    config = {
      method: 'put',
      timeout: 10000,
      maxBodyLength: Infinity,
      url: zosmfURL + 'restfiles/ds/' + 'VICY.' + qmName + '.V9XX.SCSQPROC(CSQ4RPRM)',
      headers: {
        'Cookie': 'LtpaToken2=' + ltpaToken
      },
      httpsAgent,
      data: updatedJCL
    };

    zosmfResponse = await zosmfRequest(config);

    // Return respone after updating the dataset
    return zosmfResponse;

  } catch(error) {
    console.error('Unexpected error occured in editSysParms');

    // Return all other axios errors and use optional chaining and default values to catch misc errors
    return {
      status: error.response?.status || 500,
      statusText: error.response?.statusText || 'Internal Server Error',
      data: error.response?.data || error.message
    };
  }
}

/**
 * Update the given JCL with the new parameter value.
 * @param {string} jcl - The JCL string to update.
 * @param {string} sysParm - The parameter to update.
 * @returns {string} The updated JCL string.
 */
async function editJCL(jcl, sysParms) {

  // Split the jcl into lines
  let lines = jcl.split('\n');

  // Iterate over each key-value pair in sysParms
  for (const [paramName, paramValue] of Object.entries(sysParms)) {

    // Iterate over each line
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]; // Access the current line

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
        let updatedLine = await editJclLine(line, paramName, paramValue);

        // Push the updated line to the lines array
        lines[i] = updatedLine;
      }
    }
  }
  // Join the lines back into a single string
  return lines.join('\n')
}

/**
 * Update the value of a system parameter in a JCL string.
 * @param {string} jcl - The JCL string to update.
 * @param {string} sysParm - The system parameter to update.
 * @param {string} updateValue - The new value for the system parameter.
 * @returns {string} The updated JCL string.
 */
async function editJclLine(jclLine, sysParm, updateValue) {
    const line = jclLine;

    // Check if the line contains the parameter
    if (line.includes(sysParm)) {
      // Extract the start position of the parameter
      const paramPosition = line.indexOf(sysParm);

      // Find the position of the value using the first space or commas
      let endPos = line.indexOf(" ", paramPosition + sysParm.length);

      // Account for commas at the end of lines
      if (line.substring(endPos - 1, endPos) == ",") {
        endPos -= 1;
      }

      if (endPos === -1 || line[endPos - 1] === ",") {
        endPos = line.indexOf(",", paramPosition + sysParm.length);
      }

      // Replace the old value with the new value
      let updatedLine = 
        line.substring(0, paramPosition + sysParm.length + 1) + 
        updateValue + 
        line.substring(endPos);

      // Check for lines greater than 72 characters
      if (updatedLine.length != 72) {
        if (updatedLine.length > 72) {
          updatedLine = updatedLine.substring(0, 68) + "   X";
        }
        else {
          updatedLine = updatedLine.substring(0, 65) + "      X";
        } 
      }
      // Join the updated line
      return updatedLine;
    }
    // Return the original line if the parameter is not found
    return jclLine; 
}

/**
 * Extracts a single parameter from a CSQ4RPRM formatted JCL job.
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

      // Check for timeout error
      if(error.code == 'ECONNABORTED') {
        return {
          status: 501,
          statusText: 'Request to z/OSMF exceeded timeout',
          data: 'The request from the API server to the z/OSMF server exceeded the timout window. This usually means there is a problem with z/OSMF on PLEX1 so please check that the z/OSMF server is active before continuing.'
        };
      }

      // Return all other axios errors and use optional chaining and default values to catch misc errors
      console.log("code: " + error.code);
      console.log("headers: " + error.headers);
      console.log("method: " + error.method);
      console.log("url: " + error.url);

      return {
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Internal Server Error',
        data: error.response?.data || error.message
      };
  }
}

module.exports = {
  readSysParms,
  extractParm,
  zosmfRequest, 
  editSysParms,
  editJclLine,
  editJCL
};