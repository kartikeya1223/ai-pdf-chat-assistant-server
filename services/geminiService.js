const ai = require("../gemini");

function createSummary(context) {
  const lines = context
    .split("\n")
    .filter((line) => line.trim().length > 20)
    .slice(0, 10);

  return (
    "📄 Summary of the document:\n\n" +
    lines.join("\n")
  );
}

async function generateAnswer(context, question) {
  const lowerQuestion =
    question.toLowerCase();

  if (!context) {
    return "I could not find relevant information in the document.";
  }

 const prompt = `
You are an AI assistant that answers questions about an uploaded document.

Use ONLY the provided context.

Rules:
1. Answer directly using information found in the context.
2. When the user says "my", interpret it as referring to the person or people identified in the document.
3. If more than one possible answer exists, list all possible answers instead of saying the information is missing.
4. Names, registration numbers, headings, and short text are valid information even if they appear on separate lines.
5. Do not invent information.
6. Only say "I could not find that information in the document." when the requested information is genuinely absent.

Context:
${context}

Question:
${question}

Answer:
`;

  try {
    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    return (
      response.text ||
      "I could not generate an answer."
    );
  } catch (error) {
    console.log(
      "Gemini Error:",
      error.message
    );

    if (
      lowerQuestion.includes(
        "summary"
      ) ||
      lowerQuestion.includes(
        "summarize"
      )
    ) {
      return createSummary(context);
    }

    return (
      "⚠️ Gemini quota exceeded.\n\n" +
      context.slice(0, 700)
    );
  }
}

module.exports = {
  generateAnswer,
};