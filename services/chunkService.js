const {
  RecursiveCharacterTextSplitter,
} = require("@langchain/textsplitters");

const splitTextIntoChunks = async (
  text
) => {
const splitter =
  new RecursiveCharacterTextSplitter({
    chunkSize:800,
    chunkOverlap: 150,
    separators: [
      "\n\n",
      "\n",
      ". ",
      " ",
      "",
    ],
  });

  const docs =
    await splitter.createDocuments([
      text,
    ]);

  console.log(
    `Created ${docs.length} chunks`
  );

  return docs;
};

module.exports =
  splitTextIntoChunks;