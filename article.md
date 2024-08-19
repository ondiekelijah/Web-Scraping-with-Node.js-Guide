# Introduction<a id="introduction"></a>

Millions of data are published daily—data that could shape the future. But how do you capture it all? Web scraping, the process of using bots to extract content and data from a website, is the key. It transforms the endless web into a rich intelligence source, helping you stay informed and ahead in the digital world.

Whether aggregating market trends for analysts or simplifying data collection for developers, web scraping plays a crucial role in turning raw data into actionable intelligence.

This article will teach you how to scrape web content using Node.js, targeting static and dynamic elements. You'll start by developing a scraping tool for collecting data from the Amazon website and later store the data in a CSV file for analysis. Additionally, you'll learn how to set up a proxy server to bypass common obstacles—such as IP blocking and rate limitations—making your data collection more efficient and reliable.

# Implementing Web Scraping with Node.js<a id="implementing-web-scraping-with-nodejs"></a>

Specific steps guide Node.js web scraping of a site's data. This section will explain these steps in practical examples.

## Prerequisites<a id="prerequisites"></a>

First things first: Before you can start scraping, install Node.js and the needed libraries to set up your environment.

### Setting up the Environment<a id="setting-up-the-environment"></a>

1. #### Install Node.js<a id="install-nodejs"></a>

   NodeJS is a runtime environment to run Javascript outside of web browsers. One characteristic that makes it suitable for this guide is that it is event-driven and powered with an I/O non-blocking model; it can efficiently execute I/O-bound tasks like web scraping.<br/><br/>

   If you don’t have Node.js installed, go to the official [Node.js website](https://nodejs.org/en/download/prebuilt-installer), download the prebuilt installer for your operating system, and follow the steps provided to install it.

2. #### Initialize a Node.js Project<a id="initialize-a-nodejs-project"></a>

   ##### Step 1: Create a New Directory<a id="step-1-create-a-new-directory"></a>

   Open your terminal and run:

   ```bash
   mkdir web-scraping-nodejs
   ```

   ##### Step 2: Navigate to the Project Directory<a id="step-2-navigate-to-the-project-directory"></a>

   Change your current directory to the newly created one:

   ```bash
    cd web-scraping-nodejs
   ```

   ##### Step 3: Initialize the Node.js Project<a id="step-3-initialize-the-nodejs-project"></a>

   Initialize your project using npm. The -y flag automatically answers "yes" to all prompts, creating a default `package.json` file:

   ```bash
   npm init -y
   ```

   3. #### Install Necessary Libraries<a id="install-necessary-libraries"></a>

   You must have the Puppeteer and Cheerio libraries to make HTTP requests to target websites with dynamic content and parse HTML.<br/><br/>

   Cheerio is an ultra-light, quick, and flexible framework that works with markup parsing. It can parse files in HTML and XML and has an API for navigating and searching the developed data structure.<br/><br/>

   Another tool for automating the browser is Puppeteer, which controls web browsers through Node.js. It's asynchronous and slightly slower than Cheerio. Since it evaluates JavaScript, it is capable of scraping dynamic pages.

   ```bash
   npm install puppeteer cheerio
   ```

   This command will install the two libraries we need. After installation, they will be added to your project's `package.json `file.

   4. #### Project structure<a id="project-structure"></a>

   Setting up your project directory before writing any code will help you write more organized and manageable code. The folder structure for this tutorial is as follows:

   ```bash
       /web-scraping-nodejs
       |-- /data
       |-- /node_modules
       |-- /src
       |   |-- makeHttpRequest.js
       |   |-- scrapeDynamicHtml.js
       |   |-- scrapeStaticHtml.js
       |   |-- scrapeWithProxy.js
       |-- /utils
       |   |-- scrapingUtils.js
       |-- package-lock.json
       |-- package.json
   ```

## Making HTTP Requests<a id="making-http-requests"></a>

Accessing content on the Internet typically involves your browser making HTTP requests to web servers to request a resource. The server then responds with the requested resource. The process involves several steps: establishing a connection, sending a request, and handling the response. You will learn the principles of HTTP requests and break down the request-response sequence into clear and numbered steps to provide a clearer understanding.

![A diagram showing the http request-response cycle](https://i.imgur.com/vArItwh.png)

<p style="text-align: center;">The http request-response cycle</p>

### What is HTTP? <a id="what-is-http"></a>

HyperText Transfer Protocol (HTTP) is a set of rules that defines how resources are requested and how responses are transferred between devices networked on the World Wide Web. The main components involved are an HTTP client—better known as a browser—and an HTTP server.

Let’s understand how HTTP requests work, as illustrated in the diagram. Each step corresponds to a segment of the response sequence to help you visualize the flow between the client and server.

1. #### Initiate HTTPS Request:<a id="initiate-https-request"></a>

The process starts when you type an address such as [www.amazon.com](http://www.amazon.com) into your browser, instructing it to open a TCP channel to the server that responds to the URL(or Uniform Resource Locator).

2. #### Domain Resolution:<a id="domain-resolution"></a>

Web servers are identified using IP addresses, which are unique across devices on the internet. Since IP addresses are hard to remember, domain names or URLs are used to map the IPs through a process called DNS (Domain Name System) resolution.

3. #### Return IP Address:<a id="return-ip-address"></a>

When you request access to Amazon’s web page, the browser strips `https `from `“https://www.amazon.com`” as the protocol, then the domain name `“amazon.com”` and queries the DNS resolver for the IP address.

4. #### Begin TLS Handshake:<a id="begin-tls-handshake"></a>

At this point, the client knows the destination IP address and, using the HTTP protocol, opens a connection to the server at the IP address returned by the DNS resolver.

5. #### Establish Secure Connection:<a id="establish-secure-connection"></a>

For a successful handshake, the client and the server exchange cryptographic keys to create a secure link. In the process, they verify each other's identities. A secure connection channel is created, and information will be exchanged upon completion.

6. #### Send HTTPS Request:<a id="send-https-request"></a>

Once a secure communication channel is created, your browser will send a GET request to the server; along with the request, the client may include necessary headers needed by the server.

7. #### Process Client Request:<a id="process-client-request"></a>

Upon receiving the request, the server processes the request, which may involve reading the database or other server-side operations.

8. #### Generate HTTPS Response:<a id="generate-https-response"></a>

When request processing is complete, the server responds with the requested resource and relevant HTTP headers. Sometimes, when the response is too large, it may be compressed to reduce size.

9. #### Process and render response:<a id="process-and-render-response"></a>

When the client receives the response, it may perform checks like confirming if the data is compressed by checking for the specifications in the headers, such as Content-Encoding, to know how to decode the representation to obtain the original payload format.

10. #### Render page:<a id="render-page"></a>

Finally, the client processes and displays the response data to the user.

### HTTP Requests Using the Built-In `https `Module<a id="http-requests-using-the-built-in-https-module"></a>

1. #### Create a New File(`src/makeHttpRequest.js`)<a id="create-a-new-filesrcmakehttprequestjs"></a>

Create a new folder called `src`, and inside it, a file called `makeHttpRequest.js` in your project directory by running the following command:

```bash
mkdir src
cd src
touch makeHttpRequest.js
```

2. #### Write the Code<a id="write-the-code"></a>

Open `src/makeHttpRequest.js` in your code editor and add the following code:

```JavaScript
const https = require("https"); // Import the https module
const zlib = require("zlib"); // Import the zlib module for decompression


const url = "https://www.amazon.com"; // URL to fetch


https
  .get(url, (res) => {
    const encoding = res.headers["content-encoding"]; // Get the encoding type
    console.log("encoding: ", encoding);
    let stream = res;

    // Handle different encodings
    if (encoding === "gzip") {
      stream = res.pipe(zlib.createGunzip());
    } else if (encoding === "deflate") {
      stream = res.pipe(zlib.createInflate());
    }

    let data = "";

    // Collect data chunks
    stream.on("data", (chunk) => {
      data += chunk;
    });

    // Handle the end of the data
    stream.on("end", () => {
      //   console.log(data); // Log the data
      console.log("Response received"); // Log confirmation message of response
    });
  })
  .on("error", (err) => {
    console.log("Error: " + err.message);
  });
```

3. #### Run the Code<a id="run-the-code"></a>

Save the file and run the code using Node.js:

```bash
node src/makeHttpRequest.js
```

You should see something like this in the terminal when you run the code:

```bash
$ node src/makeHttpRequest.js
encoding:  gzip
Response received
```

#### How It Works:<a id="how-it-works"></a>

1. **Import Modules:** The HTTP module makes HTTPS requests, and the `zlib` module handles compressed responses.

2. **Specify the URL you want to fetch.**

3. **Make HTTPS Request:** Use `https.get` to send a GET request to the specified URL.

4. **Handle Compression:** Check the Content-Encoding header to determine if the response is compressed. If it is, decompress the data using `zlib`.

5. **Log Encoding Type:** Print the encoding type of the response to the console.

6. **Collect Data:** Gather the data chunks from the response.

7. **Log Confirmation:** Instead of logging the entire response, log a message indicating the response was received successfully.

8. **Error Handling:** Log any errors that occur during the request.

## Scraping Static HTML Content<a id="scraping-static-html-content"></a>

Static HTML content is data from webpages that is readily available in HTML and does not change dynamically; hence, it does not require executing JavaScript. In this section, you will learn how to scrap static content from Amazon search results using Cheerio.

1. ### Setting Up Utility Functions (`utils/scrapingUtils.js)`<a id="setting-up-utility-functions-utilsscrapingutilsjs"></a>

First, even before you start, you must keep your code clean; hence, you will create utility functions to make the HTTP request, extract the product title, generate the filename, and save all the scraping results into CSV files.

Create a new folder called `utils `inside your project's root folder. Under `utils`, create a file named `scrapingUtils.js` with the following code:

```JavaScript
const fs = require("fs");
const https = require("https");
const zlib = require("zlib");

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
          const encoding = response.headers["content-encoding"];
          let stream = response;

          if (encoding === "gzip") {
            stream = response.pipe(zlib.createGunzip());
          } else if (encoding === "deflate") {
            stream = response.pipe(zlib.createInflate());
          }

          let htmlData = "";

          stream.on("data", (chunk) => {
            htmlData += chunk;
          });

          stream.on("end", () => {
            resolve(htmlData);
          });

          stream.on("error", (err) => {
            reject(err);
          });
        }
      )
      .on("error", (err) => {
        reject(err);
      });
  });
};

const extractTitle = (productElement, imageUrl) => {
  const title = productElement
    .find(".a-size-medium.a-color-base.a-text-normal")
    .text();
  if (!title) {
    const urlSegment = imageUrl;
    if (typeof urlSegment === "string") {
      const strippedUrlSegment = urlSegment.split("/")[1];
      const formattedTitle = strippedUrlSegment.replace(/-/g, " ");
      return formattedTitle;
    }
  }
  return title;
};

const createFilename = () => {
  const date = new Date();
  const filename = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`;
  return filename;
};

const exportProductsToCsv = (products) => {
  const filename = createFilename();
  let csvContent = "Title,Price,ImageURL\n";

  products.forEach(({ productTitle, totalPrice, imageUrl }) => {
    const sanitizedTitle = productTitle.replace(/,/g, "");
    csvContent += `${sanitizedTitle},${totalPrice},${imageUrl}\n`;
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
  exportProductsToCsv,
  extractTitle,
  fetchHtmlContent,
};

```

In the utility file:

- `fetchHtmlContent:` A reusable version of `makeHttpRequest.js, `this utility function will help us make HTTP requests to target URLs and return the response.

- `extractTitle:` a utility function to extract and generate product titles.

- `createFilename:` a utility function to create unique file names using timestamps.

- `exportProductsToCsv:` a function that saves scraped products to CSV files.

2. ### Write the Scraping Code (`src/scrapeStaticHtml.js`):<a id="write-the-scraping-code-srcscrapestatichtmljs"></a>

In your `scrapeStaticHtml.js` file, add the following code:

```JavaScript
const cheerio = require("cheerio");
const {
  fetchHtmlContent,
  createFilename,
  exportProductsToCsv,
  extractTitle,
} = require("../utils/scrapingUtils");

const amazonBaseUrl = "https://www.amazon.com";
const searchUrl = "https://www.amazon.com/s?k=all+headphones";

const scrapeAmazonProducts = async (searchUrl) => {
  if (!searchUrl.includes(amazonBaseUrl)) {
    console.log(
      "Invalid URL. This address is not on the map, even Google couldn't find it."
    );
    process.exit(1);
  }

  try {
    const htmlContent = await fetchHtmlContent(searchUrl);
    const $ = cheerio.load(htmlContent);
    const scrapedProducts = [];

    $(".s-result-item").each((i, element) => {
      const productElement = $(element);
      const wholePrice = productElement.find(".a-price-whole").text();
      const fractionalPrice = productElement.find(".a-price-fraction").text();
      const totalPrice = wholePrice + fractionalPrice;
      const imageUrl = productElement
        .find(".a-section.aok-relative.s-image-fixed-height img.s-image")
        .attr("src");
      const productTitle = extractTitle(productElement, imageUrl);

      if (productTitle && totalPrice && imageUrl) {
        scrapedProducts.push({ productTitle, totalPrice, imageUrl });
      }
    });

    exportProductsToCsv(scrapedProducts);

    console.log({
      total_products: scrapedProducts.length,
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

// Call the scrapeAmazonProducts function with the URL
scrapeAmazonProducts(searchUrl);
```

#### How It Works:<a id="how-it-works-1"></a>

Let's go through the script step-by-step:

1. **Dependencies and Utilities**:

The script starts by importing the Cheerio library and utility functions (`fetchHtmlContent`, `createFilename`, `exportProductsToCsv`, `extractTitle`) from the `utils` module.

2. **URL Validation**:

It checks if the provided URL is valid for Amazon. If not, it logs an error and exits.

3. **Fetch and Parse HTML**:

The `fetchHtmlContent` function retrieves the HTML content of the search page, and Cheerio loads it for parsing.

4. **Extract Product Details**:

It iterates through each product item, extracting the price, image URL, and title. It adds the product to the `scrapedProducts` array if all details are present.

5. **Export Data**:

The `exportProductsToCsv` function saves the scraped data to a CSV file.

6. **Logging**:

The script logs the total number of products scraped, the filename where the data is saved, and any errors encountered during the process.

7. **Execution**:

The `scrapeAmazonProducts` function is called with the search URL to start the scraping process.

3. ### Run the Code<a id="run-the-code-1"></a>

Save the file and run the code using Node.js:

```bash
node src/scrapeStaticHtml.js
```

You should see something like this in the terminal when you run the code:

```bash
    $ node src/scrapeStaticHtml.js
    {
      total_products: 20,
      status: 'Scraping completed successfully!',
      saved_file: '2024-8-7-9-1-23.csv'
    }
```

## Scraping Dynamic Web Content<a id="scraping-dynamic-web-content"></a>

Dynamic web content refers to webpage data generated or updated by JavaScript; hence, one has to run JavaScript to obtain the information. This section will guide you in scraping dynamic content from Amazon search results using Puppeteer, a headless browser automation library.

1. ### Writing the Scraping Code<a id="writing-the-scraping-code"></a>

In the `scrapeDynamicContent.js` file in your project's src folder, add the following code:

```JavaScript
const fs = require("fs");
const puppeteer = require("puppeteer");
const { exportProductsToCsv } = require("../utils/scrapingUtils");

// Sanitize product titles by replacing special characters
const sanitizeTitle = (title) => {
  if (!title) return "";
  return title.replace(/,/g, "").replace(/\|/g, "").replace(/"/g, '""');
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true to run in headless mode
    defaultViewport: null,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  await page.goto(
    "https://www.amazon.com/s?i=software-intl-ship&bbn=16225008011&rh=n%3A229677&dc&ds=v1%3AG0kY76%2FaHs08UinD2VVSW3LrscCe4gqh1KNp%2Bkxlo6o&qid=1721625356&rnid=85457740011&ref=sr_nr_p_123_1"
  );

  let isDisabled = false;
  const products = [];

  // Function to extract product details
  const extractProductDetails = async (product) => {
    const productTitle = await page.evaluate((el) => {
      const titleElement = el.querySelector("h2 > a > span");
      return titleElement ? titleElement.textContent : null;
    }, product);


    const totalPrice = await page.evaluate((el) => {
      const priceElement = el.querySelector(".a-price .a-offscreen");
      return priceElement ? priceElement.textContent : null;
    }, product);


    const imageUrl = await page.evaluate((el) => {
      const imageElement = el.querySelector("img");
      return imageElement ? imageElement.src : null;
    }, product);

    // Sanitize the product title
    const sanitizedTitle = sanitizeTitle(productTitle);

    return { productTitle: sanitizedTitle, totalPrice, imageUrl };
  };

  // Function to remove duplicate products
  const removeDuplicates = (products) => {
    const seen = new Set();
    return products.filter(product => {
      const duplicate = seen.has(product.productTitle);
      seen.add(product.productTitle);
      return !duplicate;
    });
  };

  while (!isDisabled) {
    await page.waitForSelector("[data-cel-widget='search_result_0']");
    const productHandles = await page.$$(".s-main-slot .s-result-item");

    for (const product of productHandles) {
      try {
        const productDetails = await extractProductDetails(product);

        const { productTitle, totalPrice, imageUrl } = productDetails;

        if (productTitle && totalPrice && imageUrl) {
          products.push(productDetails);
        }

      } catch (error) {
        console.error("Error extracting product details:", error);
      }
    }

    // Check if the "Next" button is disabled
    await page.waitForSelector("a.s-pagination-item.s-pagination-button", {
      visible: true,
    });

    isDisabled =
      (await page.$(
        "span.s-pagination-item.s-pagination-next.s-pagination-disabled"
      )) !== null;
    console.log("Pagination Disabled:", isDisabled);


    // If not disabled, click the next button and wait for navigation
    if (!isDisabled) {
      await Promise.all([
        page.click("a.s-pagination-item.s-pagination-next"),
        page.waitForNavigation({
          waitUntil: "networkidle2",
        }),
      ]);
    }
  }

  // Remove duplicates before exporting
  const uniqueProducts = removeDuplicates(products);

  // Export all collected products to CSV after the scraping loop completes
  exportProductsToCsv(uniqueProducts);

  await browser.close();
})();

```

#### How It Works<a id="how-it-works-2"></a>

1. **Launching Puppeteer:**

- The script starts by launching a new instance of Puppeteer with specific options:

  ```JavaScript
  const browser = await puppeteer.launch({
      headless: false, // Set to true to run in headless mode
      defaultViewport: null,
      userDataDir: "./tmp",
  });
  ```

- `headless: false`: Runs the browser in a visible mode, useful for debugging. Set to `true` for headless mode.

- `defaultViewport: null`: Allows the browser to use the default viewport size.

- `userDataDir: "./tmp"`: Specifies a directory to store user data.

2. **Opening a New Page:**

- A new page is opened, and the script navigates to the Amazon search results URL:

  ```JavaScript
  const page = await browser.newPage();

  await page.goto(
      "https://www.amazon.com/s?i=software-intl-ship&bbn=16225008011&rh=n%3A229677&dc&ds=v1%3AG0kY76%2FaHs08UinD2VVSW3LrscCe4gqh1KNp%2Bkxlo6o&qid=1721625356&rnid=85457740011&ref=sr_nr_p_123_1"
  );
  ```

3. **Scraping Loop:**

- The script enters a loop to scrape multiple pages until there are no more pages to scrape:

  ```JavaScript
  let isDisabled = false;
  const products = [];


  while (!isDisabled) {
  await page.waitForSelector("[data-cel-widget='search_result_0']");
  const productHandles = await page.$$(".s-main-slot .s-result-item");
  ```

- It waits for the first search result to be visible using `page.waitForSelector`:

  ```JavaScript
  await page.waitForSelector("[data-cel-widget='search_result_0']");
  ```

4. **Extracting Product Details:**

- The script selects all product items on the page using `page.$$` and iterates through them:

  ```JavaScript
  const productHandles = await page.$$(".s-main-slot .s-result-item");
  ```

- Using the `page.evaluate` method, it then extracts each product's title, price, and image URL:

  ```JavaScript
  const extractProductDetails = async (product) => {
      const productTitle = await page.evaluate((el) => {
      const titleElement = el.querySelector("h2 > a > span");
      return titleElement ? titleElement.textContent : null;
      }, product);

      const totalPrice = await page.evaluate((el) => {
      const priceElement = el.querySelector(".a-price .a-offscreen");
      return priceElement ? priceElement.textContent : null;
      }, product);

      const imageUrl = await page.evaluate((el) => {
      const imageElement = el.querySelector("img");
      return imageElement ? imageElement.src : null;
      }, product);

      // Sanitize the product title
      const sanitizedTitle = sanitizeTitle(productTitle);

      return { productTitle: sanitizedTitle, totalPrice, imageUrl };
  };
  ```

5. **Saving Data:**

- If all details are present, the product information is appended to the `products` array:

  ```JavaScript
  for (const product of productHandles) {
  try {
      const productDetails = await extractProductDetails(product);
      const { productTitle, totalPrice, imageUrl } = productDetails;
      if (productTitle && totalPrice && imageUrl) {
      products.push(productDetails);
      }
  } catch (error) {
      console.error("Error extracting product details:", error);
  }
  }
  ```

6. **Handling Pagination:**

- The script checks if the "Next" button is disabled to determine if there are more pages to scrape:

  ```JavaScript
  // Check if the "Next" button is disabled
  await page.waitForSelector("a.s-pagination-item.s-pagination-button", {
  visible: true,
  });

  isDisabled =
  (await page.$(
      "span.s-pagination-item.s-pagination-next.s-pagination-disabled"
  )) !== null;
  console.log("Pagination Disabled:", isDisabled);
  ```

- If the "Next" button is not disabled, it clicks the button and waits for the next page to load:

  ```JavaScript
  // If not disabled, click the next button and wait for navigation
  if (!isDisabled) {
  await Promise.all([
      page.click("a.s-pagination-item.s-pagination-next"),
      page.waitForNavigation({
      waitUntil: "networkidle2",
      }),
  ]);
  }
  ```

7. **Removing Duplicates and Exporting Data:**

- After scraping, the script removes duplicate products and exports the unique product details to a CSV file:

  ```JavaScript
  // Remove duplicates before exporting
  const uniqueProducts = removeDuplicates(products);
  // Export all collected products to CSV after the scraping loop completes
  exportProductsToCsv(uniqueProducts);

  await browser.close();
  ```

2. ### Run the Code<a id="run-the-code-2"></a>

Save the file and run the code using Node.js:

```bash
node src/scrapeDynamicContent.js
```

You should see the extracted product details saved to a CSV file and progress logs  like this in the terminal.

```bash
$ node src/scrapeDynamicContent.js
Pagination Disabled: false
Pagination Disabled: false
Pagination Disabled: false
Pagination Disabled: false
Pagination Disabled: true
```

## Using a Proxy Server<a id="using-a-proxy-server"></a>

When you access a website, your router's IP address is exposed rather than your device's local IP address. If too many requests are sent within a very short period, websites usually block or rate-limit your IP address.

Using a proxy conceals your identity by displaying the proxy's IP address rather than your actual ISP-assigned one. So, if a website blocks part of your disguised proxy IPs, you can rotate IPs and continue scraping without interruptions.

### Setting Up a Proxy Server<a id="setting-up-a-proxy-server"></a>

To set up a proxy server in your scraping script, follow these steps:

1. #### Choosing a Proxy:<a id="choosing-a-proxy"></a>

- You can find free or paid proxies from various online sources. For this tutorial, you can use the following websites to find a list of free proxies:

  - [ProxyNova](https://www.proxynova.com/proxy-server-list/country-th/)

  - [Free Proxy List](https://free-proxy-list.net/)

- Once you have selected a proxy, add it to your script. For this example, we’ll use a proxy from the Thailand list on ProxyNova.

![An image showing a list of proxies from ProxyNova](https://i.imgur.com/0kHFDua.png)

2. #### Integrating the Proxy into Your Puppeteer Script:<a id="integrating-the-proxy-into-your-puppeteer-script"></a>

- You can adjust your Puppeteer script to route requests through the proxy server. Below is an example of how you can modify your script to use a proxy server (`scrapeWithProxy.js`): <br/><br/>

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

3. #### Run the Code<a id="run-the-code-3"></a>

Save the file and run the code using Node.js:

    node src/scrapeWithProxy.js

When the code runs successfully, a screenshot, "proxy.png," is saved to your project's directory. It contains the results from visiting the URL `http://httpbin.org/ip,` which displays the requester's IP Address. In this case, it should be the proxy’s IP, confirming the proxy is working.

Note: When a proxy is not working correctly, you get an error like:

```
Error: net::ERR_TIMED_OUT at http://httpbin.org/ip
ERR_TUNNEL_CONNECTION_FAILED at http://httpbin.org/ip
ERR_PROXY_CONNECTION_FAILED at http://httpbin.org/ip
```

The error means the proxy server is unavailable, overloaded, or unresponsive. Select another proxy from your list to resolve this issue.

## Handling RECAPTCHAs and Ethical Considerations in Web Scraping<a id="handling-recaptchas-and-ethical-considerations-in-web-scraping"></a>

Today, websites implement challenges like RECAPTCHAs to identify humans and bots and prevent activities that could violate their terms of service.

### RECAPTCHAs Problems<a id="recaptchas-problems"></a>

- **Scraping Intermittence:**

RECAPTCHAs can interrupt scrapes by making automated scripts wait until the challenge is solved.

- **More Complexity:**

Solving RECAPTCHAs makes your script more complex.

- **Possible IP-Blocking:**

When too many RECAPTCHAs are triggered, the website flags you, restricting or limiting the traffic originating from your IP address.

### How to Avoid RECAPTCHA Problems<a id="how-to-avoid-recaptcha-problems"></a>

- **Use Proxies:**

Rotate proxies to make requests from different IPs, reducing the chances of having a RECAPTCHA enqueued.

- **Introduce Delays:**

Introduce random delays between requests and make the scraper sleep for random times to avoid getting detected.

- **Use browser automation:**

Tools like Puppeteer can simulate fundamental user interactions, which might get around some easier RECAPTCHAs.

- **Captcha-solving services:**

Use third-party services that have automatised CAPTCHA solvers, but also be cautious about ethical and legal risks.

- **Non-intrusive scraping**

Scrape less-protected pages of the target website that will not be served with a RECAPTCHA.

### Ethical Considerations and Legal Compliance<a id="ethical-considerations-and-legal-compliance"></a>

- **Respect the Website's Terms of Service:**

Check the Website's Terms of Service and the robots.txt file for allowance of scraping. In the case of a prohibition, seek permission or alternative means.

- **Avoid Scraping Personal/Sensitive Data:**

Scrape no personal/sensitive data to avoid breaching privacy laws like the GDPR.

- **Do Not Send Too Many Requests:**

Be friendly and lower the frequency of requests so that you do not flood their servers with a stream of requests, which may cause RECAPTCHAs.

- **Use APIs If Possible:**

  Use available APIs for structured and ethical scraping.

# Conclusion<a id="conclusion"></a>

You extracted information from Amazon, including some simple HTML and JavaScript content, using Cheerio and Puppeteer. You also learned how to work with the proxy servers to bypass common web scraping issues, which include IP banning or rate limit restrictions. Using proxies works wonderfully in keeping your scraping activities stable and uninterrupted. Play around with different proxy solutions to maximize your scrape potential while ensuring everything is on the ethical clock.
