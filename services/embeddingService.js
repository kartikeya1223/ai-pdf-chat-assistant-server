let extractor = null;

async function getExtractor() {
  if (!extractor) {
    console.log("Loading embedding model...");

    const transformers = await import(
      "@xenova/transformers"
    );

    extractor =
      await transformers.pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );

    console.log(
      "Embedding model loaded"
    );
  }

  return extractor;
}

async function getEmbedding(text) {
  const model =
    await getExtractor();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

async function generateEmbeddings(
  texts
) {
  const embeddings = [];

  for (const text of texts) {
    embeddings.push(
      await getEmbedding(text)
    );
  }

  return embeddings;
}

async function generateQueryEmbedding(
  question
) {
  return await getEmbedding(
    question
  );
}

module.exports = {
  generateEmbeddings,
  generateQueryEmbedding,
};