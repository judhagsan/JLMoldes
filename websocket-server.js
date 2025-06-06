// /home/judhagsan/JLMoldes/websocket-server.js
const WebSocket = require("ws");
const http = require("http");

const PORT = process.env.PORT || 8080;

// Guardar clientes conectados
const clients = new Set();

// Função para transmitir mensagens para todos os clientes (exceto o remetente, opcionalmente)
function broadcast(message, sender) {
  let parsedMessage;
  try {
    // Se a mensagem já for um objeto/string JSON, use-a. Se for Buffer, converta.
    parsedMessage = typeof message === "string" ? message : message.toString();
  } catch (e) {
    console.error("Erro ao parsear mensagem para broadcast:", e);
    return;
  }

  clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      try {
        client.send(parsedMessage);
      } catch (e) {
        console.error("Erro ao enviar mensagem para cliente:", e);
        clients.delete(client); // Remove cliente com erro
      }
    }
  });
}

// Criar servidor HTTP
const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        console.log("Recebido POST em /broadcast:", body);
        const messageToBroadcast = JSON.parse(body); // Espera-se que a API envie um JSON
        broadcast(JSON.stringify(messageToBroadcast)); // Broadcast para clientes WS
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success", message: "Broadcasted" }));
      } catch (e) {
        console.error("Erro ao processar /broadcast:", e);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "error", message: "Invalid JSON" }));
      }
    });
  } else {
    // Para qualquer outra requisição HTTP que não seja /broadcast, retorne 404
    // O WebSocket server cuidará das requisições de upgrade para WebSocket
    res.writeHead(404);
    res.end();
  }
});

// Anexar o WebSocket.Server ao servidor HTTP
const wss = new WebSocket.Server({ server });

console.log(`Servidor HTTP e WebSocket iniciado na porta ${PORT}`);

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Novo cliente WebSocket conectado. Total:", clients.size);

  ws.on("message", (message) => {
    console.log("Mensagem recebida do cliente WebSocket: %s", message);
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Cliente WebSocket desconectado. Total:", clients.size);
  });

  ws.on("error", (error) => {
    console.error("Erro no WebSocket do cliente:", error);
    clients.delete(ws);
  });

  ws.send(
    JSON.stringify({
      type: "INFO",
      payload: "Conectado ao servidor WebSocket!",
    }),
  );
});

server.listen(PORT, () => {
  console.log(`Servidor HTTP e WebSocket escutando na porta ${PORT}`);
});

module.exports = { broadcast, server, wss }; // Exporte se for usar em um servidor Next.js customizado
