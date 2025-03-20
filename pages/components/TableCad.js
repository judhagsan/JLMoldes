import { useState, useEffect } from "react";
import EditM from "./Edit";

const TableCad = () => {
  const [cadastroData, setCadastroData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/v1/cadastro");
        if (!response.ok) throw new Error("Erro ao buscar dados");
        const data = await response.json();

        // Acessa data.rows se existir e for array
        const receivedData = Array.isArray(data.rows) ? data.rows : [];
        setCadastroData(receivedData);
      } catch (error) {
        console.error("Erro na requisição:", error);
        setCadastroData([]);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(intervalId);
  }, []);

  async function deleteTableRecord(id) {
    const response = await fetch("/api/v1/cadastro", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }), // Envia o `id` no corpo da requisição
    });

    const result = await response.json();
    console.log(result);
  }

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditedData({ ...item });
  };

  const handleSave = async (editedData) => {
    try {
      const response = await fetch("/api/v1/cadastro", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      setCadastroData(
        cadastroData.map((item) =>
          item.id === editedData.id ? { ...item, ...editedData } : item,
        ),
      );
      setEditingId(null);
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
          {cadastroData.map((item, index) => (
            <tr key={index}>
              <td className="hidden">{item.id}</td>
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
              <td>
                <EditM
                  isEditing={editingId === item.id}
                  onEdit={() => startEditing(item)}
                  onSave={() => handleSave(editedData)}
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
