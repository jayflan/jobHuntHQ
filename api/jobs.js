const router = require("express").Router();
const axios = require("axios");
const { getJobsObj } = require("../searchFunctions");
require('dotenv').config();
module.exports = router;

const { htmlStickerMule, htmlCohere } = require('./testHTML');

/*External API Routes*/

router.post("/", async(req, res, next) => {
  try{
    const payload = req.body;

      // convert payload array into 1 searchPhrase array & 1 url array
    const createNewArray = (payloadArr, arrElement) => {
      const newArr = [...payloadArr[arrElement][1].split(',')]
      return newArr.map(currElem => currElem.trim());
    };
    const searchPhraseArr =  createNewArray(payload, 0);
    const urlArr = createNewArray(payload, 1);

      //interation for promises via for loop
    const urlObj = {};
    for(let i = 0; i < urlArr.length; i++) {

      const getHtml = async(urlStr) => {
        try {
          const html = await axios.get(urlStr);
          return html;
        } catch(err) {
          console.log('html fetch error:', urlStr)
        }
      };

      const htmlData = async() => {
        try {
          const html = await getHtml(urlArr[i]);
          return html.data;
        } catch(err) {
          console.log('html dataReturn error:', urlArr[i])
        }
      };

      const buildUrlObj = async() => {
        urlObj[urlArr[i]] = await htmlData();
      };
      
      await buildUrlObj();

    };

    const searchedJobsRes = getJobsObj(searchPhraseArr, urlObj);

    res.send(searchedJobsRes);




  
    //** switched to for loop to help with resolving promises (and NOT using 3rd Part API at this time)
    // const urlObj = urlArr.reduce((accum, currElem) => {

    //   //!scrapeNinja on hold to conserve resource only
    // // const jsonUrl = JSON.stringify({url:currElem});

    // //test
    // // const data = htmlStickerMule
    
    //   // const response = async() => {
    //   //     return await axios.post('https://scrapeninja.p.rapidapi.com/scrape', {
    //   //       url: currElem
    //   //     }, {
    //   //       headers: {
    //   //       'content-type': 'application/json',
    //   //       'X-RapidAPI-Key': process.env.XRAPIDAPIKEY,
    //   //       'X-RapidAPI-Host': process.env.XRAPIDAPIHOST
    //   //     }
    //   //   });
    //   // };

    //   //!Using plain html fetch to conserve 3rd Party resources
    //   const getHtml = async(urlStr) => {
    //     try {
    //       const html = await axios.get(urlStr);
    //       return html;
    //     } catch(err) {
    //       console.log('html fetch error')
    //     }
    //   }

    //   // const dataResponse = getHtml(currElem);
    //   // console.log(dataResponse)
    //   // accum[currElem] = dataResponse.data;
    //   // console.log(accum)
    //   const dataReturn = async() => {
    //     try {
    //       const html = await getHtml(currElem);
    //       return html;
    //     } catch(err) {
    //       console.log('html dataReturn error')
    //     }
    //   };

    //   accum[currElem] = dataReturn();
    //   return accum;
      
    // }, {});

    // // console.log(urlObj)
        
    // const result = getJobsObj(searchPhraseArr, urlObj);
        
    // res.send(result);

  } catch (err) {
    next(err);
  };
});