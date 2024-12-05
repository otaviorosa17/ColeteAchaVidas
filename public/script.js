let map;
let circle;
let ponto1;
let marcadorAtual; // Referência ao marcador para atualização

async function loadGoogleMapsApi() {
    try {
        // Busca a API Key do backend
        const response = await fetch('/api/get-google-maps-key');
        const data = await response.json();
        const apiKey = data.apiKey;
        // Adiciona o script do Google Maps dinamicamente, incluindo a biblioteca de geometria
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=geometry`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } catch (error) {
        console.error("Erro ao carregar a API Key:", error);
    }
}

function initMap() {
    const localInicial = { lat: 0, lng: 0 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 2,
        center: localInicial,
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(mostrarLocalizacaoUsuario, erroLocalizacao);
    } else {
        alert("Geolocalização não é suportada pelo seu navegador.");
    }

    const radiusSlider = document.getElementById("radius-slider");
    const radiusValue = document.getElementById("radius-value");

    radiusSlider.addEventListener("input", function () {
        const raioEmKm = Number(radiusSlider.value);
        radiusValue.textContent = `${raioEmKm} km`;

        // Atualiza o raio do círculo
        atualizarRaioCirculo(raioEmKm);
        map.setCenter(ponto1);
    });
}

function mostrarLocalizacaoUsuario(position) {
    ponto1 = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
    };

    map.setCenter(ponto1);
    map.setZoom(18);

    new google.maps.Marker({
        position: ponto1,
        map: map,
        title: "Sua Localização",
    });

    // Inicializa o círculo com o valor de zoom calculado para um raio padrão
    circle = new google.maps.Circle({
        map: map,
        center: ponto1,
        radius: 5000, // Começa com um valor padrão (5000 metros)
        fillColor: "#FF0000",
        fillOpacity: 0.2,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
    });

    // Ajusta o zoom de acordo com o raio inicial
    ajustarZoomParaRaio(5000); // Começa com 300 metros
}

function atualizarRaioCirculo(raioEmKm) {
    const raioEmMetros = raioEmKm * 1000;
    if (circle) {
        circle.setRadius(raioEmMetros);
        ajustarZoomParaRaio(raioEmMetros); // Ajusta o zoom conforme o novo raio
    }
}

// Função que ajusta o zoom com base no raio em metros
function ajustarZoomParaRaio(raioEmMetros) {
    var zoom;
    const isPortrait = window.innerHeight > window.innerWidth; // Verifica se a tela está em modo retrato
    if (isPortrait) {
        zoom = calcularZoomP(raioEmMetros);
    }
    else {
        zoom = calcularZoom(raioEmMetros);
    }
    map.setZoom(zoom); // Ajusta o nível de zoom do mapa
}

// Função que calcula o zoom ideal com base no raio (em metros)
function calcularZoomP(raioEmMetros) {
    const zoomBase = 18; // Nível de zoom para 100 metros
    const raioBase = 100; // Raio de referência (100 metros)

    // Calcula o nível de zoom de forma inversamente proporcional ao logaritmo do raio
    const zoom = zoomBase - Math.log2(raioEmMetros / raioBase);

    // Detecta a orientação da tela
    const isPortrait = window.innerHeight > window.innerWidth; // Verifica se a tela está em modo retrato

    // Ajuste do zoom baseado na orientação da tela
    const fatorOrientacao = isPortrait ? 1.2 : 0.8; // Aumenta o zoom para retrato (maior zoom para telas pequenas verticais)

    // Aplica o fator de ajuste no cálculo do zoom
    const zoomAjustado = zoom / fatorOrientacao *1.1;

    // Limita o zoom entre os níveis de 0 a 22 (como no Google Maps)
    return Math.min(22, Math.max(0, Math.round(zoomAjustado)));
}

function calcularZoom(raioEmMetros) {
    const zoomBase = 18; // Nível de zoom para 100 metros
    const raioBase = 100; // Raio de referência (100 metros)

    // Calcular o nível de zoom de forma inversamente proporcional ao logaritmo do raio
    const zoom = zoomBase - Math.log2(raioEmMetros / raioBase);

    // Limita o zoom entre os níveis de 0 a 22 (como no Google Maps)
    return Math.min(22, Math.max(0, Math.round(zoom)));
}


function erroLocalizacao() {
    alert("Não foi possível obter a localização. O mapa permanecerá com a visualização inicial.");
}

async function atualizarLocalizacao() {
    try {
        let ponto2;
        const response = await fetch("/api/location/latest");
        const location = await response.json();
        
        if (location.lat && location.lng) {
            ponto2 = {
                lat: location.lat,
                lng: location.lng
            };

            // Se o marcador já existir, atualiza a posição dele
            if (marcadorAtual) {
                marcadorAtual.setPosition(ponto2);
            } else {
                // Caso contrário, cria um novo marcador
                marcadorAtual = new google.maps.Marker({
                    position: ponto2,
                    map: map,
                    title: "Localização Recebida",
                    icon: {
                        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // URL de exemplo
                        scaledSize: new google.maps.Size(50, 50), // Tamanho personalizado
                    },
                });
            }

            // Verifica se a distância entre os pontos é maior que o raio do círculo
            const distancia = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(ponto1.lat, ponto1.lng),
                new google.maps.LatLng(ponto2.lat, ponto2.lng)
            );

            // Atualiza o status do colete com base na distância
            const coleteStatusDiv = document.getElementById("colete-status");
            if (distancia > circle.getRadius()) {
                coleteStatusDiv.textContent = "O colete está fora do raio de segurança!";
                coleteStatusDiv.className = "status-danger"; // Alerta vermelho
            } else {
                coleteStatusDiv.textContent = "O colete está dentro do raio de segurança.";
                coleteStatusDiv.className = "status-ok"; // Verde para dentro
            }

            map.setCenter(ponto1);
        }
    } catch (error) {
        console.error("Erro ao obter a localização:", error);
    }
}




// Chama a função de atualização de localização a cada 10 segundos
setInterval(atualizarLocalizacao, 100);

// Carrega a API do Google Maps
loadGoogleMapsApi();
