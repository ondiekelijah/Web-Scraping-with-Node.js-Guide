// scrapeDynamicContent.js
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