import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider = ({ children, url }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const connect = useCallback(() => {
    console.log("Tentando conectar ao WebSocket em:", url);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket conectado a", url);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Mensagem recebida do WebSocket:", message);
        setLastMessage({ data: message, timestamp: new Date().getTime() });
      } catch (error) {
        console.error(
          "Erro ao processar mensagem WebSocket:",
          event.data,
          error,
        );
        setLastMessage({
          data: event.data,
          timestamp: new Date().getTime(),
          error: true,
        });
      }
    };

    ws.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket desconectado:", event.reason, "Code:", event.code);
      setIsConnected(false);
      setSocket(null);
    };

    setSocket(ws);
  }, [url]);

  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      if (
        socket &&
        (socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING)
      ) {
        console.log("Fechando WebSocket ao desmontar o provider.");
        socket.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, connect]);

  const sendMessage = useCallback(
    (message) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      } else {
        console.warn(
          "WebSocket não está conectado. Mensagem não enviada:",
          message,
        );
      }
    },
    [socket],
  );

  return (
    <WebSocketContext.Provider
      value={{ socket, isConnected, lastMessage, sendMessage, connect }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
