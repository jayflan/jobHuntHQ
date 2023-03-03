const router = require("express").Router();
const { headlessBrowser } = require("../searchFunctions");
module.exports = router;

router.post("/", async(req, res, next) => {
  try{
    const body = req.body;
    const urlStr = body.urlStr;
    const htmlScraped = await headlessBrowser(urlStr);
    res.send(htmlScraped);
    
  } catch (err) {
    console.log('html data error:', urlStr)
    next(err);
  };
});