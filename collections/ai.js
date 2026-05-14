const express = require("express");
const router = express.Router();

const model = require("../utils/gemini");

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

router.get("/test-ai", async (req, res) => {
  try {
    const result = await model.generateContent("Say hello");

    res.send(result.response.text());
  } catch (error) {
    console.log(error);

    res.send(error.message);
  }
});

module.exports = router;
