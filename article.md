# Web Scraping with Node.js: A Step-by-Step Guide

Whether aggregating market trends for analysts or simplifying data collection for developers, web scraping, the process of automatically extracting content from websites, plays a crucial role in turning raw data into actionable intelligence. In this tutorial, you'll learn how to scrape dynamic and static web content using [Node.js](https://nodejs.org/en). 

## How to Web Scrape with Node.js

Before starting this tutorial, you'll need to install Node.js and a few libraries. For the complete source code, please check out this [GitHub](https://github.com/ondiekelijah/Web-Scraping-with-Node.js-Guide) repository.

Node.js is an event-driven, non-blocking runtime that efficiently runs JavaScript outside browsers, making it ideal for I/O bound tasks like web scraping.

If you don’t have Node.js installed, refer to the official [Node.js website](https://nodejs.org/en/download/prebuilt-installer) for instructions on how to install it.  

Once Node.js is installed, you need to create a new directory. To do so, open your terminal and run the following:

```bash
mkdir web-scraping-nodejs
```

 Navigate into the newly created directory:

```bash
cd web-scraping-nodejs
```

Initialize your project using [npm](https://docs.npmjs.com/about-npm). The `-y` flag automatically answers "yes" to all prompts, creating a default `package.json` file:

```bash
npm init -y
```

To make HTTP requests to target websites with dynamic content and to parse HTML, you'll need two libraries: [Puppeteer](https://pptr.dev/) and [Cheerio](https://cheerio.js.org/).

Cheerio is an ultra-light, quick, and flexible framework that works with markup parsing. It can parse files in HTML and XML and has an API for navigating and searching the developed data structure. On the other hand, Puppeteer controls web browsers through Node.js. It's asynchronous and slightly slower than Cheerio, but since it evaluates JavaScript, it's capable of scraping dynamic pages.

Use the following command to install the libraries:

```bash
npm install puppeteer cheerio
```

After installation, they will be added to your project's `package.json `file.

Setting up your project directory before writing any code helps you write more organized and manageable code.The folder structure for this tutorial is as follows:

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

## Making HTTP Requests

1. #### Create a New File(src/makeHttpRequest.js)

Create a new folder called `src`, and inside it, a file called `makeHttpRequest.js` in your project directory by running the following command:

```bash
mkdir src
cd src
touch makeHttpRequest.js
```

2. #### Write the Code

Open `src/makeHttpRequest.js` in your code editor and add the following code:

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
      console.log("Response received"); // Log confirmation message of response
    });
  })
  .on("error", (err) => {
    console.log("Error: " + err.message);
  });

```
The script begins by importing modules: The HTTP module makes HTTPS requests. Next, you specify the URL you want to fetch and using `https.get` you send a `GET` request to that URL, gather the data chunks from the response, and log a message indicating the response was received successfully instead of logging the entire response. Finally, log any errors that occur during the request.

3. #### Run the Code

Save the file and run the code using Node.js:

```bash
node src/makeHttpRequest.js
```

You should see something like this in the terminal when you run the code:

```bash
$ node src/makeHttpRequest.js
Response received
```

## Scraping Static HTML Content

Static HTML content is data from webpages that is readily available in HTML and does not change dynamically; hence, it does not require executing JavaScript. In this section, you will learn how to scrap static content from Amazon search results using Cheerio.

### Setting Up Utility Functions (`utils/scrapingUtils.js)`

First, even before you start, you must keep your code clean; hence, you will create utility functions to make the HTTP request, extract the product title, generate the filename, and save all the scraping results into CSV files.

Create a new folder called `utils `inside your project's root folder. Under `utils`, create a file named `scrapingUtils.js` with the following code:

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

In the utility file: `fetchHtmlContent` is a reusable version of the `makeHttpRequest.js`; this utility function will help you make HTTP requests to target URLs and return the response. `createFilename` is a utility function to create unique file names using timestamps and `exportDataToCsv` is a function that saves scraped data to CSV files.

### Write the Scraping Code (`src/scrapeStaticHtml.js`):

In your `scrapeStaticHtml.js` file, add the following code:

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

The script starts by importing the Cheerio library and utility functions (`fetchHtmlContent`, `createFilename`, `exportDataToCsv`) from the `utils` module. Next, using the `fetchHtmlContent` function retrieves the HTML content of the page, and loads it for parsing using Cheerio. It then iterates through each quote item, extracting the text, author, and tags. If both text and author details are present, it adds the quote to the `scrapedQuotes` array. Finally, the `exportDataToCsv` function saves the scraped data to a CSV file while logging the total number of quotes scraped, the filename where the data is saved, and any errors encountered during the process. The last line `scrapeData(targetURL)` is a function call that triggers the execution of the script.

### Run the Code

Save the file and run the code using Node.js:

```bash
node src/scrapeStaticHtml.js
```
You should see a file named "....csv" in your directory, and it should have data similar to: 

```
Text,Author,Tags
"“The world as we have created it is a process of our thinking. It cannot be changed without changing our thinking.”","Albert Einstein","change|deep-thoughts|thinking|world"
"“It is our choices Harry that show what we truly are far more than our abilities.”","J.K. Rowling","abilities|choices"
```

## Scraping Dynamic Web Content

Dynamic web content refers to webpage data generated or updated by JavaScript; hence, one has to run JavaScript to obtain the information. This section will guide you in scraping dynamic content from Amazon search results using Puppeteer, a headless browser automation library.

### Writing the Scraping Code

In the `scrapeDynamicContent.js` file in your project's src folder, add the following code:

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
The script starts by launching a new instance of Puppeteer with specific options. In this case, show the browser when scraping, use the default viewport size, and specify the tmp directory to store user data. Next, a new browser instance opens, and the script navigates to the target URL. Following that, the script enters a loop to scrape multiple pages until there are no more pages to scrape. For each page loop, a quote with text,  author and tags will be added to the quotes array for all the quotes on the page by the script. This cycle continues until the last page is reached by checking if there are any more next buttons on the page. Finally, when scrapping is complete, the `exportDataToCsv` function is called with the array of quotes, storing them in a CSV file.

### Run the Code

Save the file and run the code using Node.js:

```bash
node src/scrapeDynamicContent.js
```

You should see the extracted product details saved to a CSV file and progress logs  like this in the terminal.

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

## Using a Proxy Server

When you access a website, your router's IP address is exposed rather than your device's local IP address. If too many requests are sent within a very short period, websites usually block or rate-limit your IP address.

Using a proxy conceals your identity by displaying the proxy's IP address rather than your actual ISP-assigned one. So, if a website blocks part of your disguised proxy IPs, you can rotate IPs and continue scraping without interruptions.

### Setting Up a Proxy Server

To set up a proxy server in your scraping script, follow these steps:

#### Choosing a Proxy:

You can find free or paid proxies from various online sources. For this tutorial, you can use the following websites to find a list of free proxies:

  - [ProxyNova](https://www.proxynova.com/proxy-server-list/country-th/)

  - [Free Proxy List](https://free-proxy-list.net/)

Once you have selected a proxy, add it to your script. For this example, we’ll use a proxy from the Thailand list on ProxyNova.

![An image showing a list of proxies from ProxyNova](https://i.imgur.com/0kHFDua.png)

#### Integrating the Proxy into Your Puppeteer Script:

You can adjust your Puppeteer script to route requests through the proxy server. Below is an example of how you can modify your script to use a proxy server (`scrapeWithProxy.js`): <br/><br/>

```JavaScript
const puppeteer = require("puppeteer");
// List of proxy servers - you can add more working proxies here
const proxyList = ["49.228.131.169:5000"];
// Select a random proxy from the list
const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
(async () => {
// Launch Puppeteer with the selected proxy server
const browser = await puppeteer.launch({
  headless: false, // Set to true to run in headless mode
  defaultViewport: null, // Set the default viewport
  args: [`--proxy-server=${randomProxy}`], // Apply the proxy server
});
const page = await browser.newPage(); // Open a new page in the browser
// Navigate to the test URL to check the IP address
await page.goto(
  "http://httpbin.org/ip",
  { waitUntil: "domcontentloaded" } // Wait until page is loaded
);
// Take a screenshot to verify the proxy is working
await page.screenshot({ path: "proxy.png" });
await browser.close(); // Close the browser instance
})();
```

In the script example above, any random proxy from a list of available proxies is picked, and a Puppeteer browser instance is started with that proxy. Afterwards, it visits the specified URL, waits a bit, takes a screenshot, and closes this browser instance.

#### Run the Code

Save the file and run the code using Node.js:

```bash
node src/scrapeWithProxy.js
```

When the code runs successfully, a screenshot, "proxy.png," is saved to your project's directory. It contains the results from visiting the URL `http://httpbin.org/ip,` which displays the requester's IP Address. In this case, it should be the proxy’s IP, confirming the proxy is working.

