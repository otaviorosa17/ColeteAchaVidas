const dotenv = require("dotenv");
const express = require("express");
const path = require("path");

dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // Middleware para interpretar JSON no corpo das requisições

// Endpoint para receber a localização do ESP32
let latestLocation = { lat: 0, lng: 0 }; // Inicializa com valores padrão

app.get('/api/get-google-maps-key', (req, res) => {
    res.json({ apiKey: process.env.API_KEY });
});

// Alterando para GET, os dados agora são passados como parâmetros na URL
app.get("/api/location", (req, res) => {
    const { latitude, longitude } = req.query; // Pega os parâmetros da URL

    if (latitude && longitude) {
        latestLocation = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
        console.log("Localização recebida:", latestLocation);
        res.status(200).json({ message: "Localização recebida com sucesso!" });
    } else {
        res.status(400).json({ message: "Dados inválidos!" });
    }
});

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


app.post("/api/msg", async (req, res) => {
    const { msg } = req.body;

    if (msg) {
        console.log("Mensagem recebida:", msg);

        // Extrai latitude e longitude da mensagem
        const match = msg.match(/latitude:\s*(-?\d+\.\d+)\s*longitude:\s*(-?\d+\.\d+)/);

        if (match) {
            const latitude = parseFloat(match[1]);
            const longitude = parseFloat(match[2]);
            
            // Atualiza a localização mais recente
            latestLocation = { lat: latitude, lng: longitude };
            console.log("Localização processada:", latestLocation);

            // Envia a localização para o endpoint /api/location usando POST
            try {
                const response = await fetch(`http://localhost:${PORT}/api/location`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ latitude, longitude })
                });
                
                if (response.ok) {
                    console.log("Localização enviada com sucesso para /api/location");
                } else {
                    console.error("Erro ao enviar a localização para /api/location");
                }
            } catch (error) {
                console.error("Erro ao fazer a requisição para /api/location:", error);
            }

            res.status(200).json({ message: "Mensagem processada com sucesso!" });
        } else {
            res.status(400).json({ message: "Formato da mensagem inválido!" });
        }
    } else {
        res.status(400).json({ message: "Dados inválidos!" });
    }
});

// Endpoint para o frontend obter a localização mais recente
app.get("/api/location/latest", (req, res) => {
    console.log("Última localização:", latestLocation); // Verifica se a localização está correta
    if (latestLocation.lat !== 0 || latestLocation.lng !== 0) {
        res.json(latestLocation);
    } else {
        res.status(400).json({ message: "Dados inválidos!" });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
