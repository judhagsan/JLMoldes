import React, { useEffect, useState, useCallback, useRef } from "react";
import Execute from "models/functions";
import Use from "models/utils";
import { useWebSocket } from "../../../contexts/WebSocketContext.js";

const sortDadosByDate = (
  dataArray, // Keep this helper function
) => [...dataArray].sort((a, b) => new Date(a.data) - new Date(b.data));
const Pendente = ({ r: propR, onSelectItem }) => {
  const [dados, setDados] = useState([]);
  const { lastMessage } = useWebSocket();
  const lastProcessedTimestampRef = useRef(null);

  // loadData function remains the same
  const loadData = useCallback(async () => {
    const rawData = await Execute.receiveFromTemp();
    if (Array.isArray(rawData)) {
      const filteredData = propR
        ? rawData.filter((item) => String(item.r) === String(propR))
        : rawData;
      setDados(sortDadosByDate(filteredData));
    } else {
      console.warn(
        "Pendente.js: 'receiveFromTemp' não retornou um array como esperado. Recebido:",
        rawData,
      );
      setDados([]);
    }
  }, [propR]);

  // useEffect for initial load remains the same
  useEffect(() => {
    loadData();
  }, [loadData]);

  // useEffect for WebSocket remains the same, but ensure it uses propR
  useEffect(() => {
    if (lastMessage && lastMessage.data && lastMessage.timestamp) {
      if (
        lastProcessedTimestampRef.current &&
        lastMessage.timestamp <= lastProcessedTimestampRef.current
      ) {
        return;
      }

      const { type, payload } = lastMessage.data;

      switch (type) {
        case "TEMP_NEW_ITEM":
          if (payload && (!propR || String(payload.r) === String(propR))) {
            setDados((prevDados) => {
              if (
                !prevDados.find(
                  (item) => String(item.id) === String(payload.id),
                )
              ) {
                return sortDadosByDate([...prevDados, payload]);
              }
              return prevDados;
            });
          }
          break;
        case "TEMP_DELETED_ITEM": // Assuming payload is { id: "temp-id" }
          if (payload && payload.id !== undefined) {
            setDados((prevDados) =>
              sortDadosByDate(
                prevDados.filter(
                  (item) => String(item.id) !== String(payload.id),
                ),
              ),
            );
          }
          break;
        default:
          break;
      }
      lastProcessedTimestampRef.current = lastMessage.timestamp; // Update timestamp
    }
  }, [lastMessage, propR, setDados]);

  const handleDeleteItem = useCallback(
    async (itemId) => {
      try {
        await Execute.removeTemp(itemId);

        //    a lógica de filtro é idempotente e não causará problemas.
        setDados((prevDados) =>
          sortDadosByDate(
            prevDados.filter((item) => String(item.id) !== String(itemId)),
          ),
        );
      } catch (error) {
        console.error("Erro ao excluir item pendente:", error);
      }
    },
    [setDados],
  );
  return (
    <div className="overflow-x-auto rounded-box border border-warning bg-base-100">
      <table className="table table-xs">
        <thead>
          <tr>
            <th className="hidden">ID</th>
            <th className="w-36">Data</th>
            <th>Nome</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={item.id} className="border-b border-warning bg-warning/50">
              <td className="hidden">{item.id}</td>
              <td>{Use.formatarDataHora(item.data)}</td>
              <td>{item.nome}</td>
              <td>
                {(() => {
                  let sum = 0;
                  for (let i = 1; i <= 28; i++) {
                    const propName = `v${String(i).padStart(2, "0")}`;
                    sum += Number(item[propName]) || 0;
                  }
                  const multiplier = Number(item.multi);
                  return sum * (isNaN(multiplier) ? 1 : multiplier);
                })() +
                  (Number(item.comissao) || 0) * 5}
              </td>
              <td>
                <button
                  className="btn btn-xs btn-soft btn-primary"
                  onClick={() => {
                    onSelectItem(item);
                    handleDeleteItem(item.id);
                  }}
                >
                  Mostrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pendente;
