require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SITE_NAME = 'OpenRouter';

async function getAIResponse(userMessage) {
    try {
        if (!userMessage) {
            throw new Error("User message is missing");
        }

        const response = await axios.post(
            SITE_URL,
            {
                model: 'google/gemini-2.0-pro-exp-02-05:free',
                messages: [{ role: 'user', content: userMessage }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': SITE_URL,
                    'X-Title': SITE_NAME
                }
            }
        );

        if (!response.data.choices || response.data.choices.length === 0) {
            throw new Error("Invalid response from AI API");
        }

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        return `Error: ${JSON.stringify(error.response?.data) || error.message}`;
    }
}

// Vercel API handler
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const answer = await getAIResponse(message);
        res.json({ response: answer });
    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
