const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/* ✅ STRONG JSON CLEANER */
const extractJSON = (text) => {
    try {
        // remove markdown ```json
        text = text.replace(/```json|```/g, "").trim();

        // fix trailing commas
        text = text.replace(/,\s*}/g, "}");
        text = text.replace(/,\s*]/g, "]");

        // extract only JSON part
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return null;

        return JSON.parse(match[0]);

    } catch (err) {
        console.error("❌ JSON STILL BROKEN:", text);
        return null;
    }
};

app.post('/api/analyze', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim() === "") {
            return res.status(400).json({ error: "No text provided" });
        }

        const prompt = `
You are a consumer rights lawyer.

Analyze the given Terms & Conditions.

Return ONLY VALID JSON (no text outside JSON).

{
  "fairness_score": number (must be between 0 and 100),
  "verdict": "2 sentence summary",
  "red_flags": ["..."],
  "yellow_flags": ["..."],
  "green_flags": ["..."],
  "translations": [
    {
      "original": "...",
      "simple": "..."
    }
  ]
}

STRICT RULES:
- No explanation outside JSON
- No trailing commas
- No markdown
- JSON must be valid
- Give 3+ red flags
- Give 3+ yellow flags
`;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "nvidia/nemotron-nano-9b-v2:free",
                messages: [{ role: "user", content: prompt + "\n\nTEXT:\n" + text }]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const output = response.data.choices[0].message.content;

        const json = extractJSON(output);

        if (!json) {
    return res.status(500).json({
        error: "Invalid JSON from AI",
        raw: output
    });
}

// 🔥 ADD THIS HERE (AFTER JSON PARSE)
// 🔥 ADD THIS HERE (AFTER JSON PARSE)
        const red = json.red_flags?.length || 0;
        const yellow = json.yellow_flags?.length || 0;
        const green = json.green_flags?.length || 0;

        // Force the AI's score into an integer. If it fails, default to 100.
        let initialScore = parseInt(json.fairness_score);
        if (isNaN(initialScore)) {
            initialScore = 100; 
        }

        let adjustedScore = initialScore;
        adjustedScore -= red * 5;
        adjustedScore -= yellow * 2;
        adjustedScore += green * 2;

        // keep score between 0–100
        adjustedScore = Math.max(0, Math.min(100, adjustedScore));

        json.fairness_score = Math.round(adjustedScore);

        // ✅ THEN SEND RESPONSE
        res.json(json);

    } catch (err) {
        console.error("🔥 SERVER ERROR:", err.response?.data || err.message);
        res.status(500).json({
            error: "Backend failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});