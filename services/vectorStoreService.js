const faiss = require("faiss-node");

let index;
let storedChunks = [];

async function createVectorStore(
  chunks,
  embeddings
) {
  storedChunks = chunks;

  const dimension =
    embeddings[0].length;

  index =
    new faiss.IndexFlatL2(
      dimension
    );

  embeddings.forEach(
    (embedding) => {
      index.add(embedding);
    }
  );

  console.log(
    `Stored ${embeddings.length} chunks in FAISS`
  );

  return index;
}

async function searchSimilarChunks(
  questionEmbedding
) {
  const k = Math.min(
    10,
    storedChunks.length
  );

  const result = index.search(
    questionEmbedding,
    k
  );

  const similarChunks = [];

  for (
    let i = 0;
    i < result.labels.length;
    i++
  ) {
    const chunkIndex =
      result.labels[i];

    if (
      chunkIndex >= 0 &&
      storedChunks[chunkIndex]
    ) {
      similarChunks.push({
        score:
          result.distances[i],
        text:
          storedChunks[
            chunkIndex
          ].pageContent,
      });
    }
  }

  similarChunks.sort(
    (a, b) =>
      a.score - b.score
  );

  console.log(
    "========== FAISS RESULTS =========="
  );

  console.log(similarChunks);

  const filtered =
    similarChunks.filter(
      (chunk) =>
        chunk.score < 200
    );

  return filtered.length > 0
    ? filtered
    : similarChunks.slice(0, 5);
}

function getAllChunks() {
  return storedChunks.map(
    (chunk) => ({
      score: 0,
      text: chunk.pageContent,
    })
  );
}

module.exports = {
  createVectorStore,
  searchSimilarChunks,
  getAllChunks,
};