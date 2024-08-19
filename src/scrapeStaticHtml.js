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
