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
      const response = await fetch("/api/v1/tables/c1/papel", {
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
      const results = await Execute.reciveFromPapelC1();

      const grouped = results.reduce((acc, item) => {
        // Formata a data removendo o horário
        const rawDate = Use.formatarData(item.data);

        // Formata a hora para 00:00
        const dateObj = new Date(item.data);
        const horas = String(dateObj.getHours()).padStart(2, "0");
        const minutos = String(dateObj.getMinutes()).padStart(2, "0");
        const horaFormatada = `${horas}:${minutos}`;

        acc[rawDate] = acc[rawDate] || [];
        acc[rawDate].push({
          ...item,
          horaSeparada: horaFormatada,
          real: Number(item.papelreal) || 0,
          pix: Number(item.papelpix) || 0,
          encaixereal: Number(item.encaixereal) || 0,
          encaixepix: Number(item.encaixepix) || 0,
          desperdicio: Number(item.desperdicio) || 0,
          util: Number(item.util) || 0,
          perdida: Number(item.perdida) || 0,
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
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
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
    <div className="w-240 overflow-x-auto rounded-box border border-success bg-base-100">
      {Object.entries(groupedResults).map(([date, items]) => (
        <div key={date} className="mb-2">
          {/* Cabeçalho da data */}
          <div className="font-bold text-sm bg-success/20 text-center p-1">
            {date}
          </div>

          {/* Tabela para os itens da data */}
          <table className="table table-xs">
            <thead>
              <tr>
                <th className="hidden">ID</th>
                <th className="hidden">Codigo</th>
                <th>Hora</th>
                <th>Nome</th>
                <th>M</th>
                <th>Papel</th>
                <th className="bg-accent">R$</th>
                <th className="bg-accent">PIX</th>
                <th className="bg-success">Enc-R$</th>
                <th className="bg-success">Enc-PIX</th>
                <th className="bg-warning-content/50">Des</th>
                <th className="bg-warning-content/50">Util</th>
                <th className="bg-warning-content/50">Perdida</th>
                <th>Comentarios</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-success">
                  <td className="hidden">{item.id}</td>
                  <td className="hidden">{item.codigo}</td>
                  <td>{item.horaSeparada}</td>
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
                        value={editedData.multi}
                        onChange={(e) =>
                          handleInputChange("multi", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      item.multi
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={editedData.papel}
                        onChange={(e) => {
                          if (isNaN(e.target.value) || e.target.value <= 0) {
                            handleInputChange("papel", 1);
                          } else {
                            handleInputChange("papel", e.target.value);
                          }
                        }}
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      item.papel
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={formatCurrency(editedData.papelreal)}
                        onChange={(e) =>
                          handleInputChange("papelreal", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      formatCurrency(item.papelreal)
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={formatCurrency(editedData.papelpix)}
                        onChange={(e) =>
                          handleInputChange("papelpix", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      formatCurrency(item.papelpix)
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={formatCurrency(editedData.encaixereal)}
                        onChange={(e) =>
                          handleInputChange("encaixereal", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      formatCurrency(item.encaixereal)
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={formatCurrency(editedData.encaixepix)}
                        onChange={(e) =>
                          handleInputChange("encaixepix", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      formatCurrency(item.encaixepix)
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={formatCurrency(editedData.desperdicio)}
                        onChange={(e) => {
                          if (isNaN(e.target.value) || e.target.value <= 0) {
                            handleInputChange("desperdicio", 1);
                          } else {
                            handleInputChange("desperdicio", e.target.value);
                          }
                        }}
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      formatCurrency(item.desperdicio)
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={editedData.util}
                        onChange={(e) => {
                          if (isNaN(e.target.value) || e.target.value <= 0) {
                            handleInputChange("util", 1);
                          } else {
                            handleInputChange("util", e.target.value);
                          }
                        }}
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      item.util
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={editedData.perdida}
                        onChange={(e) =>
                          handleInputChange("perdida", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      item.perdida
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editedData.comentarios}
                        onChange={(e) =>
                          handleInputChange("comentarios", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      item.comentarios
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
                      onClick={() => Execute.removePapelC1(item.id)}
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
