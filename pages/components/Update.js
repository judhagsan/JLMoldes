import React from "react";
import { useWebSocket } from "../../contexts/WebSocketContext";
import {
  CheckCircleFillIcon,
  XCircleFillIcon,
  BroadcastIcon,
} from "@primer/octicons-react";

const Update = () => {
  const { isConnected, socket } = useWebSocket();

  let statusIndicator;
  let statusText = "Desconectado";
  let statusColor = "text-error"; // Cor padrão para desconectado

  if (socket && socket.readyState === WebSocket.CONNECTING) {
    statusIndicator = <BroadcastIcon size={16} className="animate-pulse" />;
    statusText = "Conectando...";
    statusColor = "text-warning";
  } else if (isConnected && socket && socket.readyState === WebSocket.OPEN) {
    statusIndicator = <CheckCircleFillIcon size={16} />;
    statusText = "Tempo Real";
    statusColor = "text-success";
  } else {
    // Desconectado ou erro
    statusIndicator = <XCircleFillIcon size={16} />;
    // statusText já é "Desconectado"
  }

  return (
    <>
      <div
        className={`inline-flex items-center ml-2 tooltip tooltip-bottom ${statusColor}`}
        data-tip={statusText}
      >
        {statusIndicator}
      </div>
    </>
  );
};

export default Update;
