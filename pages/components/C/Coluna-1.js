import React, { useEffect, useState } from "react";
import Execute from "models/functions";
import Edit from "../Edit";
import Use from "models/utils";

const formatCurrency = (value) => {
  const number = Number(value);
  return isNaN(number) ? "0.00" : number.toFixed(2);
};

const Coluna = () => {
  const [dados, setDados] = useState([]);
  const [groupedResults, setGroupedResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const handleSave = async (editedData) => {
    try {
      const response = await fetch("/api/v1/tables/c1", {
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

  const fetchData = async () => {
    try {
      const results = await Execute.reciveFromC1();

      const grouped = results.reduce((acc, item) => {
        // Remove a parte do horário da data
        const rawDate = Use.formatarData(item.data);
        acc[rawDate] = acc[rawDate] || [];
        acc[rawDate].push({
          ...item,
          valor: Number(item.valor) || 0,
          pix: Number(item.pix) || 0,
        });
        return acc;
      }, {});

      setGroupedResults(grouped);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Carrega os dados ao montar o componente
    const intervalId = setInterval(fetchData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, []);

  if (loading) {
    return <div className="text-center p-4">Carregando...</div>;
  }

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditedData({ ...item });
  };

  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      {Object.entries(groupedResults).map(([date, items]) => (
        <div key={date} className="mb-2">
          {/* Cabeçalho com a data */}
          <div className="font-bold text-sm bg-gray-200 text-center p-1">
            {date}
          </div>

          {/* Tabela para os itens da data */}
          <table className="table table-xs w-full">
            <thead>
              <tr>
                <th className="hidden">ID</th>
                <th className="hidden">Codigo</th>
                <th>Nome</th>
                <th>Base</th>
                <th>Sis</th>
                <th>Alt</th>
                <th>R$</th>
                <th>PIX</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-base-content/5">
                  <td className="hidden">{item.id}</td>
                  <td className="hidden">{item.codigo}</td>
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
                        min="1"
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
                        min="1"
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
                        min="1"
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
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={formatCurrency(editedData.real)}
                        onChange={(e) =>
                          handleInputChange("real", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      formatCurrency(item.real)
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={formatCurrency(editedData.pix)}
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
                      className={`btn btn-xs btn-soft btn-error ${editingId === item.id ? "hidden" : ""}`}
                      onClick={() => Execute.removeC1(item.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Coluna;
