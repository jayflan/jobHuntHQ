const router = require("express").Router();
module.exports = router;

// router.use("/jobs", require("./jobs"));
router.use("/test", require("./test"));
router.use("/webscraper", require("./webScraper"));
router.use("/search", require("./search.js"));

router.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});