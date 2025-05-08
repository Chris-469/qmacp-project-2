const cookieParser = require('cookie-parser');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { readSysParms, zosmfRequest, editSysParms } = require('./app/zosmf-mq-services');
const app = express();
const https = require('https');
const path = require('path');
const fs = require('fs');

const PORT = 3000;
const zosmfURL = "https://winmvs3c.hursley.ibm.com:32070/zosmf/"

// Create an HTTPS agent with rejectUnauthorized set to false
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QM Automated Configuration Project API',
      version: '1.0.0',
    },
  },
  apis: ['./server.js'], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

app.use(cookieParser());
app.use(express.json()); // Middleware to parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded payloads
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Set to true for testing
let isAuthenticated = true;

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root URL
 *     responses:
 *       200:
 *         description: Welcome to root URL of Server
 */
app.get('/', (req, res)=>{
  console.log("Root URL was accessed");
  res.status(200);
  res.send("Welcome to root URL of Server");
});

/**
 * @swagger
 * /authenticate:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticate with the server using your z/OSMF credentials to obtain an LtpaToken2 to authenticate subsequent requests.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: 'Basic Authentication header. Basic authentication is a method for HTTP user agents, such as web browsers, to provide a user ID and password when making a request to a protected resource.
 *                       To use Basic authentication, a header field of Authorization: Basic <credentials> will be needed, where credentials are the base64 encoding of the ID and password conjoined by a single colon :.
 *                       For example: Authorization: Basic dGVzdDEyMzQ6dGVzdDEyMzQ='
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: You are successfully authenticated
 *       400:
 *         description: Authorization header missing
 *       401:
 *         description: Credentials invalid
 *       500:
 *         description: Internal server error
 *       501:
 *         description: z/OSMF server inactive
 */
app.post('/authenticate', async (req, res) => {
  console.log("POST /authenticte endpoint was called");

  // Check that the header field contains an authorization header
  if (!req.headers.authorization) {
    const authHeaderMissing = {
      'status': 400,
      'statusText': 'Authorization header missing',
      'data': 'A basic authentication header is required to authenticate successfully. Use by attaching a header field of Authorization: Basic <credentials> to your request, where credentials are the base64 encoding of the ID and password conjoined by a single colon.'
    }

    return res.status(400).send(authHeaderMissing);
  }

  // Build the request config
  let config = {
    method: 'post',
    timeout: 10000,
    maxBodyLength: Infinity,
    url: zosmfURL + 'services/authenticate',
    headers: {
      'Authorization' : req.headers.authorization
    },
    httpsAgent // Add the HTTPS agent to the request configuration
  };

  // Call the authenticate endpoint
  console.log("Calling zosmfRequest from /authenticate");
  const response = await zosmfRequest(config);

  // Set the headers from the axios response to the express response by iterating over each header
  if (response.headers != null) {
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });
  }

  // Ensure Transfer-Encoding header is not set since Content-Length is set, to comply with HTTP/1.1 specification
  res.removeHeader('Transfer-Encoding');

  // Send the response
  res.status(response.status);
  res.send({
    'status': response.status,
    'statusText': response.statusText,
    'data': response.data.message
  });
});

/**
 * @swagger
 * /qm/sysparms:
 *   get:
 *     summary: Get system parameters for a queue manager
 *     description: Retrieve system parameters for a specified queue manager. A mandatory query parameter `qmName` must be provided to specify the queue manager. Optionally, a request body can include a `sysParms` field containing a comma-separated list of system parameter names to retrieve. If `sysParms` is not provided, all system parameters are returned by default.
 *     parameters:
 *       - in: query
 *         name: qmName
 *         description: The name of the queue manager.
 *         required: true
 *         schema:
 *           type: string
 *       - in: cookie
 *         name: LtpaToken2
 *         description: LtpaToken2 for authentication.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Optional request body containing a comma-separated list of system parameters to retrieve.
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sysParms:
 *                 type: string
 *                 description: A comma-separated list of system parameter names to retrieve.
 *                 example: "INBUFF,QSGDATA"
 *     responses:
 *       200:
 *         description: System parameters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 statusText:
 *                   type: string
 *                   example: "Request successful"
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *                   example:
 *                     INBUFF: "60"
 *       400:
 *         description: Mandatory parameter qmName or LtpaToken2 is missing
 *       401:
 *         description: Credentials invalid
 *       500:
 *         description: Internal server error
 *       501:
 *         description: z/OSMF server inactive
 */
app.get('/qm/sysparms', async (req, res)=>{
  console.log("GET /qm-sysparms endpoint was called");

  // Check if the request is missing queue manager name
  if (!req.query.qmName) {
    // Return 400 since queue manager name is missing
    return res.status(400).send({
      'status': 400,
      'statusText': 'Mandatory parameter qmName is missing',
      'data': 'The request failed because the mandatory qmName field was missing from parameters. Please try again and provide a valid qmName field'
    });
  }

  // Check if the request is missing an LtpaToken2
  if (!req.cookies.LtpaToken2) {
    // Return 400 since queue manager name is missing
    return res.status(400).send({
      'status': 400,
      'statusText': 'Mandatory request header LtpaToken2 is missing',
      'data': 'The request failed because request header did not include an LtpaToken2 token. Please try again and provide a valid LtpaToken2. If you do not have an LtpaToken2 yet, us the /authenticate endpoint to get one'
    });
  }

  console.log("Request body: ", req.body);

  // Pass the relevant fields to the readSysParm function and wait for the response
  const response = await readSysParms(req.query.qmName, req.cookies.LtpaToken2, req.body.sysParms);

  // Send the response
  res.status(response.status);
  res.send({
    'status': response.status,
    'statusText': response.statusText,
    'data': response.data
  });
});

