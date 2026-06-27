const extractTextFromPDF =
  require("../services/pdfService");

const splitTextIntoChunks =
  require("../services/chunkService");

const {
  generateEmbeddings,
  generateQueryEmbedding,
} = require(
  "../services/embeddingService"
);

const vectorStoreService =
  require(
    "../services/vectorStoreService"
  );

const {
  createVectorStore,
  searchSimilarChunks,
} = vectorStoreService;

const {
  generateAnswer,
} = require(
  "../services/geminiService"
);

let vectorStore;

// ======================
// Upload PDF
// ======================

const uploadPDF = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "No PDF uploaded",
      });
    }

    const pdfPath =
      req.file.path;

    const text =
      await extractTextFromPDF(
        pdfPath
      );

    const chunks =
      await splitTextIntoChunks(
        text
      );

    const embeddings =
      await generateEmbeddings(
        chunks.map(
          (chunk) =>
            chunk.pageContent
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
      totalChunks:
        chunks.length,
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
    const { question } =
      req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message:
          "Question is required",
      });
    }

    if (!vectorStore) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a PDF first",
      });
    }

    const lowerQuestion =
      question.toLowerCase();

    const isSummaryQuestion =
      lowerQuestion.includes(
        "summarize"
      ) ||
      lowerQuestion.includes(
        "summary"
      ) ||
      lowerQuestion.includes(
        "overview"
      ) ||
      lowerQuestion.includes(
        "important points"
      ) ||
      lowerQuestion.includes(
        "summarise"
      ) ||
      lowerQuestion.includes(
        "what is this document about"
      );

    let similarChunks = [];

    if (
      isSummaryQuestion
    ) {
      console.log(
        "Generating Summary..."
      );

      similarChunks =
        vectorStoreService.getAllChunks();
    } else {
      const questionEmbedding =
        await generateQueryEmbedding(
          question
        );

      similarChunks =
        await searchSimilarChunks(
          questionEmbedding
        );
    }

    console.log(
      "========== SIMILAR CHUNKS =========="
    );

    console.log(
      similarChunks
    );

    const context =
      similarChunks
        .map(
          (chunk) =>
            chunk.text
        )
        .join("\n\n")
        .slice(0, 25000);

    if (
      !context ||
      context.trim() ===
        ""
    ) {
      return res.status(200).json({
        success: true,
        answer:
          "I could not find that information in the document.",
      });
    }

    console.log(
      "========== CONTEXT =========="
    );

    console.log(context);

    const finalQuestion =
      isSummaryQuestion
        ? `
Summarize this document in detail.

Include:
1. Main objective
2. Skills
3. Projects
4. Technologies used
5. Important points
`
        : question;

    const answer =
      await generateAnswer(
        context,
        finalQuestion
      );

    return res.status(200).json({
      success: true,
      answer,
      sources:
        similarChunks.map(
          (chunk) => ({
            score:
              chunk.score.toFixed(
                3
              ),
            text:
              chunk.text.substring(
                0,
                300
              ),
          })
        ),
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