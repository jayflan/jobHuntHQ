<h1 align="center">
    jobHuntHQ
  <br>
</h1>

<h4 align="center">
  A simple webscraper tool for company career webpages
</h4>

<p align="center">
  <a href="#key-features">Key Features</a>
  <span>-
  </span>
  <a href="#how-to-use">How To Use</a>
</p>

<div>
  <img width="100%" src="https://res.cloudinary.com/ddovrx7xl/image/upload/v1678200402/jobhunt_home_rnepkq.png"/>
</div>

<div>
  <img width="100%" src="https://res.cloudinary.com/ddovrx7xl/image/upload/v1678200402/jobhunt_output_upqyxl.png"/>
</div>

## Key Features

- When looking for job postings, can go straight to the source 
- Search more than one site
- Input multiple search phrases at one time
- Input multiple company career-page urls at one time
- Output includes the link back to each career-page
- Backend code setup for Node Server or AWS Lambda Serverless (AWS-Serverless-Express library)
- AWS Lambda deploy/uploading simplified via ClaudiaJS library
- Scraper waits for web-page Javascript output via the Puppeteer library

## How To Use

1. Fork and clone repo
2. `npm install`
3. Configure backend-code to use Node/Express or AWS-Lambda (Or convert to your flavor of serverless function)
4. `npm run start-server`
