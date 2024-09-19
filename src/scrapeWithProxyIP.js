const puppeteer = require("puppeteer");
const { exportDataToCsv } = require("../utils/scrapingUtils");

// List of proxy servers - you can add more working proxies here
const proxyList = ["101.37.12.43:8000"];

// Select a random proxy from the list
const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];

(async () => {
  // Launch browser with proxy
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [`--proxy-server=${randomProxy}`, "--ignore-certificate-errors"],
  });

  const page = await browser.newPage();

  // Set a longer timeout for navigation
  page.setDefaultNavigationTimeout(120000); // 2 minutes

  // Verify proxy IP
  try {
    await page.goto("http://httpbin.org/ip", { waitUntil: "domcontentloaded" });
    const proxyIp = await page.evaluate(() => document.body.innerText);
    console.log("Proxy IP:", proxyIp);
  } catch (error) {
    console.error("Error verifying proxy IP:", error);
  }

  // Navigate to the quotes page
  try {
    await page.goto("https://quotes.toscrape.com/js/page/1/", {
      waitUntil: "networkidle2",
      timeout: 120000 // 2 minutes
    });
  } catch (error) {
    console.error("Error navigating to the quotes page:", error);
    await browser.close();
    return;
  }

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
      await page.waitForSelector(".quote", { timeout: 60000 }); // Increase timeout to 1 minute
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
          page.click("li.next > a"),
          page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
        ]);
      }
    } catch (error) {
      console.error("Error waiting for selector or navigating:", error);
      if (error.name === 'TimeoutError') {
        console.log("Attempting to reload the page...");
        await page.reload({ waitUntil: "networkidle2", timeout: 120000 });
        continue; // Try again with the reloaded page
      }
      break; // Exit the loop for other types of errors
    }
  }

  console.log("Total quotes scraped:", quotes.length);
  exportDataToCsv(quotes);

  await browser.close();
})();