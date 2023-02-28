const router = require("express").Router();
const { getJobsObj, headlessBrowser } = require("../searchFunctions");
// require('dotenv').config();
module.exports = router;

const { htmlStickerMule, htmlCohere } = require('./testHTML');

router.post("/", async(req, res, next) => {
  try{
    const payload = req.body;

      // convert payload array into 1 searchPhrase array & 1 url array
    const createNewArray = (payloadArr, arrElement) => {
      const newArr = [...payloadArr[arrElement][1].split(',')]
      console.log(newArr)
      return newArr.map(currElem => currElem.trim());
    };
    const searchPhraseArr =  createNewArray(payload, 0);
    const urlArr = createNewArray(payload, 1);

      //interation for promises via for loop
    const urlObj = {};
    for(let i = 0; i < urlArr.length; i++) {

      const htmlData = async() => {
        try {
          const html = await headlessBrowser(urlArr[i]);
          const htmlData = html;
          return htmlData;
        } catch(err) {
          console.log('html data error:', urlArr[i])
        }
      };

      const buildUrlObj = async() => {
        urlObj[urlArr[i]] = await htmlData();
      };
      
      await buildUrlObj();

    };

    const searchedJobsRes = getJobsObj(searchPhraseArr, urlObj);

    res.send(searchedJobsRes);

  } catch (err) {
    next(err);
  };
});