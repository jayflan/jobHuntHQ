const router = require("express").Router();
module.exports = router;
// const localLambda = require('local-lambda');
// const app = require('../app');

 // local-lambda testing route
//  app.use('/lambda', async (req, res, next) => {
// 	console.log('Local Lambda route initiated')
//   const result = await localLambda.execute({
//     lambdaPath: path.join(__dirname, 'test.js'),
//     lambdaHandler: 'handler',
//     // envfile: path.join(__dirname, '.env'),
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


 // test Lambda function
 exports.handler = async (event, context) => {
  // try {
  //   // const response = "Hello From the Test.js File!!!"
  //   return event;
  // } catch(err) {
  //   console.log(err);
  //   return err;
  // };
  return "Hello World!";
 };




// router.post("/", async(req, res, next) => {
//   try{
//     // console.log(handler())
//     res.send();

//   } catch (err) {
//     next(err);
//   };
// });