const extractTextFromPDF = require("../services/pdfService");
const splitTextIntoChunks = require("../services/chunkService");

const {
  generateEmbeddings,
  generateQueryEmbedding,
} = require("../services/embeddingService");

const {
  createVectorStore,
  searchSimilarChunks,
} = require("../services/vectorStoreService");

const {
  generateAnswer,
} = require("../services/geminiService");

let vectorStore;

// ======================
// Upload PDF
// ======================

const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF uploaded",
      });
    }

    const pdfPath = req.file.path;

    const text =
      await extractTextFromPDF(pdfPath);

    const chunks =
      await splitTextIntoChunks(text);

    const embeddings =
      await generateEmbeddings(
        chunks.map(
          (chunk) => chunk.pageContent
        )
      );

    vectorStore =
      await createVectorStore(
        chunks,
        embeddings
      );

    return res.status(200).json({
      success: true,
      message:
        "PDF processed successfully",
      totalChunks: chunks.length,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "PDF processing failed",
    });
  }
};

// ======================
// Ask Question
// ======================

const askQuestion = async (
  req,
  res
) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message:
          "Question is required",
      });
    }

    if (
      !vectorStore ||
      vectorStore.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a PDF first",
      });
    }

    const questionEmbedding =
      await generateQueryEmbedding(
        question
      );

    const similarChunks =
      await searchSimilarChunks(
        questionEmbedding
      );

    console.log(
      "========== SIMILAR CHUNKS =========="
    );

    console.log(similarChunks);

    const context = similarChunks
      .map((chunk) => chunk.text)
      .join("\n\n");

    console.log(
      "========== CONTEXT =========="
    );

    console.log(context);

    const answer =
      await generateAnswer(
        context,
        question
      );

    return res.status(200).json({
      success: true,
     answer,
sources: similarChunks.map(chunk => ({
  score: chunk.score.toFixed(3),
  text: chunk.text.substring(0, 300)
}))
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Question failed",
    });
  }
};

module.exports = {
  uploadPDF,
  askQuestion,
};