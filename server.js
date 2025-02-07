const cookieParser = require('cookie-parser');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res)=>{
  res.status(200);
  res.send("Welcome to root URL of Server");
});

app.post('/authenticate', (req, res) => {
  console.log(req.cookies.LtpaToken2);

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
