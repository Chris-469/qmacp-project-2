const cookieParser = require('cookie-parser');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { readSysParm } = require('./zosmf-mq-services');
const app = express();
const PORT = 3000;

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
app.post('/authenticate', (req, res) => {
  isAuthenticated = true;
  console.log("isAuthenticated set to true");

  res.send("You are successfully authenticated");
  res.status(200);
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running. Server available at http://localhost:3000 ")
    else
        console.log("Error occurred, server can't start", error);
    }
);
