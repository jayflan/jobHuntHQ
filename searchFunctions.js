const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');
const axios = require('axios');
const { load } = require('cheerio');

//regEx helpter function
const regExFindPhrase = (string, html) => {
  const regex = new RegExp(`\\b${string}\\b`,"gi");
  const phraseFound = regex.test(html);
  return phraseFound; 
};

const getJobsObj = (searchPhraseArr, urlArr) => {
  //create resultObj: structure is -->
    // { 'url1': [job1, job2], 'url2': [job1, job2]}
  
  let resultObj = {};
  if(!searchPhraseArr.length) return 'Search Phrases Empty';
  if(!urlArr) return 'No url addresses';

    const urlKeyArr = Object.keys(urlArr);

    try{

      urlKeyArr.forEach(elementUrl => {
        const htmlArr = urlArr[elementUrl];
        
        // error output if url status code is 404 for bad url
          if(!htmlArr.length && typeof htmlArr === 'object') {
            const objKeys = Object.keys(htmlArr);
            resultObj[elementUrl] = objKeys;
              
          } else {
            
            htmlArr.forEach((currHtml) => {

              //load a url into cherrio load method)
              const $ = load(currHtml);
                //traverse url/html
              $('a').each((i, e) => { // specifically targets <a> tags or an RSS Feed, if avail.
                const rowInnerHtml = $(e).text();
                const rowOuterHtml = $(e).prop('outerHTML');
                //iterate over every html row/element
                  // use 'every' method to only push a row once, if a phrase match is found
                searchPhraseArr.every(elementPhrase => {
                    //search for phrase in html
                  const phraseFound = regExFindPhrase(elementPhrase, rowInnerHtml);
                  if(phraseFound) { // add found phrases to output
                      //if new phrase found, create 'url': [current elem]
                        // also add paginated text if applies to url scrape
                    if(htmlArr.length > 1 && !resultObj[elementUrl]) {
                      resultObj[elementUrl] = ["( Paginated Webpage )"];
                      return false;
                    } else if(!resultObj[elementUrl]) {
                      resultObj[elementUrl] = [rowInnerHtml];
                      return false;
                    };
                    if(resultObj[elementUrl]) {
                      const elementArr = resultObj[elementUrl];
                      elementArr.push(rowInnerHtml);
                      return false;
                    };
                  };
                  return true;
                });

              });
            });  
              
          };

          //What if other urls found a phrase, though not current url?: Let User know in result
        const currUrlArr = resultObj[elementUrl]
        if(!currUrlArr) resultObj[elementUrl] = ['No phrases found.']

      });

    }catch(err) {
      return(err);
      console.log("url Error, Please check inputs")
    }

    //What if no phrases found for all urls?: Let user know in result
    //? make this front end filter, instead ?
  if(!Object.keys(resultObj).length) resultObj["All urls"] = ["No Jobs Found."];  //output if result empty
  return resultObj;

};


  //* currently using this func for scraping to help with sites using Javascript
const headlessBrowser = async(url) => {
  console.log('inside headlessBrowser-->',url);
  let browser = null;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      // headless: chromium.headless, 
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



      //* Pagination Code / Currently Testing
    const paginationBoolean = await page.$('.pagination');
    
    let htmlArr = [];
    
    if(paginationBoolean) {
      let pageNumber = 1;
        //iterate & scrape while a page has a 'next' link or button
      while (true) {
        const pagerButtonsHtml = await page.$$eval('.pagination button', links => links.map(n => n.innerHTML));
        const pagerAnchorLinks = await page.$$('.pagination a', links => links.map(n => n));
        console.log(pagerAnchorLinks)
          // scrape current page
        htmlArr.push(await page.content());
        console.log(`Scraping page ${pageNumber}`);
          // func for finding next element  
          const isNextElement = async(array) => {
            for(let i = 0; i <= array.length; i++) {
              const currElement = array[i];
              if(currElement){
                console.log('currElement-->', currElement);
                const valueHandle = await currElement.getProperty('innerText');
                const linkText = await valueHandle.jsonValue();
                const foundNextLink = regExFindPhrase('next', linkText);  
                if(foundNextLink) return currElement;
              }
            };
              return undefined;
          };
          // look for element with 'next' text
          const nextLink = await isNextElement(pagerAnchorLinks);

          if(nextLink) {
              await nextLink.click();
              await page.waitForNavigation({ waitUntil: 'networkidle0' });
              pageNumber++;
          } else {
            //stop while loop if no 'next' links on page
            break;
          };

      };

    } else {
      // scrape current page if no pagination
      htmlArr.push(await page.content());
    };


    // const html = await page.content();
    await browser.close();

    if(errorArr.length) return errorArr;

    return htmlArr;
    // return html;

  }catch(err) {
    console.log(err);
    return {Error:err};
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