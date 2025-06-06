import React, { useEffect, useState, useRef } from "react";
import EditM from "../Edit";
import Execute from "models/functions";
import Use from "models/utils";
import ErrorComponent from "../Errors.js";
import { useWebSocket } from "../../../contexts/WebSocketContext.js"; // Importar o hook

const TabelaM = ({
  oficina,
  r,
  filterType, // Nova prop: 'alt_sis' ou 'base'
  secondaryEndpoint = "tables/R", // Mantida para o segundo PUT em handleSave
  columnsConfig = [
    { field: "sis", label: "Sis", min: 1 },
    { field: "alt", label: "Alt", min: 1 },
  ],
  filterCondition = (item) => item.sis > 0 || item.alt > 0,
}) => {
  const [dados, setDados] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showError, setErrorCode] = useState(false);
  const lastProcessedTimestampRef = useRef(null); // Para evitar processamento duplicado
  const { lastMessage } = useWebSocket(); // Usar o hook WebSocket

  const baseColumnsCount = 6; // ID + Data + Observações + CODIGO + DEC + Nome
  const colspan = baseColumnsCount + columnsConfig.length;

  const fetchData = async (currentOficina) => {
    const filterParam = filterType === "base" ? "base" : "alt_sis";
    const endpoint = `/api/v1/tables?oficina=${currentOficina}&filterType=${filterParam}`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Erro ao carregar os dados");
      const data = await response.json();

      if (Array.isArray(data.rows)) {
        setDados(sortData(data.rows));
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setDados([]);
    }
  };

  // Função auxiliar para ordenar os dados
  const sortData = (dataArray) => {
    return [...dataArray].sort((a, b) => {
      if (a.dec !== b.dec) return a.dec.localeCompare(b.dec);
      return new Date(a.data) - new Date(b.data);
    });
  };

  const handleSave = async (editedData) => {
    try {
      const response = await fetch(`/api/v1/tables`, {
        // PUT para Mtable
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      const response2 = await fetch(`/api/v1/${secondaryEndpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      if (!response.ok || !response2.ok) throw new Error("Erro ao atualizar");

      // A atualização do estado 'dados' e o fechamento do modo de edição serão feitos pela mensagem WebSocket
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditedData({ ...item });
  };

  useEffect(() => {
    if (oficina) {
      // Garante que oficina está definido antes de buscar
      fetchData(oficina);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oficina, filterType]); // Depende de oficina e filterType

  // Efeito para lidar com mensagens WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.data && lastMessage.timestamp) {
      if (
        lastProcessedTimestampRef.current &&
        lastMessage.timestamp <= lastProcessedTimestampRef.current
      ) {
        // console.log("TabelaM.js: Ignorando mensagem WebSocket já processada:", lastMessage.timestamp);
        return;
      }

      const { type, payload } = lastMessage.data;
      // console.log("TabelaM.js: Mensagem WebSocket recebida:", type, payload, "Oficina atual:", oficina, "Timestamp:", lastMessage.timestamp);

      // Verificar se a mensagem é relevante para esta instância da tabela
      // (mesma oficina e talvez mainEndpoint se necessário)
      if (payload && payload.oficina === oficina) {
        // Garante que a mensagem é para a oficina correta
        const itemMatchesFilter = filterCondition(payload);

        switch (type) {
          case "TABELAM_NEW_ITEM":
            if (itemMatchesFilter) {
              setDados((prevDados) => {
                if (prevDados.find((item) => item.id === payload.id)) {
                  // Se já existe (improvável para NEW_ITEM, mas seguro), atualiza
                  return sortData(
                    prevDados.map((item) =>
                      item.id === payload.id ? payload : item,
                    ),
                  );
                }
                return sortData([...prevDados, payload]);
              });
            }
            break;
          case "TABELAM_UPDATED_ITEM":
            setDados((prevDados) => {
              const itemExistsInState = prevDados.some(
                (item) => item.id === payload.id,
              );
              if (itemMatchesFilter) {
                // Item deve estar na lista
                if (itemExistsInState) {
                  // Atualiza
                  return sortData(
                    prevDados.map((item) =>
                      item.id === payload.id ? { ...item, ...payload } : item,
                    ),
                  );
                } else {
                  // Adiciona (item não estava mas agora corresponde ao filtro)
                  return sortData([...prevDados, payload]);
                }
              } else {
                // Item NÃO deve estar na lista
                if (itemExistsInState) {
                  // Remove (item estava mas não corresponde mais ao filtro)
                  return sortData(
                    prevDados.filter((item) => item.id !== payload.id),
                  );
                }
                // Se não estava e não corresponde, não faz nada
                return prevDados;
              }
            });
            if (editingId === payload.id && !itemMatchesFilter) {
              setEditingId(null); // Fecha edição se o item editado não pertence mais a esta tabela
            } else if (editingId === payload.id) {
              setEditingId(null); // Fecha edição por segurança após qualquer atualização do item editado
            }
            break;
          case "TABELAM_DELETED_ITEM":
            // payload para delete deve ser algo como { id: 'uuid', oficina: 'nomeOficina' }
            setDados((prevDados) =>
              sortData(prevDados.filter((item) => item.id !== payload.id)),
            ); // Remove da lista se existir
            if (editingId === payload.id) {
              setEditingId(null); // Fecha o modo de edição se o item editado foi deletado
            }
            break;
          default:
            // console.log("TabelaM.js: Tipo de mensagem WebSocket não tratada ou não relevante:", type);
            break;
        }
      }
      lastProcessedTimestampRef.current = lastMessage.timestamp;
    } // filterCondition é uma função, se ela mudar, o efeito deve reavaliar.
  }, [lastMessage, oficina, editingId, filterCondition]);

  const groupedData = dados.reduce((acc, item) => {
    if (!acc[item.dec]) acc[item.dec] = [];
    acc[item.dec].push(item);
    return acc;
  }, {});

  const filteredGroupedData = Object.fromEntries(
    Object.entries(groupedData).filter(([, items]) =>
      items.some(filterCondition),
    ),
  );

  if (Object.keys(filteredGroupedData).length === 0) return null;

  const handleUpdateDec = async (updatePayload) => {
    try {
      const decItems = await Execute.receiveFromDec(r);
      const targetDecItem = decItems.find(
        (item) => String(item.dec) === String(updatePayload.dec),
      );

      if (targetDecItem && targetDecItem.on === true) {
        // Proceed with the PUT request only if the item exists and its 'on' property is true
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
      } else {
        console.log(
          `Atualização para Dec ${updatePayload.dec} não realizada. Item não encontrado ou 'on' não é true.`,
          targetDecItem,
        );
      }
    } catch (error) {
      console.error("Erro ao enviar atualização para Dec item:", error);
    }
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table table-xs">
          <thead>
            <tr>
              <th className="hidden">ID</th>
              <th>Data</th>
              <th>Observações</th>
              <th className="hidden">CODIGO</th>
              <th>DEC</th>
              <th>Nome</th>
              {columnsConfig.map((col) => (
                <th key={col.field}>{col.label}</th>
              ))}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(filteredGroupedData).map((decKey) => (
              <React.Fragment key={decKey}>
                <tr className="bg-gray-200 font-bold">
                  <td colSpan={colspan} className="text-center">
                    GRUPO: {decKey}
                  </td>
                </tr>
                {filteredGroupedData[decKey].map((item) => (
                  <tr
                    key={item.id}
                    className={
                      item.r1
                        ? "bg-yellow-100 border-b border-gray-700"
                        : item.r2
                          ? "bg-primary/20 border-b border-gray-700"
                          : item.r3
                            ? "bg-info/20 border-b border-gray-700"
                            : "border-b border-gray-700"
                    }
                  >
                    <td className="hidden">{item.id}</td>
                    <td>{Use.formatarData(item.data)}</td>
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
                    <td className="hidden">{item.codigo}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          maxLength={1}
                          value={editedData.dec}
                          onChange={(e) =>
                            handleInputChange(
                              "dec",
                              e.target.value.toUpperCase(),
                            )
                          }
                          className="input input-xs p-0 m-0 text-center"
                        />
                      ) : (
                        item.dec
                      )}
                    </td>
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

                    {columnsConfig.map((col) => (
                      <td key={col.field}>
                        {editingId === item.id ? (
                          <input
                            type="number"
                            min={col.min || 0}
                            value={editedData[col.field]}
                            onChange={(e) => {
                              let value = e.target.value;
                              if (col.min && value < col.min) value = col.min;
                              handleInputChange(col.field, value);
                            }}
                            className="input input-xs p-0 m-0 text-center"
                          />
                        ) : (
                          item[col.field]
                        )}
                      </td>
                    ))}

                    <td>
                      <button
                        className={`btn btn-xs btn-soft btn-warning ${
                          editingId === item.id ? "hidden" : ""
                        }`}
                        onClick={async () => {
                          try {
                            setErrorCode(null);
                            const result = await Execute.sendTrueMR(item.id, 1);

                            if (result) {
                              await Execute.sendToR({
                                ...item,
                                sis: item.sis || 0,
                                alt: item.alt || 0,
                                base: item.base || 0,
                                r: 1,
                                dec: item.dec,
                              });
                            } else {
                              setErrorCode(item.id);
                            }
                            // A atualização da UI virá via WebSocket
                          } catch (error) {
                            setErrorCode(item.id);
                          }
                        }}
                      >
                        R1
                      </button>

                      {showError === item.id && (
                        <ErrorComponent errorCode="R1ID" />
                      )}

                      <button
                        className={`btn btn-xs btn-soft btn-primary ${
                          editingId === item.id ? "hidden" : ""
                        }`}
                        onClick={async () => {
                          try {
                            setErrorCode(null);
                            const result = await Execute.sendTrueMR(item.id, 2);

                            if (result) {
                              await Execute.sendToR({
                                ...item,
                                sis: item.sis || 0,
                                alt: item.alt || 0,
                                base: item.base || 0,
                                r: 2,
                                dec: item.dec,
                              });
                            } else {
                              setErrorCode(item.id);
                            }
                            // A atualização da UI virá via WebSocket
                          } catch (error) {
                            setErrorCode(item.id);
                          }
                        }}
                      >
                        R2
                      </button>

                      <button
                        className={`btn btn-xs btn-soft btn-info ${
                          editingId === item.id ? "hidden" : ""
                        }`}
                        onClick={async () => {
                          try {
                            setErrorCode(null);
                            const result = await Execute.sendTrueMR(item.id, 3);

                            if (result) {
                              await Execute.sendToR({
                                ...item,
                                sis: item.sis || 0,
                                alt: item.alt || 0,
                                base: item.base || 0,
                                r: 3,
                                dec: item.dec,
                              });
                            } else {
                              setErrorCode(item.id);
                            }
                            // A atualização da UI virá via WebSocket
                          } catch (error) {
                            setErrorCode(item.id);
                          }
                        }}
                      >
                        R3
                      </button>

                      <EditM
                        isEditing={editingId === item.id}
                        onEdit={() => startEditing(item)}
                        onSave={() => handleSave(editedData)}
                        onCancel={() => setEditingId(null)}
                      />
                      <button
                        className={`btn btn-xs btn-soft btn-success ${
                          editingId === item.id ? "hidden" : ""
                        }`}
                        onClick={() => {
                          const sis = Number(item.sis || 0);
                          const alt = Number(item.alt || 0);
                          const base = Number(item.base || 0);

                          Execute.sendToC({
                            codigo: item.codigo,
                            dec: item.dec,
                            r: r,
                            data: item.data,
                            nome: item.nome,
                            sis: sis,
                            alt: alt,
                            base: base,
                            real: 0,
                            pix: sis + alt + base,
                          });

                          handleUpdateDec({
                            dec: item.dec,
                            r: r,
                            sis: sis,
                            alt: alt,
                            base: base,
                          });

                          Execute.removeMandR(item.id);
                          setDados([]);
                        }}
                      >
                        Pagar
                      </button>
                      <button
                        className={`btn btn-xs btn-soft btn-error ${
                          editingId === item.id ? "hidden" : ""
                        }`}
                        onClick={() => {
                          Execute.removeMandR(item.id);
                          setDados([]);
                        }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaM;
