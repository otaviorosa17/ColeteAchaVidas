const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // Middleware para interpretar JSON no corpo das requisições

// Endpoint para receber a localização do ESP32
let latestLocation = { lat: 0, lng: 0 }; // Inicializa com valores padrão

app.post("/api/location", (req, res) => {
    const { latitude, longitude } = req.body;

    if (latitude && longitude) {
        latestLocation = { lat: latitude, lng: longitude };
        console.log("Localização recebida:", latestLocation);
        res.status(200).json({ message: "Localização recebida com sucesso!" });
    } else {
        res.status(400).json({ message: "Dados inválidos!" });
    }
});

// Endpoint para o frontend obter a localização mais recente
app.get("/api/location", (req, res) => {
    res.json(latestLocation);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
