const router = require("express").Router();
require('dotenv').config();
module.exports = router;
const { handler } = require("../lambda");

router.post("/", async(req, res, next) => {
  try{
    console.log(handler())
    res.send();

  } catch (err) {
    next(err);
  };
});