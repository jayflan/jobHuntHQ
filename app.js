const express = require("express");
const path = require("path");

const app = express();

  // middleware (parsing & local lambda/serverless dev)
app.use(express.json({ limit: '5mb'}));
app.use(express.urlencoded({
  limit: '5mb',
  extended: true,
  }));

  //cors middleware for lambda/serverless
app.use((req, res, next) =>{
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
    next();
});

// api/router
app.use("/api", require("./api"));

  // lambda/serverless eval for local dev express server
const awsLambda = process.env.SERVERLESS; // true or false setting
if(awsLambda === "false") {
  const morgan = require('morgan');
  app.use(morgan("dev"));  
    // static middleware
  app.get("/", (req, res) => 
    res.sendFile(path.join(__dirname, ".", "public/index.html"))
  );
  app.use(express.static(path.join(__dirname, ".", "public")));
    //*index html catch path (sends all other requests to there) - not used if serverless/lambda
};
    
  // local-lambda testing route
// app.use('/lambda', async (res, req, next) =>{
// 	console.log('Local Lambda route initiated')
//   const result = await localLambda.execute({
//     lambdaPath: path.join(__dirname, 'lambda.js'),
//     lambdaHandler: handler,
//     envfile: path.join(__dirname, '.env'),
//     event: {
//       headers: req.headers,
//       body: req.body
//     }
//   });
//   res
//     // .status(result.statusCode)
// 		.status(5000)
//     .set(result.headers)
//     .end(result.body)
// });

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
