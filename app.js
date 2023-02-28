// const { Cheerio, load } = require("cheerio");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
require('dotenv').config();

const app = express();

// middleware (logging & parsing)
app.use(express.json({ limit: '5mb'}));
app.use(express.urlencoded({
  limit: '5mb',
  extended: true,
  }));

const awsLambda = process.env.SERVERLESS; // true or false setting
if(awsLambda === "false") {
  app.use(morgan("dev"));  
    // static middleware
  app.get("/", (req, res) => 
    res.sendFile(path.join(__dirname, ".", "public/index.html"))
  );
  app.use(express.static(path.join(__dirname, ".", "public")));
    //*index html catch path (sends all other requests to there) - not used if serverless/lambda
};
    
  // api/router
app.use("/api", require("./api"));
  //*auth routes - Not used for jobHuntHQ app currently
  // app.use("/auth", require("./_auth"));
  
if(awsLambda === "false") {
  app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, ".", "public/index.html"));
  });
};

// error handling endware
app.use((req, res, next) => {
  const error = Error('Page Not Found.');
  error.status = 404;
  next(error);
});

app.use((err, req, res) => {
  console.log(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal Server Error.');
});

  //any remaining reqs w/ an extension (.js, .css, etc...) send 404
app.use((req, res, next) => {
  if(path.extname(req.path).length) {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
  } else {
    next();
  }
});

module.exports = app;
