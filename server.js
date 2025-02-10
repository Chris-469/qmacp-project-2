const cookieParser = require('cookie-parser');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { readSysParm, zosmfRequest } = require('./zosmf-mq-services');
const app = express();
const PORT = 3000;

const zosmfURL = "https://winmvs3c.hursley.ibm.com:32070/zosmf/"

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
  res.status(200);
  res.send("Welcome to root URL of Server");
});

app.get('/sysParm', async (req, res)=>{

    if (isAuthenticated){
      try {
        const parameterValue = await readSysParm(req.query.sysParm, req.query.qmName, req.cookies.LtpaToken2);

        // TODO If the value is empty then fetch default value

        res.status(200).send(parameterValue);
      } catch (error) {
        console.log(error.code);
        res.status(500).send('Error in server.js reading parameter');
      }
    } else {
      res.status(500).send('Error: User not authenticated');
    }
});

/**
 * @swagger
 * /authenticate:
 *   post:
 *     summary: Authenticate user
 *     responses:
 *       200:
 *         description: You are successfully authenticated
 */
app.post('/authenticate', async (req, res) => {

  // Check that the header field contains an authorization header
  if (!req.headers.authorization) {
    return res.status(400).send('Authorization header is missing');
  }

  // Build the request config
  let config = {
    method: 'post',
    timeout: 10000,
    maxBodyLength: Infinity,
    url: zosmfURL + 'services/authenticate',
    headers: {
      'Authorization' : req.headers.authorization
    }
  };

  // Call the authenticate endpoint
  const response = await zosmfRequest(config);

  // Send the response
  res.status(response.status);
      res.send({
        'status': response.status,
        'statusText': response.statusText
      });
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server running + available at http://localhost:3000 ")
    else
        console.log("Error occurred, server can't start", error);
    }
);
