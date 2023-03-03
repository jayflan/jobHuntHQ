const router = require("express").Router();
const { getJobsObj } = require("../searchFunctions");
module.exports = router;


router.post("/", async(req, res, next) => {
  try{
    const { searchArr, scrapedUrlObj } = req.body;

    res.send(getJobsObj(searchArr, scrapedUrlObj))

  } catch (err) {
    next(err);
  };
});