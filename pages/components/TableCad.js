import React, { useState, useEffect, useRef } from "react";
import EditM from "./Edit";
import { useWebSocket } from "../../contexts/WebSocketContext";

const TableCad = () => {
  const [cadastroData, setCadastroData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const lastProcessedTimestampRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/v1/tables/cadastro");
        if (!response.ok) throw new Error("Erro ao buscar dados");
        const data = await response.json();
        const receivedData = Array.isArray(data.rows) ? data.rows : [];
        setCadastroData(receivedData);
      } catch (error) {
        console.error("Erro na requisição:", error);
        setCadastroData([]);
      }
    };
    fetchData();
  }, []);

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage && lastMessage.data && lastMessage.timestamp) {
      if (
        lastProcessedTimestampRef.current &&
        lastMessage.timestamp <= lastProcessedTimestampRef.current
      ) {
        console.log(
          "TableCad.js: Ignorando mensagem WebSocket já processada (mesmo timestamp). Timestamp:",
          lastMessage.timestamp,
        );
        return;
      }

      const { type, payload } = lastMessage.data;
      console.log(
        "TableCad.js: Mensagem WebSocket recebida:",
        type,
        payload,
        "Timestamp:",
        lastMessage.timestamp,
      );

      switch (type) {
        case "CADASTRO_NEW_ITEM":
          if (payload) {
            setCadastroData((prevData) => {
              if (prevData.find((item) => item.id === payload.id)) {
                return prevData.map((item) =>
                  item.id === payload.id ? payload : item,
                );
              }
              return [...prevData, payload];
            });
          }
          break;

        case "CADASTRO_UPDATED_ITEM":
          if (payload) {
            setCadastroData((prevData) =>
              prevData.map((item) =>
                item.id === payload.id ? { ...item, ...payload } : item,
              ),
            );
            if (editingId === payload.id) {
              setEditingId(null);
            }
          }
          break;

        case "CADASTRO_DELETED_ITEM":
          if (payload && payload.id !== undefined) {
            const idToRemove = payload.id;
            setCadastroData((prevData) =>
              prevData.filter((item) => item.id !== idToRemove),
            );
            if (editingId === idToRemove) {
              setEditingId(null);
            }
          }
          break;

        default:
          break;
      }

      lastProcessedTimestampRef.current = lastMessage.timestamp;
      console.log(
        "TableCad.js: Timestamp da última mensagem processada atualizado para:",
        lastMessage.timestamp,
      );
    }
  }, [lastMessage, editingId]);

  const deleteTableRecord = async (id) => {
    try {
      const response = await fetch("/api/v1/tables/cadastro", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error("Erro ao excluir cadastro:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditedData({ ...item });
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/v1/tables/cadastro", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erro ao atualizar cadastro (API: ${response.status}): ${errorText}`,
        );
      }
      // Edição será fechada via mensagem WebSocket
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      <table className="table table-xs">
        <thead>
          <tr>
            <th className="hidden">ID</th>
            <th>Região/País</th>
            <th>Código</th>
            <th>Facebook</th>
            <th>Instagram</th>
            <th>Email</th>
            <th>Whatsapp 1</th>
            <th>Whatsapp 2</th>
            <th>Nome</th>
            <th>Grupo</th>
            <th>Observações</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {cadastroData.map((item) => (
            <tr key={item.id} className="text-center">
              <td className="hidden">{item.id}</td>
              {/* Região/País */}
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedData.regiao}
                    onChange={(e) =>
                      handleInputChange("regiao", e.target.value)
                    }
                    className="input input-xs p-0 m-0 text-center"
                  />
                ) : (
                  item.regiao
                )}
              </td>
              {/* Código */}
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedData.codigo}
                    onChange={(e) =>
                      handleInputChange("codigo", e.target.value)
                    }
                    className="input input-xs p-0 m-0 text-center"
                  />
                ) : (
                  item.codigo
                )}
              </td>
              {/* Facebook */}
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedData.facebook}
                    onChange={(e) =>
                      handleInputChange("facebook", e.target.value)
                    }
                    className="input input-xs p-0 m-0 text-center"
                  />
                ) : (
                  item.facebook
                )}
              </td>
              {/* Instagram */}
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedData.instagram}
                    onChange={(e) =>
                      handleInputChange("instagram", e.target.value)
                    }
                    className="input input-xs p-0 m-0 text-center"
                  />
                ) : (
                  item.instagram
                )}
              </td>
              {/* Email */}
              <td>
                {editingId === item.id ? (
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="input input-xs p-0 m-0 text-center"
                  />
                ) : (
                  item.email
                )}
              </td>
              {/* Whatsapp 1 */}
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedData.whatsapp1}
                    onChange={(e) =>
                      handleInputChange("whatsapp1", e.target.value)
                    }
                    className="input input-xs p-0 m-0 text-center"
                  />
                ) : (
                  item.whatsapp1
                )}
              </td>
              {/* Whatsapp 2 */}
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedData.whatsapp2}
                    onChange={(e) =>
                      handleInputChange("whatsapp2", e.target.value)
                    }
                    className="input input-xs p-0 m-0 text-center"
                  />
                ) : (
                  item.whatsapp2
                )}
              </td>
              {/* Nome */}
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    className="input input-xs p-0 m-0 text-center"
                  />
                ) : (
                  item.nome
                )}
              </td>
              {/* Grupo */}
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedData.grupo}
                    onChange={(e) => handleInputChange("grupo", e.target.value)}
                    className="input input-xs p-0 m-0 text-center"
                  />
                ) : (
                  item.grupo
                )}
              </td>
              {/* Observações */}
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedData.observacao}
                    onChange={(e) =>
                      handleInputChange("observacao", e.target.value)
                    }
                    className="input input-xs p-0 m-0 text-center"
                  />
                ) : (
                  item.observacao
                )}
              </td>
              {/* Ações */}
              <td className="px-0">
                <EditM
                  isEditing={editingId === item.id}
                  onEdit={() => startEditing(item)}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
                <button
                  className={`btn btn-xs btn-soft btn-error ${editingId === item.id ? "hidden" : ""}`}
                  onClick={() => deleteTableRecord(item.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableCad;
