import { useState, useEffect } from "react";
import Execute from "models/functions";
import { useWebSocket } from "../../../contexts/WebSocketContext.js"; // Importar o hook WebSocket

const TableDec = ({ r }) => {
  const [decData, setDecData] = useState([]);
  const { lastMessage } = useWebSocket(); // Usar o hook WebSocket

  // Função para ordenar os dados por 'dec'
  const sortDecData = (dataArray) => {
    if (!Array.isArray(dataArray)) return [];
    return [...dataArray].sort((a, b) => {
      if (a.dec < b.dec) return -1;
      if (a.dec > b.dec) return 1;
      return 0;
    });
  };

  // Busca os dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      if (r) {
        try {
          const data = await Execute.receiveFromDec(r);
          setDecData(sortDecData(data || [])); // Ordena os dados iniciais
        } catch (error) {
          console.error("Erro ao buscar dados Dec para tabela:", error);
          setDecData([]);
        }
      } else {
        setDecData([]);
      }
    };

    fetchData();
  }, [r]);

  // Lida com atualizações via WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      const { type, payload } = lastMessage.data;

      if (type === "DEC_UPDATED_ITEM" && payload) {
        if (
          payload.r !== undefined &&
          payload.dec !== undefined &&
          String(payload.r) === String(r)
        ) {
          setDecData((prevData) =>
            sortDecData(
              // Ordena após a atualização
              prevData.map((item) =>
                item.r === payload.r && item.dec === payload.dec
                  ? { ...item, ...payload }
                  : item,
              ),
            ),
          );
        }
      }
    }
  }, [lastMessage, r, setDecData]); // Added setDecData to dependency array as it's used.

  const handleToggleOn = async (itemToToggle) => {
    const updatePayload = {
      on: !itemToToggle.on,
      r: itemToToggle.r,
      dec: itemToToggle.dec,
    };

    try {
      const response = await fetch("/api/v1/tables/dec", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(
          `Erro ao atualizar Dec item (${response.status}): ${errorData}`,
        );
      }
    } catch (error) {
      console.error("Erro ao enviar atualização para Dec item:", error);
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-box border border-info bg-base-100">
        <table className="table table-xs text-center">
          <thead>
            <tr>
              <th>Off/On</th>
              <th>Dec</th>
              <th>Base</th>
              <th>Sis</th>
              <th>Alt</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {decData.map((item) => (
              // Usar item.id como chave se for o PK e sempre presente
              <tr
                key={item.id || `${item.r}-${item.dec}`}
                className="border-b border-info"
              >
                <td>
                  <button
                    className={`btn btn-xs btn-soft ${
                      item.on ? "btn-success" : "btn-error" // Verde para On, Vermelho para Off
                    } w-full`}
                    onClick={() => handleToggleOn(item)}
                  >
                    {item.on ? "On" : "Off"}
                  </button>
                </td>
                <td>{item.dec}</td>
                <td>{item.base || 0}</td>
                <td>{item.sis || 0}</td>
                <td>{item.alt || 0}</td>
                <td>
                  {Number(item.base || 0) +
                    Number(item.sis || 0) +
                    Number(item.alt || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TableDec;
