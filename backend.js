const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config(); // Carrega variáveis de ambiente do arquivo .env

const app = express();

// Servir arquivos estáticos, como o index.html
app.use(express.static(path.join(__dirname, "public")));

// Endpoint para retornar a chave da API
app.get("/api/config", (req, res) => {
    res.json({ apiKey: process.env.API_KEY });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
