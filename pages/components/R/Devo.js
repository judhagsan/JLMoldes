/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useRef } from "react";
import Execute from "models/functions";
import Use from "models/utils"; // Descomentado para usar Use.formatarDataHora
import { useWebSocket } from "../../../contexts/WebSocketContext.js";

const sortDadosByDate = (dataArray) =>
  [...dataArray].sort((a, b) => new Date(a.data) - new Date(b.data));

const Devo = ({ codigo, r }) => {
  const [dados, setDados] = useState([]);
  const { lastMessage } = useWebSocket();
  const lastProcessedTimestampRef = useRef(null);

  const loadData = useCallback(async () => {
    if (typeof r === "undefined" || r === null) {
      setDados([]);
      return;
    }
    const data = await Execute.receiveFromDevo(r);
    if (Array.isArray(data)) {
      setDados(sortDadosByDate(data));
    } else {
      console.warn(
        "Devo.js: 'receiveFromDevo' não retornou um array como esperado. Recebido:",
        data,
      );
      setDados([]);
    }
  }, [r]);

  useEffect(() => {
    loadData(); // Busca inicial
  }, [loadData, codigo]);

  // Efeito para lidar com mensagens WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.data && lastMessage.timestamp) {
      if (
        lastProcessedTimestampRef.current &&
        lastMessage.timestamp <= lastProcessedTimestampRef.current
      ) {
        return; // Ignora mensagem já processada
      }

      const { type, payload } = lastMessage.data;

      switch (type) {
        case "DEVO_NEW_ITEM":
          if (payload && String(payload.r) === String(r)) {
            setDados((prevDados) => {
              if (
                !prevDados.find(
                  (item) => String(item.id) === String(payload.id),
                )
              ) {
                return sortDadosByDate([...prevDados, payload]);
              }
              return prevDados; // Item já existe
            });
          }
          break;
        case "DEVO_DELETED_ITEM":
          if (
            payload &&
            payload.codigo !== undefined &&
            String(payload.r) === String(r)
          ) {
            // Verifica também o 'r' para relevância
            setDados((prevDados) =>
              sortDadosByDate(
                prevDados.filter(
                  (item) => String(item.codigo) !== String(payload.codigo),
                ),
              ),
            );
          }
          break;
        // TODO: Adicionar case para "DEVO_UPDATED_ITEM" se o backend notificar
        default:
          break;
      }
      lastProcessedTimestampRef.current = lastMessage.timestamp;
    }
  }, [lastMessage, r, setDados]);

  return (
    <div className="overflow-x-auto rounded-box border w-62 mt-1 border-error bg-base-100">
      <table className="table table-xs">
        <thead>
          <tr>
            <th className="hidden">ID</th>
            <th className="w-36">Data</th>
            <th className="hidden">CODIGO</th>
            <th>Nome</th>
            <th className="w-20">Devo</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr
              key={item.id}
              className={
                item.codigo === codigo ? "bg-red-200" : "border-b border-error"
              }
            >
              <td className="hidden">{item.id}</td>
              <td>{Use.formatarDataHora(item.data)}</td>
              <td className="hidden">{item.codigo}</td>
              <td>{item.nome}</td>
              <td>$ {Number(item.valor).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Devo;
