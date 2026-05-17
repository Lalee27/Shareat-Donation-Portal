const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
You are a helpful and professional AI Support Agent for 'Shareat', a social impact platform.
Shareat connects Donors with NGOs to facilitate donations of items like food, clothes, and books.

Key Features of Shareat:
1. Donors can list items they want to donate.
2. NGOs can browse and accept donation requests.
3. Users can track the impact of their donations in real-time.
4. The platform has separate dashboards for Donors, NGOs, and Admins.

Your Guidelines:
- Be polite, empathetic, and concise.
- Help users with platform navigation, donation processes, and general inquiries.
- If a user asks about account deletion, tell them it can be done from the Settings > Account section.
- If you cannot answer a specific technical issue, provide the support email: support@shareat.org.
- Do not provide medical, legal, or financial advice.
- CRITICAL: You must ONLY answer questions related to the Shareat platform, its features, donations, NGOs, or how to use the web app. If a user asks a question outside this scope (e.g., general knowledge, coding, weather, personal advice), politely decline to answer and redirect them back to Shareat-related topics.
- Keep the tone helpful and community-focused.
`;

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    console.log('--- Incoming Chat Request ---');
    console.log('Message:', message);

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.error('❌ Error: GEMINI_API_KEY is not set or is still the placeholder.');
      return res.status(500).json({ error: 'Please set a valid GEMINI_API_KEY in your server/.env file.' });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    console.log('✅ AI Response:', text.substring(0, 50) + '...');
    res.json({ reply: text });
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    if (error.message.includes('API_KEY_INVALID')) {
      return res.status(401).json({ error: 'Invalid API Key. Please check your GEMINI_API_KEY.' });
    }
    res.status(500).json({ error: 'Failed to get response from AI agent: ' + error.message });
  }
});

module.exports = router;
