# Web Scraping with Node.js: A Step-by-Step Guide

Whether aggregating market trends or simplifying data collection, web scraping, which is the process of automatically extracting content from websites, plays a crucial role in turning raw data into actionable intelligence. In this tutorial, you'll learn how to scrape dynamic and static web content using [Node.js](https://nodejs.org/en). 

## How to Web Scrape with Node.js

Before starting this tutorial, you'll need to install Node.js and a few libraries. Node.js is an event-driven, non-blocking runtime that runs JavaScript outside browsers, making it ideal for I/O bound tasks like web scraping.

If you don't have Node.js installed, you can refer to the official [documentation](https://nodejs.org/en/download/prebuilt-installer) for more information.  

Once Node.js is installed, you need to create a new directory. Open your terminal and run the following:

```bash
mkdir web-scraping-nodejs
```

 Navigate into the newly created directory:

```bash
cd web-scraping-nodejs
```

Then, initialize your project using [npm](https://docs.npmjs.com/about-npm):

```bash
npm init -y
```

The `-y` flag automatically answers "yes" to all prompts, creating a default `package.json` file

To make HTTP requests to target websites with dynamic content and to parse HTML, you'll need two libraries: [Puppeteer](https://pptr.dev/) and [Cheerio](https://cheerio.js.org/).

Cheerio is an ultra-light, quick, and flexible framework that works with markup parsing. It can parse files in HTML and XML and has an API for navigating and searching the developed data structure. On the other hand, Puppeteer controls web browsers through Node.js. It's asynchronous and slightly slower than Cheerio, but since it evaluates JavaScript, it can scrap dynamic pages.

Use the following command to install the libraries:

```bash
npm install puppeteer cheerio
```

After installation, they'll be added to your project's `package.json `file.

Setting up your project directory is recommended as it helps you write more organized and manageable code. The folder structure for this tutorial looks like this:

```bash
/web-scraping-nodejs
|-- /data
|-- /node_modules
|-- /src
|   |-- makeHttpRequest.js
|   |-- scrapeDynamicHtml.js
|   |-- scrapeStaticHtml.js
|   |-- scrapeWithProxy.js
|-- /utils
|   |-- scrapingUtils.js
|-- package-lock.json
|-- package.json
```

### Make HTTP Requests

Inside your project directory, create a new folder named `src`, and inside it, create a `makeHttpRequest.js` file in your project directory by running the following command:

```bash
mkdir src
cd src
touch makeHttpRequest.js
```

Then, open `src/makeHttpRequest.js` in your code editor and add the following code:

```JavaScript
const https = require("https"); // Import the https module

const url = "https://quotes.toscrape.com/"; // URL to fetch

https
  .get(url, (res) => {
    let data = "";

    // Collect data chunks
    res.on("data", (chunk) => {
      data += chunk;
    });

    // Handle the end of the data
    res.on("end", () => {
      // console.log(data); // Log the data
    });
  })
  .on("error", (err) => {
    console.log("Error: " + err.message);
  });

```

This script begins by importing the `https` module: The HTTP module makes HTTPS requests. You specify the URL you want to fetch, then you use `https.get` to send a `GET` request to that URL, gather the data chunks from the response, and log a message indicating the response was received successfully instead of logging the entire response. Finally, the code logs to the console any errors that occur during the request.

Save the file and run the code using Node.js:

```bash
node src/makeHttpRequest.js
```

You should see something like this in your terminal:

```bash
$ node src/makeHttpRequest.js
<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="UTF-8">
        <title>Quotes to Scrape</title>
    <link rel="stylesheet" href="/static/bootstrap.min.css">
    <link rel="stylesheet" href="/static/main.css">
</head>
<body>
    <div class="container">
        <div class="row header-box">
            <div class="col-md-8">
                <h1>
                    <a href="/" style="text-decoration: none">Quotes to Scrape</a>
                </h1>
            </div>
            <div class="col-md-4">
                <p>

                    <a href="/login">Login</a>

                </p>
            </div>
        </div>
...omitted output...
```

### Scrape Static HTML Content

Static HTML content is data that's readily available in HTML and does not change dynamically. In this section, you'll learn how to scrape static content from [quotes.toscrape.com](https://quotes.toscrape.com/)  using Cheerio.

To help keep your code clean, you need to create utility functions to make the HTTP request, extract the product title, generate the filename, and save all the scraping results into CSV files. By having the utility functions separately, you keep your code DRY(Don't Repeat Yourself), improve readability, and make your code easier to debug and maintain.

Create a new folder called `utils `inside your project's root folder and in `utils`, create a file named `scrapingUtils.js` with the following code:

```JavaScript
const fs = require("fs");
const https = require("https");

const fetchHtmlContent = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "Accept-Language": "en-US,en;q=0.9",
          },
        },
        (response) => {
          let htmlData = "";

          response.on("data", (chunk) => {
            htmlData += chunk;
          });

          response.on("end", () => {
            resolve(htmlData);
          });

          response.on("error", (err) => {
            reject(err);
          });
        }
      )
      .on("error", (err) => {
        reject(err);
      });
  });
};

const createFilename = () => {
  const date = new Date();
  const filename = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`;
  return filename;
};

const exportDataToCsv = (quotes) => {
  const filename = createFilename();
  let csvContent = "Text,Author,Tags\n";

  quotes.forEach(({ text, author, tags }) => {
    const sanitizedText = text.replace(/,/g, "");
    const sanitizedTags = tags.join("|"); // Join tags with a pipe separator
    csvContent += `"${sanitizedText}","${author}","${sanitizedTags}"\n`;
  });

  const folder = "data";
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  fs.writeFileSync(`${folder}/${filename}`, csvContent);
  return `./${folder}/${filename}`;
};

module.exports = {
  createFilename,
  exportDataToCsv,
  fetchHtmlContent,
};

```

In the utility file, `fetchHtmlContent` is a re-usable version of `makeHttpRequest.js`. This utility function helps make HTTP requests to specified URLs using the built-in 'https' module and returns the response. Since it's asynchronous, it returns a promise. It also includes the headers User-Agent and Accept-Language, making the request look like it is coming from a browser to avoid anti-scraping strategies. It then stores this received data inside the variable `htmlData`. The promise will resolve with the full HTML content once all data is obtained and the `response.on("end")` event is triggered. If there is any error in the request, the promise is rejected, and the calling function can handle the errors.


`createFilename` creates unique file names using timestamps. Using JavaScript's Date object, it captures the current date and time and then formats it into a string (e.g., 2024-8-23-14-30-15.csv), which is then returned as the filename.

`exportDataToCsv` writes scraped data into CSV files. First, it generates a filename using `createFilename()`. Then, it initializes the CSV content with a header row consisting of Text, Author, Tags. It sanitizes the text for each quote in the quotes array, which is expected to have text, author, and tag properties, by removing the commas and joining tags with a pipe separator. It builds the content of the CSV row by row. Finally, it saves the data to a file within the data folder, creating one if it does not exist. The content is written to the file using `fs.writeFileSync`.


Next, in your `scrapeStaticHtml.js` file, add the following code:

```JavaScript
const cheerio = require("cheerio");
const {
  fetchHtmlContent,
  createFilename,
  exportDataToCsv,
} = require("../utils/scrapingUtils");

const targetURL = "https://quotes.toscrape.com/";

const scrapeData = async (targetURL) => {
  try {
    const htmlContent = await fetchHtmlContent(targetURL);
    const $ = cheerio.load(htmlContent);
    const scrapedQuotes = [];

    $(".quote").each((i, element) => {
      const quoteElement = $(element);
      const text = quoteElement.find(".text").text();
      const author = quoteElement.find(".author").text();
      const tags = [];
      quoteElement.find(".tags .tag").each((j, tagElement) => {
        tags.push($(tagElement).text());
      });

      if (text && author) {
        scrapedQuotes.push({ text, author, tags });
      }
    });

    exportDataToCsv(scrapedQuotes);

    console.log({
      total_quotes: scrapedQuotes.length,
      status: "Scraping completed successfully!",
      saved_file: createFilename(),
    });
  } catch (error) {
    console.error({
      status: "😱 Oops! Something went wrong during scraping.",
      details: error.message,
    });
    process.exit(1);
  }
};

// Call the scrapeData function with the URL
scrapeData(targetURL);
```

This script starts by importing the Cheerio library and utility functions (`fetchHtmlContent`, `createFilename`, and `exportDataToCsv`) from the `utils` module. Next, using the `fetchHtmlContent` function the script retrieves the HTML content of the page, and loads it for parsing using Cheerio. It then iterates through each quote item, extracting the text, author, and tags. If both text and author details are present, it adds the quote to the `scrapedQuotes` array. Finally, the `exportDataToCsv` function saves the scraped data to a CSV file while logging the total number of quotes scraped, the filename where the data is saved, and any errors encountered during the process. The last line triggers the execution of the script.

Save the file and run the code using Node.js:

```bash
node src/scrapeStaticHtml.js
```

You should see a file named `"....csv"` in your directory, and it should look like this: 

```
Text,Author,Tags
"“The world as we have created it is a process of our thinking. It cannot be changed without changing our thinking.”","Albert Einstein","change|deep-thoughts|thinking|world"
"“It is our choices Harry that show what we truly are far more than our abilities.”","J.K. Rowling","abilities|choices"
```

### Scraping Dynamic Web Content

Dynamic web content refers to data that's generated or updated by JavaScript which means you have to run JavaScript to obtain the information. This section will guide you in scraping dynamic content from [quotes.toscrape.com](https://quotes.toscrape.com/js/) using Puppeteer, a headless browser automation library.

To scrape dynamic data, navigate into the `scrapeDynamicContent.js` file in your project's `src` folder, and add the following code:

```JavaScript
const puppeteer = require("puppeteer");
const { exportDataToCsv } = require("../utils/scrapingUtils");

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true to run in headless mode
    defaultViewport: null,
    userDataDir: "./tmp", // Save browser session data to the tmp folder
  });
  const page = await browser.newPage();

  await page.goto("https://quotes.toscrape.com/js/page/1/"); // URL to scrape

  let isLastPage = false;
  const quotes = [];

  // Function to extract quote details
  const extractQuoteDetails = async (quoteElement) => {
    const text = await page.evaluate((el) => {
      const textElement = el.querySelector(".text"); // Get the quote text element
      return textElement ? textElement.textContent : null;
    }, quoteElement);
  
    const author = await page.evaluate((el) => {
      const authorElement = el.querySelector(".author"); // Get the author element
      return authorElement ? authorElement.textContent : null;
    }, quoteElement);
  
    const tags = await page.evaluate((el) => {
      const tagElements = el.querySelectorAll(".tag"); // Get all tag elements
      return Array.from(tagElements).map(tag => tag.textContent);
    }, quoteElement);
  
    return { text: text, author, tags };
  };

  while (!isLastPage) { // Loop through all pages until the last page
    await page.waitForSelector(".quote"); // Ensure quote elements are loaded
    const quoteHandles = await page.$$(".quote");
  
    for (const quoteElement of quoteHandles) {
      try {
        const quoteDetails = await extractQuoteDetails(quoteElement);
        const { text, author } = quoteDetails; // Extract text and author from quote details
  
        if (text && author) {
          quotes.push(quoteDetails);
        }
      } catch (error) {
        console.error("Error extracting quote details:", error);
      }
    }
  
    const nextButton = await page.$("li.next > a");
    isLastPage = !nextButton;
    console.log("Is Last Page:", isLastPage);
  
    if (!isLastPage) { // If not the last page, click the next button
      await Promise.all([
        nextButton.click(), // Click the next page button
        page.waitForNavigation({
          waitUntil: "networkidle2", // Wait for the next page to be fully loaded
        }),
      ]);
    }
  }
  
  // Export all collected quotes to CSV after the scraping loop completes
  console.log("Total quotes scraped:", quotes.length);
  exportDataToCsv(quotes); // Export quotes to CSV file

  await browser.close();
})();
```
This script starts by launching a new instance of Puppeteer with specific options. With `headless: false`, the browser will be visible on the screen while scraping, use the default viewport size, and specify the `tmp` directory to store user data. Next, a new browser instance opens, and the script navigates to the target URL. Following that, the script enters a loop to scrape multiple pages until there are no more pages to scrape. For each page loop, a quote with text, author, and tags is added to the quotes array for all the quotes on the page by the script. This cycle continues until the last page is reached by checking if there are any more next buttons on the page. 

When the scrapping is complete, the `exportDataToCsv` function is called, and the array of quotes is stored in a CSV file.

Save the file and run the code using Node.js:

```bash
node src/scrapeDynamicContent.js
```

The extracted product details are saved to a CSV file and the progress logs will be like this in the terminal:

```bash
$ node src/scrapeDynamicContent.js
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: true
Total quotes scraped: 100
```

## How to Use a Proxy Server

When scraping websites for data, you might often encounter problems where your IP address is temporarily blocked or restricted. This can easily happen because the website will detect when too many requests originate from the same IP address within a very short period, thus indicating automated activity.

This can be avoided by using a proxy server. A proxy server acts as a middleman between your device and the websites that you visit. It masks your actual IP address with the IP address of the proxy server, concealing your identity. Instead of blocking your actual IP, it blocks that of the proxy server.

If a website blocks one of your proxy's IP addresses, you can switch to another IP and continue data scraping without interruptions.

### Set Up a Proxy Server

To set up a proxy server, you first need to select one. Both free and paid proxies are available from various sources. 

For this tutorial, we'll use a proxy from [Bright Data](https://brightdata.com/). If you haven’t yet signed up for Bright Data, you can sign up for a free 30-day trial. When adding your payment method, you’ll receive a $5 credit to get you started.

#### Integrate the Proxy into Your Puppeteer Script

Once you've signed up and verified your account, follow the [quick start guide](https://docs.brightdata.com/scraping-automation/scraping-browser/quickstart#enter-proxy-name-for-your-new-scraping-browser) on how to set up a scraping browser. Grab your username and password credentials once you have created a new zone. You can find them in the Scraping Browser zone you just created.

Following is an example of how you can modify your script to use a proxy server: 

```JavaScript
const puppeteer = require("puppeteer");
const { exportDataToCsv } = require("../utils/scrapingUtils");