> Note: When a proxy is not working correctly, you get an error like:

```
Error: net::ERR_TIMED_OUT at http://httpbin.org/ip
ERR_TUNNEL_CONNECTION_FAILED at http://httpbin.org/ip
ERR_PROXY_CONNECTION_FAILED at http://httpbin.org/ip
```

The error means the proxy server is unavailable, overloaded, or unresponsive. Select another proxy from your list to resolve this issue.

## Handling RECAPTCHAs and Ethical Considerations in Web Scraping

Today, websites implement challenges like RECAPTCHAs to identify humans and bots and prevent activities that could violate their terms of service.

### RECAPTCHAs Problems

**Scraping Intermittence:**

RECAPTCHAs can interrupt scrapes by making automated scripts wait until the challenge is solved.

**More Complexity:**

Solving RECAPTCHAs makes your script more complex.

**Possible IP-Blocking:**

When too many RECAPTCHAs are triggered, the website flags you, restricting or limiting the traffic originating from your IP address.

### How to Avoid RECAPTCHA Problems

**Use Proxies:**

Rotate proxies to make requests from different IPs, reducing the chances of having a RECAPTCHA enqueued.

**Introduce Delays:**

Introduce random delays between requests and make the scraper sleep for random times to avoid getting detected.

**Use browser automation:**

Tools like Puppeteer can simulate fundamental user interactions, which might get around some easier RECAPTCHAs.

**Captcha-solving services:**

Use third-party services that have automatised CAPTCHA solvers, but also be cautious about ethical and legal risks.

**Non-intrusive scraping**

Scrape less-protected pages of the target website that will not be served with a RECAPTCHA.

### Ethical Considerations and Legal Compliance

**Respect the Website's Terms of Service:**

Check the Website's Terms of Service and the robots.txt file for allowance of scraping. In the case of a prohibition, seek permission or alternative means.

 **Avoid Scraping Personal/Sensitive Data:**

Scrape no personal/sensitive data to avoid breaching privacy laws like the GDPR.

**Do Not Send Too Many Requests:**

Be friendly and lower the frequency of requests so that you do not flood their servers with a stream of requests, which may cause RECAPTCHAs.

**Use APIs If Possible:**

Use available APIs for structured and ethical scraping.

# Conclusion

You extracted information from Amazon, including some simple HTML and JavaScript content, using Cheerio and Puppeteer. You also learned how to work with the proxy servers to bypass common web scraping issues, which include IP banning or rate limit restrictions. Using proxies works wonderfully in keeping your scraping activities stable and uninterrupted. Play around with different proxy solutions to maximize your scrape potential while ensuring everything is on the ethical clock.
