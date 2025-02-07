const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const PORT = 3000;

app.use(cookieParser());

app.get('/', (req, res)=>{
  res.status(200);
  res.send("Welcome to root URL of Server");
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running. Server available at http://localhost:3000 ")
    else
        console.log("Error occurred, server can't start", error);
    }
);
