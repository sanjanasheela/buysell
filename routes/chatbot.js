const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/message', async (req, res) => {
  const { message } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: message }]
        }
      ]
    });

    const response = await result.response;
    const text = response.text();
    res.json({ reply: text });

  } catch (err) {
    console.error('Gemini API Error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Gemini API error' });
  }
});

module.exports = router;