/**
 * @swagger
 * /qm/sysparms:
 *   put:
 *     summary: Edit system parameters for a queue manager
 *     description: Edit one or more system parameters for a specified queue manager. A mandatory query parameter `qmName` must be provided to specify the queue manager. The request body must contain at least one parameter to update.
 *     parameters:
 *       - in: query
 *         name: qmName
 *         description: The name of the queue manager.
 *         required: true
 *         schema:
 *           type: string
 *       - in: cookie
 *         name: LtpaToken2
 *         description: LtpaToken2 for authentication.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: A JSON object containing at least one system parameter to update.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *             example:
 *               INBUFF: "40"
 *               OUTBUFF: "100"
 *     responses:
 *       200:
 *         description: System parameters updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 statusText:
 *                   type: string
 *                   example: "JCL updated successfully"
 *       400:
 *         description: Mandatory parameter qmName or LtpaToken2 is missing, or the request body is invalid
 *       401:
 *         description: Credentials invalid
 *       500:
 *         description: Internal server error
 *       501:
 *         description: z/OSMF server inactive
 */
app.put('/qm/sysparms', async (req, res)=>{
  console.log("PUT /qm-sysparms endpoint was called");

  // Check if the request is missing queue manager name
  if (!req.query.qmName) {
    // Return 400 since queue manager name is missing
    return res.status(400).send({
      'status': 400,
      'statusText': 'Mandatory parameter qmName is missing',
      'data': 'The request failed because the mandatory qmName field was missing from the parameters. Please try again and provide a valid qmName field'
    });

  }

  // Check if the request is missing an LtpaToken2
  if (!req.cookies.LtpaToken2) {
    // Return 400 since queue manager name is missing
    return res.status(400).send({
      'status': 400,
      'statusText': 'Mandatory request header LtpaToken2 is missing',
      'data': 'The request failed because request header did not include an LtpaToken2 token. Please try again and provide a valid LtpaToken2. If you do not have an LtpaToken2 yet, us the /authenticate endpoint to get one'
    });
  }

  // Pass the relevant fields to the editSysParms function and wait for the response
  const response = await editSysParms(req.query.qmName, req.cookies.LtpaToken2, req.body);

  // Send the response
  if (response.status == 204) {
    res.status(200).send({
      status: 200,
      statusText: "JCL updated successfully",
    });
  } else {
    res.send({
      'status': response.status,
      'statusText': "JCL updated successfully",
      'data': response.data
    });
  }
});

/**
 * @swagger
 * /qm/sysparms/download:
 *   get:
 *     summary: Download system parameters for a queue manager
 *     description: Download system parameters for a specified queue manager as a JSON file. A mandatory query parameter `qmName` must be provided to specify the queue manager. The request must include an LtpaToken2 cookie for authentication.
 *     parameters:
 *       - in: query
 *         name: qmName
 *         description: The name of the queue manager.
 *         required: true
 *         schema:
 *           type: string
 *       - in: cookie
 *         name: LtpaToken2
 *         description: LtpaToken2 for authentication.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: System parameters downloaded successfully
 *       400:
 *         description: Mandatory parameter qmName or LtpaToken2 is missing
 *       401:
 *         description: Credentials invalid
 *       500:
 *         description: Internal server error
 */
app.get('/qm/sysparms/download', async (req, res) => {
  
  console.log("GET /qm/sysparms/download endpoint was called");

  // Check if the request is missing queue manager name
  if (!req.query.qmName) {
    // Return 400 since queue manager name is missing
    return res.status(400).send({
      'status': 400,
      'statusText': 'Mandatory parameter qmName is missing',
      'data': 'The request failed because the mandatory qmName field was missing from parameters. Please try again and provide a valid qmName field'
    });
  }

  // Check if the request is missing an LtpaToken2
  if (!req.cookies.LtpaToken2) {
    // Return 400 since queue manager name is missing
    return res.status(400).send({
      'status': 400,
      'statusText': 'Mandatory request header LtpaToken2 is missing',
      'data': 'The request failed because request header did not include an LtpaToken2 token. Please try again and provide a valid LtpaToken2. If you do not have an LtpaToken2 yet, us the /authenticate endpoint to get one'
    });
  }

  // Pass the relevant fields to the readSysParm function and wait for the response
  const response = await readSysParms(req.query.qmName, req.cookies.LtpaToken2, req.body.sysParms);

  // Create the JSON file to be downloaded
  const uniqueFileName = `sysparms-${req.query.qmName}-${Date.now()}.json`;
  const tmpFile = {
    qmName: req.query.qmName,
    data: response.data
  };

  // Define the temporary directory and file path
  const tmpDir = path.join(__dirname, 'tmp');
  const filePath = path.join(tmpDir, uniqueFileName);

  // Write the JSON file to the temporary directory
  fs.writeFileSync(filePath, JSON.stringify(tmpFile, null, 2));

  // Send the JSON file as a download
  res.status(response.status);
  res.download(filePath, uniqueFileName, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Error occurred while downloading the file.');
    } else {
      // Optionally delete the file after sending it
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting temporary file:', unlinkErr);
        }
      });
    }
  });
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server running + available at http://localhost:3000 ")
    else
        console.log("Error occurred, server can't start", error);
    }
);