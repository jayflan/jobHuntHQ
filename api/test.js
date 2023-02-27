const router = require("express").Router();
require('dotenv').config();
module.exports = router;

router.get("/", async(req, res, next) => {
  try{

    res.send('Hello World');

  } catch (err) {
    next(err);
  };
});