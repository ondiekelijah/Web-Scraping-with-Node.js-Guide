const fs = require("fs");
const https = require("https");
const zlib = require("zlib");

const fetchHtmlContent = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "Accept-Language": "en-US,en;q=0.9",
          },
        },
        (response) => {
          const encoding = response.headers["content-encoding"];
          let stream = response;

          if (encoding === "gzip") {
            stream = response.pipe(zlib.createGunzip());
          } else if (encoding === "deflate") {
            stream = response.pipe(zlib.createInflate());
          }

          let htmlData = "";

          stream.on("data", (chunk) => {
            htmlData += chunk;
          });

          stream.on("end", () => {
            resolve(htmlData);
          });

          stream.on("error", (err) => {
            reject(err);
          });
        }
      )
      .on("error", (err) => {
        reject(err);
      });
  });
};

const extractTitle = (productElement, imageUrl) => {
  const title = productElement
    .find(".a-size-medium.a-color-base.a-text-normal")
    .text();
  if (!title) {
    const urlSegment = imageUrl;
    if (typeof urlSegment === "string") {
      const strippedUrlSegment = urlSegment.split("/")[1];
      const formattedTitle = strippedUrlSegment.replace(/-/g, " ");
      return formattedTitle;
    }
  }
  return title;
};

const createFilename = () => {
  const date = new Date();
  const filename = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`;
  return filename;
};

const exportProductsToCsv = (products) => {
  const filename = createFilename();
  let csvContent = "Title,Price,ImageURL\n";

  products.forEach(({ productTitle, totalPrice, imageUrl }) => {
    const sanitizedTitle = productTitle.replace(/,/g, "");
    csvContent += `${sanitizedTitle},${totalPrice},${imageUrl}\n`;
  });

  const folder = "data";
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  fs.writeFileSync(`${folder}/${filename}`, csvContent);
  return `./${folder}/${filename}`;
};

module.exports = {
  createFilename,
  exportProductsToCsv,
  extractTitle,
  fetchHtmlContent,
};
