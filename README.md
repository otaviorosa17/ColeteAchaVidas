# COLETE ACHA VIDAS! - Um GPS Tracker com ESP32, SIM800L, NEO-6M e integração com Aplicação Web

Este projeto implementa um rastreador GPS utilizando um ESP32, um módulo SIM800L para envio de mensagens SMS, e um módulo GPS NEO-6M. O objetivo é capturar as coordenadas GPS do dispositivo e redirecionar as informações para um servidor HTTP, usando um celular como intermediário.

## Funcionalidades

- Captura de coordenadas GPS no formato DMS (graus, minutos, segundos) e conversão para o formato decimal.
- Envio de mensagens SMS contendo as coordenadas para um número pré-configurado.
- Integração assíncrona para melhor desempenho e manipulação de tarefas concorrentes.

## Hardware Necessário

1. **ESP32**: Microcontrolador para processamento e comunicação.
2. **SIM800L**: Módulo GSM para envio de mensagens SMS.
3. **NEO-6M**: Módulo GPS para obtenção de coordenadas.
4. **Fonte de alimentação**: 3.7V para alimentar os módulos.
5. **Antena GPS e GSM**: Para melhor recepção de sinais.
6. **Fios e conectores**: Para realizar as conexões entre os módulos.

## Conexões


| Componente      | ESP32 Pinagem |
|-----------------|---------------|
| NEO-6M (TX)     | GPIO 15       |
| NEO-6M (RX)     | GPIO 4        |
| NEO-6M (VCC)    | 3V3           |
| NEO-6M (GND)    | GND           |
| SIM800L (TX)    | GPIO 16       |
| SIM800L (RX)    | GPIO 17       |
| SIM800L (GND)   | GND           |

| SIM800L         | Bateria       |
|-----------------|---------------|
| SIM800L (VCC)   | Cabo Vermelho |
| SIM800L (GND)   | Cabo Preto    |

## Bibliotecas Necessárias

- `micropyGPS`: Para manipulação de dados GPS.
- `uasyncio`: Para execução de tarefas assíncronas.

## Estrutura do Projeto

### Arquivos Principais

- `boot.py`: Contém o código principal do rastreador GPS e do envio das mensagens SMS de maneira assíncrona.

### Fluxo de Execução

1. O ESP32 lê os dados do módulo GPS via UART.
2. Os dados do GPS são convertidos de DMS para formato decimal.
3. Uma mensagem SMS é enviada com as coordenadas para um número configurado.
4. Caso o envio falhe, uma nova tentativa será realizada após 1 segundo.
5. As mensagens são processadas pelo celular e enviadas a um servidor HTTP com a aplicação Web (processo que pode ser feito através de um serviço de SMS Gateway ou com um celular e chip próprios usando um aplicativo de SMS Forwarding).

## Configuração e Uso

1. **Montagem do Circuito**: Realize as conexões descritas na seção **Conexões**.
2. **Carregamento do Código**: Suba os arquivos para o ESP32 utilizando o IDE Thonny ou outro gerenciador compatível com MicroPython.
3. **Configuração do Número de Destino**: No arquivo `boot.py`, ajuste o número de destino em `enviarmensagem(f"latitude: {latitude_decimal} longitude: {longitude_decimal}", "SEUNÚMERO")`.
4. **Execução**: Reinicie o ESP32 para iniciar o rastreamento.

## Dependências

Certifique-se de instalar as dependências no ambiente MicroPython:

```python
import upip
upip.install('micropyGPS')
upip.install('uasyncio')
```

## Observações

1. O módulo SIM800L deve ser alimentado corretamente para evitar falhas de comunicação.
2. Certifique-se de que o chip SIM possui saldo e está ativado para envio de SMS.
3. O módulo GPS pode levar algum tempo para fixar a posição inicial ("fix") dependendo das condições de visibilidade do céu.

Aqui está a continuação do seu relatório, descrevendo as partes da aplicação web.

---

## Aplicação Web

A aplicação web é responsável por exibir o mapa com a localização recebida do dispositivo de rastreamento (ESP32), monitorar a distância da localização do colete em relação ao centro, e fornecer feedback visual sobre a situação de segurança do colete. O front-end interage com o back-end através de requisições HTTP, e a comunicação é feita por meio de APIs para enviar e receber as coordenadas GPS.

### Arquivos da Aplicação Web

#### **1. backend.js**

