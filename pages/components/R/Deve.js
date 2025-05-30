import React, { useEffect, useState, useCallback, useRef } from "react";
import Execute from "models/functions";
import Use from "models/utils";
import { useWebSocket } from "../../../contexts/WebSocketContext.js"; // Ajuste o caminho se necessário

const sortDadosByDate = (dataArray) =>
  [...dataArray].sort((a, b) => new Date(a.data) - new Date(b.data));

const Deve = ({ codigo, r }) => {
  const [dados, setDados] = useState([]);
  const { lastMessage } = useWebSocket();
  const lastProcessedTimestampRef = useRef(null);

  const loadData = useCallback(async () => {
    if (typeof r === "undefined" || r === null) {
      setDados([]); // Limpa os dados se 'r' não for válido
      return;
    }
    const data = await Execute.receiveFromDeve(r);
    if (Array.isArray(data)) {
      setDados(sortDadosByDate(data));
    } else {
      console.warn(
        "Deve.js: 'receiveFromDeve' não retornou um array como esperado. Recebido:",
        data,
      );
      setDados([]);
    }
  }, [r]);

  useEffect(() => {
    loadData(); // Busca inicial
  }, [loadData, codigo]); // Depende de loadData e codigo

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

      // console.log("Deve.js: Mensagem WebSocket recebida.", type, payload, "Prop r:", r);

      switch (type) {
        case "DEVE_NEW_ITEM":
          if (payload && String(payload.r) === String(r)) {
            // Compara 'r' como strings
            setDados((prevDados) => {
              // Verifica se o item já existe pelo ID (ou outro identificador único)
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
        case "DEVE_DELETED_ITEM": // Payload é { codigo: "some-codigo" }
          if (
            payload &&
            payload.codigo !== undefined &&
            payload.codigo !== null
          ) {
            setDados((prevDados) => {
              // Remove o item se o código corresponder
              const itemExistsInTable = prevDados.some(
                (item) => String(item.codigo) === String(payload.codigo),
              );
              if (itemExistsInTable) {
                return sortDadosByDate(
                  prevDados.filter(
                    (item) => String(item.codigo) !== String(payload.codigo),
                  ),
                );
              }
              return prevDados;
            });
          }
          break;
        // TODO: Adicionar case para "DEVE_UPDATED_ITEM" se o backend notificar
        default:
          break;
      }
      lastProcessedTimestampRef.current = lastMessage.timestamp;
    }
  }, [lastMessage, r, setDados]); // Depende de lastMessage, r, e setDados

  return (
    <div className="overflow-x-auto rounded-box border border-secondary bg-base-100">
      <table className="table table-xs">
        <thead>
          <tr>
            <th className="hidden">ID</th>
            <th className="w-36">Data</th>
            <th className="hidden">CODIGO</th>
            <th>Nome</th>
            <th>V. Papel</th>
            <th>V. Comissão</th>
            <th className="w-20">Deve</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr
              key={item.id}
              className={
                item.codigo === codigo
                  ? "bg-green-200"
                  : "border-b border-secondary"
              }
            >
              <td className="hidden">{item.id}</td>
              <td>{Use.formatarDataHora(item.data)}</td>
              <td className="hidden">{item.codigo}</td>
              <td>{item.nome}</td>
              <td>$ {Number(item.valorpapel).toFixed(2)}</td>
              <td>$ {Number(item.valorcomissao).toFixed(2)}</td>
              <td>$ {Number(item.valor).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Deve;
