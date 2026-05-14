const express = require("express");
const router = express.Router();

const model = require("../utils/gemini");

// gemini ai chat bot
router.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).send({
        success: false,
        message: "Please provide a valid message.",
      });
    }

    const prompt = `
You are a helpful tourism and travel assistant for Aura Tour.

User Question:
${message}

Rules:
- Keep answers short
- Be friendly
- Help users properly
`;
    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      throw new Error("Empty response from Gemini API");
    }

    const response = result.response.text();
    res.send({
      success: true,
      reply: response,
    });
  } catch (error) {
    console.error("--- Gemini Chat Error ---");
    console.error("Message:", error.message);
    if (error.response) {
      console.error("Data:", error.response.data);
    }
    console.error("-------------------------");

    res.status(500).send({
      success: false,
      message: "Chat failed",
      error: error.message,
    });
  }
});

// gemini api description generator

router.post("/api/gemini/generate-description", async (req, res) => {
  try {
    const { title, category, price } = req.body;

    const prompt = `
      Generate tour tour package description.

      Product Title: ${title}
      Category: ${category}
      Price: ${price}

    `;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    res.send({
      success: true,
      description: response,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Failed to generate description",
    });
  }
});

module.exports = router;
