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


