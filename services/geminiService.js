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
You are an AI assistant.

Answer ONLY using the provided context.

If the answer is not present in the context say:

"I could not find that information in the document."

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