O arquivo `backend.js` é o código do servidor backend utilizando o framework **Express**. Ele recebe e processa as localizações enviadas pela aplicação de rastreamento (via SMS). Além disso, ele envia a chave da API do Google Maps para o front-end e gerencia os dados de localização.

Principais funções:
- **Receber localização via GET e POST**: O servidor recebe as coordenadas de latitude e longitude, tanto por GET (passando parâmetros pela URL) quanto por POST (com dados no corpo da requisição). Esses dados são armazenados na variável `latestLocation`.
- **Processar mensagens de SMS**: Ao receber uma mensagem com as coordenadas GPS, o servidor extrai os valores de latitude e longitude, atualiza a localização e envia essa informação para o endpoint `/api/location`.
- **Obter a localização mais recente**: O servidor oferece o endpoint `/api/location/latest` para que o front-end obtenha a localização mais recente registrada.

#### **2. index.html**

O arquivo `index.html` define a estrutura básica da página da aplicação web. Ele contém o mapa, um controle deslizante para ajustar o raio de segurança e uma área para exibir o status do colete.

Elementos principais:
- **Mapa**: O mapa é gerado pela API do Google Maps, onde a localização atual do usuário e a localização do colete são exibidas.
- **Controle de Raio**: Um controle deslizante (`<input type="range">`) permite ajustar o raio de segurança em torno do ponto de rastreamento.
- **Status do Colete**: A seção de status do colete exibe se ele está dentro ou fora do raio de segurança, com feedback visual.

#### **3. script.js**

O arquivo `script.js` contém a lógica JavaScript para interagir com o mapa e atualizar a localização do colete, além de processar o raio de segurança e a posição do usuário.

Funções principais:
- **Carregar o Google Maps**: A função `loadGoogleMapsApi` busca a chave da API do backend e carrega dinamicamente o script da API do Google Maps.
- **Inicializar o mapa**: A função `initMap` configura o mapa, define a posição inicial e cria um círculo representando o raio de segurança.
- **Atualizar a localização do colete**: A função `atualizarLocalizacao` periodicamente consulta o servidor para obter a localização mais recente do colete e atualizar o marcador no mapa.
- **Calcular o zoom do mapa**: Funções como `ajustarZoomParaRaio` e `calcularZoom` ajustam o nível de zoom no mapa com base no tamanho do raio de segurança.

#### **4. style.css**

O arquivo `style.css` contém os estilos para a interface da aplicação web. Ele define o layout do mapa, a aparência do controle deslizante e o status visual do colete.

Elementos principais:
- **Estilos do mapa**: O mapa ocupa 80% da altura da tela, com um tamanho responsivo.
- **Estilos do controle de raio**: O slider que ajusta o raio é centralizado e ocupa 10% da altura da tela.
- **Estilos de status**: O status do colete é mostrado em uma barra sobreposta ao mapa, com cores diferentes para indicar se o colete está dentro ou fora do raio de segurança.

### Fluxo de Execução

1. **Carregamento da API do Google Maps**: Ao carregar a página, a função `loadGoogleMapsApi` solicita a chave da API e a utiliza para carregar o mapa.
2. **Exibição da Localização Inicial**: A função `initMap` exibe o mapa com a posição inicial do usuário e um círculo de raio de segurança de 5 km.
3. **Ajuste do Raio de Segurança**: O controle deslizante permite ao usuário ajustar o raio de segurança, e o círculo no mapa se ajusta automaticamente.
4. **Atualização da Localização do Colete**: A cada 10 segundos, a aplicação consulta o servidor para obter a localização mais recente do colete e atualizar o marcador no mapa. Se o colete estiver fora do raio de segurança, o status é exibido em vermelho, caso contrário, ele é exibido em verde.

### Como Funciona a Integração

- **Interação com o backend**: A comunicação entre o front-end e o backend é feita via HTTP, com o front-end fazendo requisições GET e POST para os endpoints do backend (`/api/location`, `/api/msg`, etc.). O backend armazena e processa as coordenadas GPS recebidas e as envia ao front-end quando solicitado.
- **Exibição de Localização**: O front-end exibe o marcador da localização mais recente do colete no mapa e ajusta o zoom com base no raio de segurança. O status do colete é mostrado com base na comparação da distância entre o ponto do colete e o centro do raio.

---

Esse sistema permite rastrear a posição de um colete via GPS e visualizar sua situação em tempo real, com feedback sobre a segurança do colete em relação a um raio de segurança definido pelo usuário.
