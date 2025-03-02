require('dotenv').config();
const express = require('express');
const OpenAI = require("openai");
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/chat', async (req, res) => {
    try {
        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY
          });
        const { message } = req.body;
        const completion = openai.chat.completions.create({
            model: "gpt-4o-mini",
            store: true,
            messages: [
              {"role": "user", "content": message},
            ],
          });
          completion.then((result) => {
            res.json({ reply: result.choices[0].message });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
