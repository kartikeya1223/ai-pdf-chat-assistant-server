const cosineSimilarity = require(
  "compute-cosine-similarity"
);

const vectorData = [];

async function createVectorStore(
  chunks,
  embeddings
) {
  vectorData.length = 0;

  for (let i = 0; i < chunks.length; i++) {
    vectorData.push({
      text: chunks[i].pageContent,
      embedding: embeddings[i],
    });
  }

  console.log(
    `Stored ${vectorData.length} chunks in vector store`
  );

  return vectorData;
}

async function searchSimilarChunks(
  questionEmbedding
) {
  const scores = vectorData.map(
    (item) => ({
      text: item.text,
      score:
        cosineSimilarity(
          questionEmbedding,
          item.embedding
        ) || 0,
    })
  );

  scores.sort(
    (a, b) => b.score - a.score
  );

  console.log(
    "========== TOP MATCHES =========="
  );

  console.log(scores.slice(0, 5));
return scores
  .filter(item => item.score > 0.15)
  .slice(0, 5);
}

module.exports = {
  createVectorStore,
  searchSimilarChunks,
};