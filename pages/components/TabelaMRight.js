import React, { useEffect, useState } from "react";
import EditM from "./Edit";
import Execute from "models/functions";
import Use from "models/utils";
import ErrorComponent from "./Errors.js";

const TabelaM = ({ codigo }) => {
  const [dados, setDados] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showError, setErrorCode] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/Base"); // URL correta para o endpoint
      if (!response.ok) throw new Error("Erro ao carregar os dados");
      const data = await response.json();

      if (Array.isArray(data.rows)) {
        // Ordenação primeiro por DEC (alfabética) e depois por Data (cronológica dentro do grupo)
        const sortedData = data.rows.sort((a, b) => {
          if (a.dec !== b.dec) return a.dec.localeCompare(b.dec); // Ordena DEC A-Z
          return new Date(a.data) - new Date(b.data); // Dentro do grupo, ordena por data
        });

        setDados(sortedData);
      } else {
        console.error("Formato de resposta inesperado:", data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const handleSave = async (editedData) => {
    try {
      const response = await fetch("/api/v1/Base", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      setDados(
        dados.map((item) =>
          item.id === editedData.id ? { ...item, ...editedData } : item,
        ),
      );
      setEditingId(null);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Carrega os dados ao montar o componente
    const intervalId = setInterval(fetchData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, []);

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditedData({ ...item });
  };

  // Função para formatar a data

  // Agrupar os dados por DEC
  const groupedData = dados.reduce((acc, item) => {
    if (!acc[item.dec]) acc[item.dec] = [];
    acc[item.dec].push(item);
    return acc;
  }, {});

  // Filtrar os grupos com base nas condições
  const filteredGroupedData = Object.fromEntries(
    Object.entries(groupedData).filter((entry) => {
      const items = entry[1]; //acessa o value do entry.
      return items.some((item) => item.base > 0);
    }),
  );
  //Se nenhum grupo passar no filtro, nao renderiza nada.
  if (Object.keys(filteredGroupedData).length === 0) {
    return null;
  }

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
              <th>Base</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(filteredGroupedData).map((decKey) => (
              <React.Fragment key={decKey}>
                {/* Linha de separação para o grupo */}
                <tr className="bg-gray-200 font-bold">
                  <td colSpan="8" className="text-center">
                    GRUPO: {decKey}
                  </td>
                </tr>
                {filteredGroupedData[decKey].map((item) => (
                  <tr
                    key={item.id}
                    className={
                      item.codigo === codigo
                        ? "bg-green-200 border-b border-gray-700"
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

                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
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
                      <button
                        className={`btn btn-xs btn-soft btn-warning ${editingId === item.id ? "hidden" : ""}`}
                        onClick={async () => {
                          try {
                            setErrorCode(null); // Reset do erro antes da tentativa
                            await Execute.sendToR1({
                              ...item,
                              sis: item.sis || 0,
                              alt: item.alt || 0,
                              base: item.base || 0,
                            });
                            fetchData();
                          } catch (error) {
                            setErrorCode(item.id); // Define o ID do item com erro
                          }
                        }}
                      >
                        R1
                      </button>

                      {showError === item.id && (
                        <ErrorComponent errorCode="R1ID" />
                      )}
                      <button
                        className={`btn btn-xs btn-soft btn-primary ${editingId === item.id ? "hidden" : ""}`}
                      >
                        R2
                      </button>
                      <button
                        className={`btn btn-xs btn-soft btn-info ${editingId === item.id ? "hidden" : ""}`}
                      >
                        R3
                      </button>
                      <button
                        className={`btn btn-xs btn-soft btn-secondary ${editingId === item.id ? "hidden" : ""}`}
                      >
                        M1
                      </button>
                      <EditM
                        isEditing={editingId === item.id}
                        onEdit={() => startEditing(item)}
                        onSave={() => handleSave(editedData)}
                        onCancel={() => setEditingId(null)}
                      />
                      <button
                        className={`btn btn-xs btn-soft btn-error ${editingId === item.id ? "hidden" : ""}`}
                        onClick={() => Execute.removeM1andR1(item.id)}
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
