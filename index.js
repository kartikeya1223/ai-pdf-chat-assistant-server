require("dotenv").config();
const express = require("express");
const ai = require("./gemini");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());


const pdfRoutes = require("./routes/pdfRoutes");

app.use("/api/pdf", pdfRoutes);




app.get("/", (req, res) => {
  res.send("AI PDF Chat Assistant Running");
});

const PORT = process.env.PORT || 5000;

app.get("/ask-ai", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Explain Artificial Intelligence in simple words",
    });

    res.json({
      success: true,
      answer: response.text,
    });
  } catch (error) {
  console.error("FULL ERROR:", error);

  res.status(500).json({
    success: false,
    message: "AI request failed",
  });
}
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});