const ai = require("../gemini");

async function generateAnswer(
  context,
  question
) {
  const prompt = `
You are a Resume PDF Assistant.

Rules:
1. Answer ONLY using the provided context.
2. Give COMPLETE answers.
3. Include all related details.
4. Never answer with a single word if more information exists.
5. For education questions include:
   - University name
   - Degree
   - Specialization
   - Duration
   - CGPA
6. For skills questions include all skills found.
7. For project questions include project description.

Context:
${context}

Question:
${question}

Detailed Answer:
`;

  try {
    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    return response.text;
  } catch (error) {
    console.error(error);

    return `
Based on the document:

${context.slice(0, 1500)}
`;
  }
}

module.exports = {
  generateAnswer,
};