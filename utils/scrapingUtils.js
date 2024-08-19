const fs = require("fs");
const https = require("https");

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
          let htmlData = "";

          response.on("data", (chunk) => {
            htmlData += chunk;
          });

          response.on("end", () => {
            resolve(htmlData);
          });

          response.on("error", (err) => {
            reject(err);
          });
        }
      )
      .on("error", (err) => {
        reject(err);
      });
  });
};

const createFilename = () => {
  const date = new Date();
  const filename = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`;
  return filename;
};

const exportDataToCsv = (quotes) => {
  const filename = createFilename();
  let csvContent = "Text,Author,Tags\n";

  quotes.forEach(({ text, author, tags }) => {
    const sanitizedText = text.replace(/,/g, "");
    const sanitizedTags = tags.join("|"); // Join tags with a pipe separator
    csvContent += `"${sanitizedText}","${author}","${sanitizedTags}"\n`;
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
  exportDataToCsv,
  fetchHtmlContent,
};
