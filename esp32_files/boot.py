import machine
from time import sleep
import uasyncio as asyncio
from micropyGPS import MicropyGPS

def dms_to_decimal(degrees, minutes, hemisphere):
    decimal = degrees + (minutes / 60)
    
    # Verifica o hemisfério para definir o sinal
    if hemisphere in ['S', 'W']:  # Sul ou Oeste são negativos
        decimal = -decimal
    
    return decimal

# Função para ler o GPS e enviar a mensagem
async def ler_gps():
    my_gps = MicropyGPS()
    gps_serial = machine.UART(2, baudrate=9600, tx=15, rx=4)  # Configurar pinos UART para GPS
    
    while True:
        try:
            if gps_serial.any():
                data = gps_serial.read()
                for byte in data:
                    stat = my_gps.update(chr(byte))
                    if stat is not None:
                        latitude_dms = my_gps.latitude
                        longitude_dms = my_gps.longitude
                        # Convertendo para decimal
                        latitude_decimal = dms_to_decimal(latitude_dms[0], latitude_dms[1], latitude_dms[2])
                        longitude_decimal = dms_to_decimal(longitude_dms[0], longitude_dms[1], longitude_dms[2])
                        
                        # Enviar a mensagem com as coordenadas
                        if await enviarmensagem(f"latitude: {latitude_decimal} longitude: {longitude_decimal}", "SEU_NUMERO"):
                            await asyncio.sleep(15)  # Espera de 30 segundos
                        else:
                            await asyncio.sleep(1)  # Espera de 1 segundo
        except Exception as e:
            print(f"Erro ao ler GPS: {e}")

# Função para enviar mensagem SMS
async def enviarmensagem(mensagem, numero):
    # Inicializar o SIM800L e enviar o SMS
    if await inicializar_modulo():
        return await enviar_sms(numero, mensagem)
    return False

# Função para enviar comandos AT ao SIM800L
async def enviar_comando_at(comando, resposta_esperada='OK', timeout=2000):
    uart = machine.UART(1, baudrate=9600, tx=17, rx=16)
    uart.write(comando + '\r\n')
    await asyncio.sleep(1)
    resposta = uart.read()
    if resposta and resposta_esperada in str(resposta):
        return True
    return False

# Função para inicializar o módulo SIM800L
async def inicializar_modulo():
    
    if await enviar_comando_at('AT', 'OK'):
        print("SIM800L está respondendo.")
    else:
        print("Erro de comunicação com o SIM800L.")
        return False
    return True

# Função para enviar SMS
async def enviar_sms(numero, mensagem):
    # Definir o modo de texto para o SMS
    if not await enviar_comando_at('AT+CMGF=1', 'OK'):
        print("Falha ao definir modo texto.")
        return False
    
    # Definir o número de destino
    comando_sms = f'AT+CMGS="{numero}"'
    if not await enviar_comando_at(comando_sms, '>'):
        print("Falha ao definir número de destino.")
        return False
    
    # Enviar a mensagem
    uart = machine.UART(1, baudrate=9600, tx=17, rx=16)
    uart.write(mensagem.encode() + b'\x1A')  # Envia a mensagem seguida de CTRL+Z (0x1A)
    
    # Espera por resposta
    await asyncio.sleep(5)  # Aumente o tempo para garantir que a resposta seja recebida
    resposta = uart.read()
    
    if resposta:
        print("Resposta do SIM800L:", resposta)
        if b'OK' in resposta:
            print("SMS enviado com sucesso!")
            return True
        elif b'ERROR' in resposta:
            print("Falha ao enviar SMS: ERROR")
            return False
        else:
            print("Resposta inesperada ao enviar SMS.")
            return False
    else:
        print("Sem resposta do SIM800L.")
        return False

# Função principal para iniciar as tarefas
async def main():
    # Inicializar tarefas assíncronas
    await asyncio.gather(
        ler_gps(),  # Tarefa que lê o GPS
    )

# Rodar a função principal
asyncio.run(main())


