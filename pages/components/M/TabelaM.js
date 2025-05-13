import React, { useEffect, useState } from "react";
import EditM from "../Edit";
import Execute from "models/functions";
import Use from "models/utils";
import ErrorComponent from "../Errors.js";
import { useWebSocket } from "../../../contexts/WebSocketContext.js"; // Importar o hook

const TabelaM = ({
  oficina,
  r,
  mainEndpoint = "tables",
  secondaryEndpoint = "tables/R",
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
  const { lastMessage } = useWebSocket(); // Usar o hook WebSocket

  const baseColumnsCount = 6; // ID + Data + Observações + CODIGO + DEC + Nome
  const colspan = baseColumnsCount + columnsConfig.length;

  const fetchData = async (currentOficina) => {
    try {
      // Usar currentOficina que é passado para a função
      const response = await fetch(
        `/api/v1/${mainEndpoint}?oficina=${currentOficina}`,
      );
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
      const response = await fetch(`/api/v1/${mainEndpoint}`, {
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

      // A atualização do estado 'dados' será feita pela mensagem WebSocket 'TABELAM_UPDATED_ITEM'
      setEditingId(null);
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
    // O polling com setInterval foi removido
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oficina, mainEndpoint]); // Adicionado mainEndpoint como dependência se puder mudar

  // Efeito para lidar com mensagens WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      const { type, payload } = lastMessage.data;

      // Verificar se a mensagem é relevante para esta instância da tabela
      // (mesma oficina e talvez mainEndpoint se necessário)
      if (payload && payload.oficina === oficina) {
        if (type === "TABELAM_NEW_ITEM") {
          setDados((prevDados) => sortData([...prevDados, payload]));
        } else if (type === "TABELAM_UPDATED_ITEM") {
          setDados((prevDados) =>
            sortData(
              prevDados.map((item) =>
                item.id === payload.id ? { ...item, ...payload } : item,
              ),
            ),
          );
          // Se o item que estava sendo editado foi atualizado, fechar o formulário de edição
          if (editingId === payload.id) {
            setEditingId(null);
          }
        } else if (type === "TABELAM_DELETED_ITEM") {
          setDados((prevDados) =>
            sortData(prevDados.filter((item) => item.id !== payload.id)),
          );
          if (editingId === payload.id) {
            setEditingId(null);
          }
        }
      }
    }
  }, [lastMessage, oficina, editingId]);

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

                            // fetchData(); // Removido, atualização virá via WebSocket
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

                            // fetchData(); // Removido, atualização virá via WebSocket
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

                            // fetchData(); // Removido, atualização virá via WebSocket
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
                          Execute.removeMandR(item.id);
                          // A remoção acima (removeMandR) deve fazer o backend
                          // enviar uma mensagem TABELAM_DELETED_ITEM
                        }}
                      >
                        Pagar
                      </button>
                      <button
                        className={`btn btn-xs btn-soft btn-error ${
                          editingId === item.id ? "hidden" : ""
                        }`}
                        onClick={() => Execute.removeMandR(item.id)}
                        // A remoção acima (removeMandR) deve fazer o backend
                        // enviar uma mensagem TABELAM_DELETED_ITEM
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
