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

    { waitUntil: "domcontentloaded" }
  );
  // Take a screenshot to verify the proxy is working
  await page.screenshot({ path: "proxy.png" });
  await browser.close(); // Close the browser instance
})();
