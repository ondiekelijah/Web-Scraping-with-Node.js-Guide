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
      console.log(data); // Log the data
    });
  })
  .on("error", (err) => {
    console.log("Error: " + err.message);
  });
