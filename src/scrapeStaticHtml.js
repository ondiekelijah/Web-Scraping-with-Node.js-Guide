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