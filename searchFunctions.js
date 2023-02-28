const { load } = require('cheerio');
const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');
const axios = require('axios');

const getJobsObj = (searchPhraseArr, urlObj) => {
  //create resultObj: structure is -->
    // { 'url1': [job1, job2], 'url2': [job1, job2]}
  
  let resultObj = {};
  if(!searchPhraseArr.length) return 'Search Phrases Empty';
  if(!urlObj) return 'No url addresses';

    const urlKeyArr = Object.keys(urlObj);

    try{
      //regEx helpter function
      const regExFindPhrase = (string, html) => {
        const regex = new RegExp(`\\b${string}\\b`,"gi");
        const phraseFound = regex.test(html);
        return phraseFound; 
      };

      urlKeyArr.forEach(elementUrl => {
          // error output if url status code is 404 for bad url
          if(typeof urlObj[elementUrl] != 'string') {
          const key = Object.keys(urlObj);
          resultObj[elementUrl] = [urlObj[key]];

        } else {

          //load a url into cherrio load method)
          const $ = load(urlObj[elementUrl]);
            //traverse url/html
          $('a').each((i, e) => { // specifically targets <a> tags or an RSS Feed, if avail.
            const row = $(e).text();  //iterate over every html row/element
            // use 'every' method to only push a row once, if a phrase match is found
            searchPhraseArr.every(elementPhrase => {
                //search for phrase in html
              const phraseFound = regExFindPhrase(elementPhrase, row);
              if(phraseFound) { // add found phrases to output
                  //if new phrase found, create 'url': [current elem]
                if(!resultObj[elementUrl]) {
                  resultObj[elementUrl] = [row];
                  return false;
                } else{
                  const elementArr = resultObj[elementUrl];
                  elementArr.push(row);
                  return false;
                } 
              };
              return true;
            });
          });

        };
        
          //What if other urls found a phrase, though not current url?: Let User know in result
        const currUrlArr = resultObj[elementUrl]
        if(!currUrlArr) resultObj[elementUrl] = ['No phrases found.']
      });

    }catch(err) {
      console.log("url Error, Please check inputs")
    }

    //What if no phrases found for all urls?: Let user know in result
    //? make this front end filter, instead ?
  if(!Object.keys(resultObj).length) resultObj["All urls"] = ["No Jobs Found."];  //output if result empty

  return resultObj;

};

  //* currently using this func for scraping to help with sites using Javascript
const headlessBrowser = async(url) => {
  let browser = null;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    //testing navigation issues for serverless
    // await page.setDefaultNavigationTimeout(60000);

    let errorArr = []; // for error output in place of html if url bad
    
    await page.on('response', response => {
      if(response.status() === 404) {
        errorArr.push(`Url Status: ${response.status()}`);
      };
    });

    await page.goto(url, { waitUntil: 'networkidle0' });
    const html = await page.content();
    await browser.close();

    if(errorArr.length) return errorArr;
    return html;

  }catch(err) {
    console.log(err);
  };
}

  // basic html scraper (NOT capatible with sites using Javascript)
const getHtml = async(urlStr) => {
  try {
    const html = await axios.get(urlStr);
    return html;
  } catch(err) {
    console.log('html fetch error:', urlStr)
  }
}

  // 3rd Party API scraper (if more robust scraper needed, etc....)
const resScrapeNinja = async(urlStr) => {
  // const jsonUrl = JSON.stringify({url: urlStr});
  return await axios.post('https://scrapeninja.p.rapidapi.com/scrape-js', {
    url: urlStr
  }, {
    headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': process.env.XRAPIDAPIKEY,
    'X-RapidAPI-Host': process.env.XRAPIDAPIHOST
    }
  });
};


exports.getJobsObj = getJobsObj;
exports.headlessBrowser = headlessBrowser;
exports.getHtml = getHtml;
exports.resScrapeNinja = resScrapeNinja;