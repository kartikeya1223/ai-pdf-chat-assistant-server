const splitTextIntoChunks = async (text) => {
  const chunkSize = 1000;
const overlap = 200;
  const chunks = [];

  for (
    let i = 0;
    i < text.length;
    i += chunkSize - overlap
  ) {
    chunks.push({
      pageContent: text.slice(
        i,
        i + chunkSize
      ),
    });
  }

  return chunks;
};

module.exports = splitTextIntoChunks;