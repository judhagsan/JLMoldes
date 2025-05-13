// /home/judhagsan/JLMoldes/websocket-server.js
const WebSocket = require("ws");

const PORT = process.env.WS_PORT || 8080; // Use a mesma porta do NEXT_PUBLIC_WEBSOCKET_URL (sem o ws://)

const wss = new WebSocket.Server({ port: PORT });

console.log(`Servidor WebSocket iniciado na porta ${PORT}`);

// Guardar clientes conectados
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Novo cliente conectado. Total:", clients.size);

  ws.on("message", (message) => {
    console.log("Mensagem recebida do cliente: %s", message);

    broadcast(message, ws);
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Cliente desconectado. Total:", clients.size);
  });

  ws.on("error", (error) => {
    console.error("Erro no WebSocket do cliente:", error);
    clients.delete(ws); // Remove em caso de erro também
  });

  ws.send(
    JSON.stringify({
      type: "INFO",
      payload: "Conectado ao servidor WebSocket local!",
    }),
  );
});

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

const http = require("http");

const httpServer = http.createServer(async (req, res) => {
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
    res.writeHead(404);
    res.end();
  }
});

const HTTP_PORT = parseInt(PORT) + 1; // Roda o servidor HTTP em uma porta diferente
httpServer.listen(HTTP_PORT, () => {
  console.log(
    `Servidor HTTP para notificações WebSocket rodando em http://localhost:${HTTP_PORT}`,
  );
});

module.exports = { broadcast }; // Exporte se for usar em um servidor Next.js customizado
