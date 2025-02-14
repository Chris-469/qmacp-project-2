const cookieParser = require('cookie-parser');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { readSysParms, zosmfRequest } = require('./zosmf-mq-services');
const app = express();
const PORT = 3000;
const https = require('https');

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
 * /qm-sysparms:
 *   get:
 *     summary: Get system parameters for a queue manager
 *     description: Retrieve system parameters for a specified queue manager.
 *     parameters:
 *       - in: body
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
 *         description: System parameters retrieved successfully
 *       400:
 *         description: Mandatory parameter qmName or LtpaToken2 is missing
 *       401:
 *         description: Credentials invalid
 *       500:
 *         description: Internal server error
 *       501:
 *         description: z/OSMF server inactive
 */
app.get('/qm-sysparms', async (req, res)=>{
  console.log("GET /qm-sysparms endpoint was called");

  // Check if the request is missing queue manager name
  if (!req.body.qmName) {
    // Return 400 since queue manager name is missing
    return res.status(400).send({
      'status': 400,
      'statusText': 'Mandatory parameter qmName is missing',
      'data': 'The request failed because the mandatory qmName field was missing from the body. Please try again and provide a valid qmName field'
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
  const response = await readSysParms(req.cookies.LtpaToken2, req.body);

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
  const response = await zosmfRequest(config);

  // Set the headers from the axios response to the express response by iterating over each header
  if (response.headers != null) {
    Object.keys(response.headers).forEach(key => {
      // Remove either Content-Length or Transfer-Encoding if both are present
      if (key.toLowerCase() === 'content-length' && response.headers['transfer-encoding']) {
        delete response.headers[key];
      } else if (key.toLowerCase() === 'transfer-encoding' && response.headers['content-length']) {
        delete response.headers[key];
      }
      res.setHeader(key, response.headers[key]);
    });
  }

  // Send the response
  res.status(response.status);
  res.send({
    'status': response.status,
    'statusText': response.statusText,
    'data': response.data.message
  });
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server running + available at http://localhost:3000 ")
    else
        console.log("Error occurred, server can't start", error);
    }
);
