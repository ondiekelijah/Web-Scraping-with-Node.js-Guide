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
