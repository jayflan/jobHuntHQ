const { load } = require('cheerio');

// MAIN FUNCTIONS FOR APP
function getJobsObj(searchPhraseArr, urlObj) {
  
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
          //load a url into cherrio load method)
        const $ = load(urlObj[elementUrl]);
          //traverse url/html
        $('a').each((i, e) => { // specifically targets <a> tags or an RSS Feed, if avail.
          const row = $(e).text();  //iterate over every html row/element
          searchPhraseArr.forEach(elementPhrase => {
              //search for phrase in html
            const phraseFound = regExFindPhrase(elementPhrase, row);
            const rssFound = regExFindPhrase('rss', row);
              if(rssFound) console.log(row, elementUrl)
            
            if(phraseFound) { // add found phrases to output
                //if new phrase found, create 'url': [current elem]
              if(!resultObj[elementUrl]) {
                resultObj[elementUrl] = [row];
              } else{
                const elementArr = resultObj[elementUrl];
                elementArr.push(row);
              } 
            }
          });
        });
        
          //What if other urls found a phrase, though not current url?: Let User know in result
        const currUrlArr = resultObj[elementUrl]
        if(!currUrlArr) resultObj[elementUrl] = ['No phrases found.']
      });
    }catch(err) {
      console.log("url Error, Please check inputs")
    }

      //What if no phrases found for all urls?: Let user know in result
    //? make this front end filter, instead?
  if(!Object.keys(resultObj).length) resultObj["Output"] = ["No Jobs Found."];  //output if result empty

  return resultObj;
};

exports.getJobsObj = getJobsObj;