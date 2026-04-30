const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

if (!GROQ_API_KEY) {
    console.error("ERRO: GROQ_API_KEY não encontrada no .env");
    process.exit(1);
}

app.post("/chat", async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || messages.length === 0) {
            return res.status(400).json({ error: "Nenhuma mensagem enviada." });
        }

        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        formattedMessages.unshift({
            role: "system",
            content: "Você é um assistente especializado em concursos públicos. Responda de forma clara, objetiva e educativa."
        });

        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",   // excelente custo-benefício gratuito
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Erro ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        res.json({ response: reply });

    } catch (error) {
        console.error("Erro Groq:", error.message);
        res.status(500).json({ error: "Erro na comunicação com o Groq." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT} (Groq)`);
});