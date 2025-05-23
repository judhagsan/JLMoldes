import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Execute from "models/functions";
import Edit from "../Edit";
import Use from "models/utils";
import { useWebSocket } from "../../../contexts/WebSocketContext.js"; // Ajuste o caminho se necessário

const formatCurrency = (value) => {
  const number = parseFloat(value); // Use parseFloat para números decimais
  return isNaN(number) ? "0.00" : number.toFixed(2);
};

const Coluna = ({ r }) => {
  const [dados, setDados] = useState([]);
  // groupedResults será derivado de 'dados' usando useMemo
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState([]); // Dados da tabela R
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const { lastMessage } = useWebSocket();
  const lastProcessedTimestampRef = useRef(null);

  const handleSave = async (editedData) => {
    try {
      const response = await fetch("/api/v1/tables/c", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");
      setEditingId(null);
      // A atualização do estado 'dados' virá via mensagem WebSocket (C_UPDATED_ITEM)
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const fetchData = async () => {
    try {
      if (typeof r === "undefined" || r === null) return;
      const results = await Execute.receiveFromC(r);
      const existsData = await Execute.receiveFromR(r);
      setDados(
        Array.isArray(results)
          ? results.sort((a, b) => new Date(a.date) - new Date(b.date))
          : [],
      );
      setExists(Array.isArray(existsData) ? existsData : []);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const memoizedFetchData = useCallback(fetchData, [r]);

  useEffect(() => {
    memoizedFetchData();
  }, [memoizedFetchData]);

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

      // --- Lida com atualizações na tabela C (dados principais) ---
      if (
        // Condição para C_NEW_ITEM e C_UPDATED_ITEM: requer 'r' no payload
        ((type === "C_NEW_ITEM" || type === "C_UPDATED_ITEM") &&
          payload &&
          String(payload.r) === String(r)) ||
        // Condição para C_DELETED_ITEM: requer apenas 'id' no payload
        (type === "C_DELETED_ITEM" && payload && payload.id !== undefined)
      ) {
        setDados((prevDadosC) => {
          let newDadosC = [...prevDadosC];

          const itemIndex =
            payload.id !== undefined
              ? newDadosC.findIndex(
                  (item) => String(item.id) === String(payload.id),
                )
              : -1;

          switch (type) {
            case "C_NEW_ITEM":
              if (itemIndex === -1) newDadosC.push(payload);
              break;
            case "C_UPDATED_ITEM":
              if (itemIndex !== -1) {
                newDadosC[itemIndex] = {
                  ...newDadosC[itemIndex],
                  ...payload,
                };
              } else {
                newDadosC.push(payload); // Adiciona se não existir
              }
              if (editingId === payload.id) setEditingId(null); // Fecha edição
              break;
            case "C_DELETED_ITEM":
              newDadosC = newDadosC.filter(
                (item) => String(item.id) !== String(payload.id),
              );
              if (editingId === payload.id) setEditingId(null);
              break;
            // default: não é estritamente necessário aqui devido ao if externo.
          }
          return newDadosC.sort((a, b) => new Date(a.date) - new Date(b.date));
        });
      }

      // --- Lida com atualizações na tabela R (dados 'exists') ---
      if (
        type === "BSA_NEW_ITEM" ||
        type === "BSA_UPDATED_ITEM" ||
        type === "BSA_DELETED_ITEM"
      ) {
        if (payload && String(payload.r) === String(r)) {
          setExists((prevExists) => {
            let newExists = [...prevExists];
            const itemIndex = newExists.findIndex(
              (item) => String(item.id) === String(payload.id),
            );

            switch (type) {
              case "BSA_NEW_ITEM":
                if (itemIndex === -1) newExists.push(payload);
                break;
              case "BSA_UPDATED_ITEM":
                if (itemIndex !== -1)
                  newExists[itemIndex] = {
                    ...newExists[itemIndex],
                    ...payload,
                  };
                else newExists.push(payload);
                break;
              case "BSA_DELETED_ITEM":
                newExists = newExists.filter(
                  (item) => String(item.id) !== String(payload.id),
                );
                break;
            }
            return newExists;
          });
        }
      }

      lastProcessedTimestampRef.current = lastMessage.timestamp;
    }
  }, [lastMessage, r, editingId, setDados, setExists]); // Adicionado setDados e setExists

  const groupedResults = useMemo(() => {
    return dados.reduce((acc, item) => {
      const rawDate = Use.formatarData(item.date);
      const dateObj = new Date(item.date);
      const horas = String(dateObj.getHours()).padStart(2, "0");
      const minutos = String(dateObj.getMinutes()).padStart(2, "0");
      const horaFormatada = `${horas}:${minutos}`;

      acc[rawDate] = acc[rawDate] || [];
      acc[rawDate].push({
        ...item,
        horaSeparada: horaFormatada,
        // Garante que os valores numéricos sejam tratados corretamente
        valor: parseFloat(item.valor) || 0,
        pix: parseFloat(item.pix) || 0,
        real: parseFloat(item.real) || 0,
        base: parseFloat(item.base) || 0,
        sis: parseFloat(item.sis) || 0,
        alt: parseFloat(item.alt) || 0,
      });
      return acc;
    }, {});
  }, [dados]);

  if (loading) {
    return <div className="text-center p-4">Carregando...</div>;
  }

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    // Garante que os valores em editedData sejam strings para os inputs controlados,
    // e que 'real' e 'pix' comecem formatados como string.
    // Os valores de 'item' aqui vêm de 'groupedResults', onde já foram
    // processados com parseFloat e podem ser números.
    setEditedData({
      ...item,
      nome: String(item.nome !== undefined ? item.nome : ""),
      base: String(item.base !== undefined ? item.base : "0"),
      sis: String(item.sis !== undefined ? item.sis : "0"),
      alt: String(item.alt !== undefined ? item.alt : "0"),
      // formatCurrency já retorna uma string.
      real: formatCurrency(item.real !== undefined ? item.real : 0),
      pix: formatCurrency(item.pix !== undefined ? item.pix : 0),
    });
  };

  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      {Object.entries(groupedResults).map(([date, items]) => {
        // Calcula os totais para cada dia
        const totalReal = items.reduce(
          (sum, item) => sum + (parseFloat(item.real) || 0),
          0,
        );
        const totalPix = items.reduce(
          (sum, item) => sum + (parseFloat(item.pix) || 0),
          0,
        );
        const totalDia = totalReal + totalPix;

        return (
          <div key={date} className="mb-2">
            {/* Cabeçalho com a data */}
            <div className="font-bold text-sm bg-gray-200 text-center p-1">
              {date}
            </div>

            {/* Tabela para os itens da data */}
            <table className="table table-xs w-full">
              <thead>
                {/* Linha para o total geral do dia */}
                <tr>
                  <th colSpan={6}></th>
                  <th colSpan={2} className="text-center text-xs bg-success/30">
                    {formatCurrency(totalDia)}
                  </th>
                  <th></th>
                </tr>

                {/* Linha para os totais individuais */}
                <tr>
                  <th className="hidden"></th>
                  <th className="hidden"></th>
                  <th colSpan={6}></th>
                  <th className="text-center text-xs bg-success/30 ">
                    {formatCurrency(totalReal)}
                  </th>
                  <th className="text-center text-xs bg-success/30">
                    {formatCurrency(totalPix)}
                  </th>
                  <th></th>
                </tr>

                {/* Linha com os nomes das colunas */}
                <tr>
                  <th className="hidden">ID</th>
                  <th className="hidden">Codigo</th>
                  <th>Hora</th>
                  <th>Dec</th>
                  <th>Nome</th>
                  <th>Base</th>
                  <th>Sis</th>
                  <th>Alt</th>
                  <th className="bg-accent">R$</th>
                  <th className="bg-accent">PIX</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-base-content/5 ${
                      exists.some(
                        (e) =>
                          String(e.codigo) === String(item.codigo) && // Comparar como string
                          Use.formatarData(e.data) ===
                            Use.formatarData(item.date), // Comparar datas formatadas
                      )
                        ? "bg-error/70"
                        : ""
                    }`}
                  >
                    <td className="hidden">{item.id}</td>
                    <td className="hidden">{item.codigo}</td>
                    <td>{item.horaSeparada}</td>
                    <td>{item.dec}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editedData.nome}
                          onChange={(e) =>
                            handleInputChange("nome", e.target.value)
                          }
                          className="input input-xs p-0 m-0 text-center"
                        />
                      ) : (
                        item.nome
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editedData.base}
                          onChange={(e) =>
                            handleInputChange("base", e.target.value)
                          }
                          className="input input-xs p-0 m-0 text-center"
                        />
                      ) : (
                        item.base
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editedData.sis}
                          onChange={(e) =>
                            handleInputChange("sis", e.target.value)
                          }
                          className="input input-xs p-0 m-0 text-center"
                        />
                      ) : (
                        item.sis
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editedData.alt}
                          onChange={(e) =>
                            handleInputChange("alt", e.target.value)
                          }
                          className="input input-xs p-0 m-0 text-center"
                        />
                      ) : (
                        item.alt
                      )}
                    </td>
                    <td className="bg-accent/20">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editedData.real} // Usar o valor string diretamente de editedData
                          onChange={(e) =>
                            handleInputChange("real", e.target.value)
                          }
                          className="input input-xs p-0 m-0 text-center"
                        />
                      ) : (
                        formatCurrency(item.real)
                      )}
                    </td>
                    <td className="bg-accent/20">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editedData.pix} // Usar o valor string diretamente de editedData
                          onChange={(e) =>
                            handleInputChange("pix", e.target.value)
                          }
                          className="input input-xs p-0 m-0 text-center"
                        />
                      ) : (
                        formatCurrency(item.pix)
                      )}
                    </td>
                    <td>
                      <Edit
                        isEditing={editingId === item.id}
                        onEdit={() => startEditing(item)}
                        onSave={() => handleSave(editedData)}
                        onCancel={() => setEditingId(null)}
                      />
                      <button
                        className={`btn btn-xs btn-soft btn-error ${
                          editingId === item.id ? "hidden" : ""
                        }`}
                        onClick={async () => {
                          // Adiciona a chamada para o backend
                          try {
                            await Execute.removeC(item.id);
                            // A UI será atualizada via WebSocket (C_DELETED_ITEM)
                          } catch (error) {
                            console.error("Erro ao excluir item C:", error);
                            // Adicionar tratamento de erro para o usuário se necessário
                          }
                        }}
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
      })}
    </div>
  );
};

export default Coluna;