// Enter your zone name and password below
const AUTH = 'USER:PASS';  
const SBR_WS_ENDPOINT = `wss://${AUTH}@brd.superproxy.io:9222`;

(async () => {
  // First session to verify proxy
  let browser = await puppeteer.connect({
    browserWSEndpoint: SBR_WS_ENDPOINT,
  });
  let page = await browser.newPage();

  await page.goto("http://httpbin.org/ip", { waitUntil: "domcontentloaded" });
  let proxyIp = await page.evaluate(() => document.body.innerText);
  console.log("Using Proxy IP:", proxyIp);

  await browser.close();

  // Second session for actual scraping
  browser = await puppeteer.connect({
    browserWSEndpoint: SBR_WS_ENDPOINT,
  });
  page = await browser.newPage();

  await page.goto("https://quotes.toscrape.com/js/page/1/", {
    waitUntil: "domcontentloaded",
  });

  let isLastPage = false;
  const quotes = [];

  // Function to extract quote details
  const extractQuoteDetails = async (quoteElement) => {
    const text = await page.evaluate((el) => {
      const textElement = el.querySelector(".text");
      return textElement ? textElement.textContent : null;
    }, quoteElement);

    const author = await page.evaluate((el) => {
      const authorElement = el.querySelector(".author");
      return authorElement ? authorElement.textContent : null;
    }, quoteElement);

    const tags = await page.evaluate((el) => {
      const tagElements = el.querySelectorAll(".tag");
      return Array.from(tagElements).map((tag) => tag.textContent);
    }, quoteElement);

    return { text, author, tags };
  };

  while (!isLastPage) {
    await page.waitForSelector(".quote");
    const quoteHandles = await page.$$(".quote");

    for (const quoteElement of quoteHandles) {
      try {
        const quoteDetails = await extractQuoteDetails(quoteElement);
        const { text, author } = quoteDetails;

        if (text && author) {
          quotes.push(quoteDetails);
        }
      } catch (error) {
        console.error("Error extracting quote details:", error);
      }
    }

    const nextButton = await page.$("li.next > a");
    isLastPage = !nextButton;
    console.log("Is Last Page:", isLastPage);

    if (!isLastPage) {
      await Promise.all([
        nextButton.click(),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);
    }
  }

  console.log("Total quotes scraped:", quotes.length);
  exportDataToCsv(quotes);

  await browser.close();
})();
```

This script will create a proxy by connecting to a proxy server using Puppeteer's `connect` method and the WebSocket endpoint from Bright Data, ensuring every request goes through the proxy.

First, a session is opened to check the validation of the proxy connection. This visits `http://httpbin.org/ip` to check and log the proxy's IP address to confirm that requests are routed via the proxy correctly. After this verification, another session will be opened for scraping, starting with a fresh navigation to the site—`https://quotes.toscrape.com/js/page/1/`. 

According to Bright Data, Scraping browser sessions allow one initial navigation per session, loading the target site for data extraction, after which the user will be free to navigate the site. However, a new scraping job against the same or any other site shall open in a new session.

Save the file and run the code:

```bash
node src/scrapeWithProxy.js
```

When the code runs successfully, you should see logs similar to this in your terminal:

```bash
Using Proxy IP: {
  "origin": "103.204.214.89"
}

Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: false
Is Last Page: true
Total quotes scraped: 100
```

When a proxy is not working correctly, you'll get an error like this:

```
Error: net::ERR_TIMED_OUT at http://httpbin.org/ip
ERR_TUNNEL_CONNECTION_FAILED at http://httpbin.org/ip
ERR_PROXY_CONNECTION_FAILED at http://httpbin.org/ip
```

This error indicates that the proxy server is unavailable, overloaded, or unresponsive. To resolve this issue, you can select another proxy from your list.

All the source code for this tutorial can be found in this [GitHub](https://github.com/ondiekelijah/Web-Scraping-with-Node.js-Guide) repository.

## How to Handle reCAPTCHAs 

Today, websites implement challenges like reCAPTCHAs to identify human activities and prevent those that could violate their terms of service.

One of the most common problems in web scraping is scraping intermittence because of reCAPTCHAs. These are security measures intended to prevent automated scripts, add complexity to the script, and involve extra handling by adding a set of challenges to be solved before the scraping resumes. If your scraping activities trigger several reCAPTCHAs, the website may flag your IP address, which could result in IP blocking and limitations on your access to the site.

Various strategies can be put in place to help overcome these limitations. First is using proxies, which mask the IP address from which requests come, lowering the possibility of reCAPTCHAs being triggered. You can also introduce random delays between requests to make your scraper more human-like regarding its behavior. This can eventually reduce the risk of detection. Another helpful approach is with browser automation tools, such as Puppeteer, which can emulate user events and sometimes even bypass simpler reCAPTCHAs. You may also consider using third-party CAPTCHA-solving services, but you must know the ethical and legal considerations here. Finally, focusing on scraping less-protected sections of the target website will help you avoid reCAPTCHAs, as these pages are less likely to use strict anti-scraping methods.

With these methods applied, you can reduce the effect of reCAPTCHAs on your scraping activities and smooth the data extraction process.

### Ethical Considerations and Legal Compliance

With any web scraping project, always respect a website's Terms of Service to ensure that your actions are ethical and legal.

Additionally, avoid scraping personal data and limit request frequency to prevent server overload. 

Finally, make sure you use APIs whenever possible for ethical scraping.

## Conclusion

Now that you have learned how to extract information from websites using Cheerio and Puppeteer, you can go a step further and find a way not to have issues with scraping in the form of IP banning or rate limit restrictions. Effectively using proxies helps keep your scraping activities stable and uninterrupted.

From here, explore a wide range of proxy solutions created exclusively for web scraping in Node.js. You can experiment with these options to find out which one will work best for your needs, all while making sure that all your scraping activities are ethical and come under the terms and conditions of the target website. 
