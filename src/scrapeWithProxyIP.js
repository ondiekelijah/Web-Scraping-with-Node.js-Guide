const puppeteer = require("puppeteer");
const { exportDataToCsv } = require("../utils/scrapingUtils");

// List of proxy servers - you can add more working proxies here
const proxyList = ["13.36.104.85:80"];

// Select a random proxy from the list
const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];

(async () => {
  // Launch browser with proxy
  const browser = await puppeteer.launch({
    headless: true, // Set to true to run in headless mode
    defaultViewport: null, // Set the default viewport
    args: [`--proxy-server=${randomProxy}`, "--ignore-certificate-errors"], // Apply the proxy server
  });

  const page = await browser.newPage();

  // Verify proxy IP
  await page.goto("http://httpbin.org/ip", {
    waitUntil: "domcontentloaded",
  });
  const proxyIp = await page.evaluate(() => document.body.innerText);
  console.log("Proxy IP:", proxyIp);

  // Navigate to the quotes page
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
    try {
      await page.waitForSelector(".quote"); // Increase timeout to 60 seconds
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
    } catch (error) {
      console.error("Error waiting for selector or navigating:", error);
      break; // Exit the loop if there's an error
    }
  }

  console.log("Total quotes scraped:", quotes.length);
  exportDataToCsv(quotes);

  await browser.close();
})();
