import React, { useEffect, useState, useRef } from "react";
import Edit from "../Edit.js";
import Execute from "models/functions.js";
import Use from "models/utils.js";
import { XCircleIcon } from "@primer/octicons-react";
import { CheckIcon } from "@primer/octicons-react";
import { AlertIcon } from "@primer/octicons-react";
import { useWebSocket } from "../../../contexts/WebSocketContext.js"; // Importar o hook

const Oficina = ({ letras }) => {
  const [data, setData] = useState([]);
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("");
  const [valor, setValor] = useState("");
  const [gastos, setGastos] = useState("");
  const [pago, setPago] = useState("");
  const [proximo, setProximo] = useState("");
  const [dia, setDia] = useState("");
  const [alerta, setAlerta] = useState("");

  // Estados para edição
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const { lastMessage } = useWebSocket(); // Usar o hook WebSocket
  const lastProcessedTimestampRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!letras) return;
      try {
        const results = await Execute.receiveFromOficina(letras);
        setData(results || []); // Garante que seja um array
      } catch (error) {
        console.error("Erro ao buscar dados de Oficina:", error);
        setData([]);
      }
    };

    fetchData();
    // O polling com setInterval foi removido
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letras]); // Re-fetch se 'letras' mudar

  // Efeito para lidar com mensagens WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.data && lastMessage.timestamp) {
      // Se o timestamp da mensagem atual for o mesmo da última processada, ignore.
      if (
        lastProcessedTimestampRef.current &&
        lastMessage.timestamp <= lastProcessedTimestampRef.current
      ) {
        console.log(
          "Oficina.js: Ignorando mensagem WebSocket já processada (mesmo timestamp). Timestamp:",
          lastMessage.timestamp,
        );
        return;
      }

      const { type, payload } = lastMessage.data;
      console.log(
        "Oficina.js: Mensagem WebSocket recebida:",
        type,
        payload,
        "Timestamp:",
        lastMessage.timestamp,
      );

      // Verifica se o payload existe e se a mensagem é relevante para este componente (mesmo 'letras', que parece ser 'dec' no payload)
      if (payload) {
        switch (type) {
          case "OFICINA_NEW_ITEM":
            // Adiciona o novo item se corresponder à 'letra' (dec) atual do componente
            if (payload.dec === letras) {
              setData((prevData) => {
                // Evitar duplicatas se por algum motivo o item já existir
                if (prevData.find((item) => item.id === payload.id)) {
                  return prevData.map((item) =>
                    item.id === payload.id ? payload : item,
                  );
                }
                return [...prevData, payload];
              });
            }
            break;
          case "OFICINA_UPDATED_ITEM":
            setData((prevData) =>
              prevData.map((item) =>
                item.id === payload.id ? { ...item, ...payload } : item,
              ),
            );

            if (editingId == payload.id) {
              console.log(
                `Oficina.js: WebSocket está fechando a edição para ID: ${payload.id}. Current editingId: ${editingId}`,
              );
              setEditingId(null); // Fecha o formulário de edição se o item editado foi atualizado
            }
            break;
          case "OFICINA_DELETED_ITEM":
            console.log("Payload recebido para exclusão:", payload);
            if (payload && payload.id !== undefined) {
              const idToRemove = String(payload.id);
              setData((prevData) =>
                prevData.filter((item) => String(item.id) !== idToRemove),
              );
              // Fechar edição se o item excluído estava sendo editado
              if (editingId === payload.id) {
                setEditingId(null);
              }
            }
            break;
          default:
            // Tipo de mensagem não relevante para este componente ou desconhecido
            break;
        }
      }
      // Após processar a mensagem, atualize o timestamp da última mensagem processada.
      lastProcessedTimestampRef.current = lastMessage.timestamp;
      console.log(
        "Oficina.js: Timestamp da última mensagem processada atualizado para:",
        lastMessage.timestamp,
      );
    }
  }, [lastMessage, letras, editingId]);

  // Ordenação e agrupamento dos dados
  const sortedData = [...data].sort((a, b) => a.item.localeCompare(b.item));
  const processedData = sortedData.map((entry, index) => {
    const isFirst = index === 0 || sortedData[index - 1].item !== entry.item;
    let rowSpan = 1;
    if (isFirst) {
      let count = 1;
      while (
        index + count < sortedData.length &&
        sortedData[index + count].item === entry.item
      ) {
        count++;
      }
      rowSpan = count;
    }
    return { ...entry, isFirst, rowSpan };
  });

  // Função para iniciar a edição de uma linha
  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditedData({ ...entry });
  };

  // Atualiza os dados editados conforme o usuário altera os inputs
  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  // Função para salvar as alterações (PUT)
  const handleSave = async () => {
    try {
      const response = await fetch("/api/v1/tables/gastos/oficina", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });
      if (!response.ok) throw new Error("Erro ao atualizar");
      console.log(
        "Oficina.js: Dados salvos via API. Aguardando mensagem WebSocket para fechar o modo de edição.",
      );
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handlePagar = async (entry) => {
    try {
      // Atualiza o registro no backend
      const updatedEntry = {
        ...entry,
        pago: new Date().toISOString().split("T")[0], // Atualiza a data do último pagamento
      };

      const response = await fetch("/api/v1/tables/gastos/oficina", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEntry),
      });

      if (!response.ok) throw new Error("Erro ao atualizar pagamento");

      // A atualização do estado 'data' será feita pela mensagem WebSocket 'OFICINA_UPDATED'

      // Registra na saída
      await Execute.sendToSaidaO(
        letras,
        entry.item,
        entry.gastos,
        entry.valor,
        new Date().toISOString().split("T")[0],
      );
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
    }
  };

  // Função para cancelar a edição
  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Execute.sendToOficina fará o POST.
    // O backend, após salvar, enviará uma mensagem WebSocket 'OFICINA_UPDATED'.

    await Execute.sendToOficina(
      letras,
      item,
      quantidade,
      unidade,
      valor,
      gastos,
      pago,
      proximo,
      dia,
      alerta,
    );

    // Execute.sendToSaidaO também fará um POST.
    // O backend correspondente também precisará notificar via WebSocket se essa ação afeta outros componentes.
    await Execute.sendToSaidaO(letras, item, gastos, valor, pago);

    setItem("");
    setQuantidade("");
    setUnidade("");
    setValor("");
    setGastos("");
    setPago("");
    setProximo("");
    setDia("");
    setAlerta("");
  };

  const handleDelete = async (id) => {
    try {
      await Execute.removeOficina(id);
      // A atualização do estado 'data' virá via WebSocket 'OFICINA_UPDATED'
    } catch (error) {
      console.error("Erro ao excluir item de Oficina:", error);
    }
  };

  const getStatusVencimento = (entry) => {
    const hoje = new Date();
    hoje.setUTCHours(23, 59, 59, 999);

    const dataVencimentoStr = Use.formatarProximo(
      entry.pago,
      entry.proximo,
      entry.dia,
    );
    const [dd, mm, yyyy] = dataVencimentoStr.split("/");
    const dataVencimento = new Date(
      Date.UTC(yyyy, mm - 1, dd, 23, 59, 59, 999),
    );

    if (dataVencimento < hoje) {
      return "vencido";
    }

    const diffTime = dataVencimento - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const alerta = parseInt(entry.alerta, 10);
    if (!isNaN(alerta) && diffDays <= alerta) {
      return "proximo";
    }

    return "ok";
  };

  const shouldShowAlert = (entry) => {
    const alerta = parseInt(entry.alerta, 10);
    return !isNaN(alerta) && getStatusVencimento(entry) === "proximo";
  };

  return (
    <>
      <div className="overflow-x-auto rounded-box border border-secondary bg-base-100">
        <h1 className="text-center w-full">OFICINA</h1>
        <form onSubmit={handleSubmit} className="flex gap-2 p-2">
          <select
            className="select select-info select-xs"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          >
            <option disabled value="">
              Itens
            </option>
            <option>R1</option>
            <option>R2</option>
            <option>R3</option>
          </select>
          <input
            type="number"
            placeholder="Quantidade"
            className="input input-info input-xs"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
          <input
            type="number"
            placeholder="Unidade"
            className="input input-info input-xs"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
          />
          <input
            type="number"
            required
            placeholder="Valor"
            className="input input-info input-xs"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Gastos"
            className="input input-info input-xs"
            value={gastos}
            onChange={(e) => setGastos(e.target.value)}
          />
          <input
            type="date"
            required
            placeholder="Pago"
            className="input input-success input-xs custom-date-input"
            value={pago}
            onChange={(e) => setPago(e.target.value)}
          />
          <input
            type="number"
            placeholder="Mês"
            className="input input-warning input-xs custom-date-input"
            value={proximo}
            onChange={(e) => setProximo(e.target.value)}
          />
          <input
            type="number"
            required
            placeholder="Dia"
            className="input input-info input-xs"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
          />
          <input
            type="number"
            required
            placeholder="Alerta"
            className="input input-info input-xs"
            value={alerta}
            onChange={(e) => setAlerta(e.target.value)}
          />
          <button type="submit" className="btn btn-xs btn-info">
            Enviar
          </button>
        </form>
        <table className="table table-xs">
          <thead>
            <tr>
              <th className="hidden">ID</th>
              <th>Item</th>
              <th>Quantidade</th>
              <th>Unidade</th>
              <th>Valor</th>
              <th>Gastos</th>
              <th>Pago</th>
              <th>Proximo</th>
              <th>Dia</th>
              <th>Alerta</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((entry) =>
              entry.isFirst ? (
                // Primeira linha do grupo com rowSpan para o campo Item
                <tr key={entry.id} className="text-center">
                  <td className="hidden">{entry.id}</td>
                  <td className="px-0.5 text-center" rowSpan={entry.rowSpan}>
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editedData.item}
                        onChange={(e) =>
                          handleInputChange("item", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.item
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.quantidade}
                        onChange={(e) =>
                          handleInputChange("quantidade", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.quantidade
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.unidade}
                        onChange={(e) =>
                          handleInputChange("unidade", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.unidade
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.valor}
                        onChange={(e) =>
                          handleInputChange("valor", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.valor
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editedData.gastos}
                        onChange={(e) =>
                          handleInputChange("gastos", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.gastos
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="date"
                        value={
                          editedData.pago ? editedData.pago.split("T")[0] : ""
                        }
                        onChange={(e) =>
                          handleInputChange("pago", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      Use.formatarDataAno(entry.pago)
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.proximo}
                        onChange={(e) =>
                          handleInputChange("proximo", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      Use.formatarProximo(entry.pago, entry.proximo, entry.dia)
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.dia}
                        onChange={(e) =>
                          handleInputChange("dia", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.dia
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.alerta}
                        onChange={(e) =>
                          handleInputChange("alerta", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.alerta
                    )}
                  </td>
                  <td className="px-0">
                    <button
                      className={`btn btn-xs btn-soft btn-success ${editingId === entry.id ? "hidden" : ""}`}
                      onClick={() => handlePagar(entry)}
                    >
                      Pagar
                    </button>
                    <Edit
                      isEditing={editingId === entry.id}
                      onEdit={() => startEditing(entry)}
                      onSave={handleSave}
                      onCancel={handleCancel}
                    />
                    <button
                      className={`btn btn-xs btn-soft btn-error ${editingId === entry.id ? "hidden" : ""}`}
                      onClick={() => handleDelete(entry.id)}
                    >
                      Excluir
                    </button>
                    <span
                      className={`ml-2 badge badge-error badge-sm ${
                        editingId === entry.id ||
                        getStatusVencimento(entry) !== "vencido"
                          ? "hidden"
                          : ""
                      }`}
                    >
                      <XCircleIcon size={12} />
                      Vencido
                    </span>
                    <span
                      className={`ml-2 badge badge-warning badge-sm ${
                        editingId === entry.id || !shouldShowAlert(entry)
                          ? "hidden"
                          : ""
                      }`}
                    >
                      <AlertIcon size={12} />A Vencer
                    </span>
                    <span
                      className={`ml-2 badge badge-success badge-sm ${
                        editingId === entry.id ||
                        getStatusVencimento(entry) !== "ok"
                          ? "hidden"
                          : ""
                      }`}
                    >
                      <CheckIcon size={12} />
                      No Prazo
                    </span>
                  </td>
                </tr>
              ) : (
                // Demais linhas do grupo sem a célula do Item
                <tr key={entry.id}>
                  <td className="hidden">{entry.id}</td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.quantidade}
                        onChange={(e) =>
                          handleInputChange("quantidade", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.quantidade
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.unidade}
                        onChange={(e) =>
                          handleInputChange("unidade", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.unidade
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.valor}
                        onChange={(e) =>
                          handleInputChange("valor", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.valor
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editedData.gastos}
                        onChange={(e) =>
                          handleInputChange("gastos", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.gastos
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="date"
                        value={
                          editedData.pago ? editedData.pago.split("T")[0] : ""
                        }
                        onChange={(e) =>
                          handleInputChange("pago", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      Use.formatarDataAno(entry.pago)
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="date"
                        value={
                          editedData.proximo
                            ? editedData.proximo.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange("proximo", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      Use.formatarDataAno(entry.proximo)
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.dia}
                        onChange={(e) =>
                          handleInputChange("dia", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.dia
                    )}
                  </td>
                  <td className="px-0.5">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editedData.alerta}
                        onChange={(e) =>
                          handleInputChange("alerta", e.target.value)
                        }
                        className="input input-xs p-0 m-0 text-center"
                      />
                    ) : (
                      entry.alerta
                    )}
                  </td>
                  <td className="px-0.5">
                    <button
                      className={`btn btn-xs btn-soft btn-success ${editingId === entry.id ? "hidden" : ""}`}
                      onClick={() => handlePagar(entry)}
                    >
                      Pagar
                    </button>
                    <Edit
                      isEditing={editingId === entry.id}
                      onEdit={() => startEditing(entry)}
                      onSave={handleSave}
                      onCancel={handleCancel}
                    />
                    <button
                      className={`btn btn-xs btn-soft btn-error ${editingId === entry.id ? "hidden" : ""}`}
                      onClick={() => Execute.removeOficina(entry.id)}
                    >
                      Excluir
                    </button>
                    <span
                      className={`ml-2 badge badge-error badge-sm ${
                        editingId === entry.id ||
                        getStatusVencimento(entry) !== "vencido"
                          ? "hidden"
                          : ""
                      }`}
                    >
                      <XCircleIcon size={12} />
                      Vencido
                    </span>
                    <span
                      className={`ml-2 badge badge-warning badge-sm ${
                        editingId === entry.id || !shouldShowAlert(entry)
                          ? "hidden"
                          : ""
                      }`}
                    >
                      <AlertIcon size={12} />A Vencer
                    </span>
                    <span
                      className={`ml-2 badge badge-success badge-sm ${
                        editingId === entry.id ||
                        getStatusVencimento(entry) !== "ok"
                          ? "hidden"
                          : ""
                      }`}
                    >
                      <CheckIcon size={12} />
                      No Prazo
                    </span>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Oficina;
