require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

const API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SITE_NAME = 'OpenRouter';

// Debugging API Key Loading
if (!API_KEY) {
    console.error("⚠️ OPENROUTER_API_KEY is not defined. Make sure .env is loaded.");
}

async function getAIResponse(userMessage) {
    try {
        if (!userMessage) {
            throw new Error("User message is missing");
        }

        const response = await axios.post(
            SITE_URL,
            {
                model: 'google/gemini-2.0-pro-exp-02-05:free',
                messages: [{ role: 'user', content: userMessage }],
                max_tokens: 100 // Limits response size
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': SITE_URL,
                    'X-Title': SITE_NAME
                },
                timeout: 10000 // 10-second timeout to avoid hanging requests
            }
        );

        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error("Invalid response from AI API");
        }

        return response.data.choices[0]?.message?.content?.trim() || "No valid response received.";
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        return `Error: ${JSON.stringify(error.response?.data) || error.message}`;
    }
}

app.post('/ask', async (req, res) => {
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
});

// Export the app module
module.exports = app;

