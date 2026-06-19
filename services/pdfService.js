const fs = require("fs");
const pdf = require("pdf-parse");

const extractTextFromPDF = async (pdfPath) => {
  const dataBuffer = fs.readFileSync(pdfPath);

  const data = await pdf(dataBuffer);

  return data.text;
};

module.exports = extractTextFromPDF;