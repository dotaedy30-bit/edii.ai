const express = require("express");
const cors = require("cors");
require("dotenv").config();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

if (!GROQ_API_KEY) {
console.error("ERRO: GROQ_API_KEY não encontrada");
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
            "Authorization": "Bearer " + GROQ_API_KEY
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData.error && errorData.error.message) || ("Erro " + response.status));
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

app.listen(PORT, "0.0.0.0", function () {
console.log("Servidor rodando na porta " + PORT);
});
