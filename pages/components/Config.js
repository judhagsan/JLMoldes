import Edit from "./Edit";
import Execute from "models/functions";
import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../../contexts/WebSocketContext"; // Assuming this is the correct path

const Config = () => {
  const [result, setResult] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const lastProcessedTimestampRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await Execute.receiveFromConfig();
      setResult(data);
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
          "Config.js: Ignorando mensagem WebSocket já processada (mesmo timestamp). Timestamp:",
          lastMessage.timestamp,
        );
        return;
      }

      const { type, payload } = lastMessage.data;
      console.log(
        "Config.js: Mensagem WebSocket recebida:",
        type,
        payload,
        "Timestamp:",
        lastMessage.timestamp,
      );

      switch (type) {
        case "CONFIG_UPDATED_ITEM":
          if (payload) {
            setResult([payload]);
            if (editingId === payload.id) {
              setEditingId(null);
            }
          }
          break;
        default:
          console.log("Tipo de mensagem desconhecido:", type);
      }

      lastProcessedTimestampRef.current = lastMessage.timestamp;
    }
  }, [lastMessage, editingId]);

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditedData({ ...item });
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/v1/tables/Config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const configData = result[0] || {};
  const isEditing = editingId === configData.id;

  return (
    <table className="join table table-xs">
      <tbody>
        <tr>
          <td className="join-item inline-flex mr-1 badge badge-info badge-outline">
            Multiplicador:
            {isEditing ? (
              <input
                type="number"
                value={editedData.m || 0}
                onChange={(e) => handleInputChange("m", e.target.value)}
                className="input input-xs w-10 text-center ml-1"
              />
            ) : (
              <span>{configData.m || 0}</span>
            )}
          </td>

          <td className="join-item inline-flex mr-1 badge badge-warning badge-outline">
            Comissão:
            {isEditing ? (
              <input
                type="number"
                value={editedData.e || 0}
                onChange={(e) => handleInputChange("e", e.target.value)}
                className="input input-xs w-10 text-center ml-1"
              />
            ) : (
              <span>{configData.e || 0}</span>
            )}
          </td>

          <td className="join-item inline-flex mr-1 badge badge-primary badge-outline">
            Desperdício:
            {isEditing ? (
              <input
                type="number"
                value={editedData.d || 0}
                onChange={(e) => handleInputChange("d", e.target.value)}
                className="input input-xs w-10 text-center ml-1"
              />
            ) : (
              <span>{configData.d || 0}</span>
            )}
          </td>

          <td className="join-item inline-flex">
            <Edit
              isEditing={isEditing}
              onEdit={() => startEditing(configData)}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default Config;
