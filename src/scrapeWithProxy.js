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
