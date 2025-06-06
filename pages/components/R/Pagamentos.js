import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Execute from "models/functions"; // Assuming this will have receiveFromPagamentos
import Use from "models/utils"; // For date/time formatting
import { useWebSocket } from "../../../contexts/WebSocketContext.js"; // Adjust path if necessary

const sortDadosByDate = (dataArray) =>
  [...dataArray].sort((a, b) => new Date(a.data) - new Date(b.data));

const Pagamentos = ({ r }) => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastMessage } = useWebSocket();
  const [deleteAttemptedThisSlot, setDeleteAttemptedThisSlot] = useState(false);
  const lastProcessedTimestampRef = useRef(null);

  useEffect(() => {
    const checkTimeAndExecute = async () => {
      const now = new Date();
      const isScheduledTime =
        now.getDay() === 0 && // 0 for Sunday
        now.getHours() === 23 &&
        now.getMinutes() === 59;

      console.log(
        `Checking time: ${now.toLocaleTimeString()}, IsScheduled: ${isScheduledTime}, Attempted: ${deleteAttemptedThisSlot}`,
      );

      if (isScheduledTime) {
        if (!deleteAttemptedThisSlot) {
          console.log(
            "Client-side scheduled time reached. Attempting to delete all pagamentos.",
          );
          try {
            await Execute.deleteAllPagamentos();
            setDeleteAttemptedThisSlot(true);
          } catch (error) {
            console.error(
              "Client-side scheduled deletion via Execute.deleteAllPagamentos() failed:",
              error,
            );
          }
        }
      } else {
        if (deleteAttemptedThisSlot) {
          setDeleteAttemptedThisSlot(false);
        }
      }
    };
    const intervalId = setInterval(checkTimeAndExecute, 600000);
    return () => clearInterval(intervalId);
  }, [deleteAttemptedThisSlot]);
  const loadData = useCallback(async () => {
    setLoading(true);
    if (typeof r === "undefined" || r === null) {
      setDados([]);
      setLoading(false);
      return;
    }
    try {
      const data = await Execute.receiveFromPagamentos(r);

      setDados(sortDadosByDate(data));
    } catch (error) {
      console.error(
        "PagamentosDia.js: Erro ao carregar dados de pagamentos:",
        error,
      );
      setDados([]);
    } finally {
      setLoading(false);
    }
  }, [r]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (lastMessage && lastMessage.data && lastMessage.timestamp) {
      if (
        lastProcessedTimestampRef.current &&
        lastMessage.timestamp <= lastProcessedTimestampRef.current
      ) {
        return; // Ignore already processed message
      }

      const { type, payload } = lastMessage.data;

      switch (type) {
        case "PAGAMENTOS_NEW_ITEM":
          if (payload && String(payload.r) === String(r)) {
            setDados((prevDados) => {
              if (
                !prevDados.find(
                  (item) => String(item.id) === String(payload.id),
                )
              ) {
                return sortDadosByDate([...prevDados, payload]);
              }
              return prevDados; // Item already exists
            });
          }
          break;
        case "PAGAMENTOS_UPDATED_ITEM":
          if (payload && String(payload.r) === String(r)) {
            setDados((prevDados) =>
              sortDadosByDate(
                prevDados.map((item) =>
                  String(item.id) === String(payload.id)
                    ? { ...item, ...payload }
                    : item,
                ),
              ),
            );
          }
          break;
        case "PAGAMENTOS_DELETED_ITEM":
          if (payload && payload.id !== undefined) {
            // Assuming deletion is primarily by ID.
            // Add String(payload.r) === String(r) if necessary for your backend logic
            setDados((prevDados) =>
              sortDadosByDate(
                prevDados.filter(
                  (item) => String(item.id) !== String(payload.id),
                ),
              ),
            );
          }
          break;
        case "PAGAMENTOS_R_CLEARED": // New case for all payments deleted for an 'r'
          if (payload && String(payload.r) === String(r)) {
            setDados([]);
          }
          break;
        case "PAGAMENTOS_TABLE_CLEARED": // Novo evento para quando a tabela inteira é limpa
          // Não precisa verificar 'r' aqui, pois todos os dados foram removidos.
          setDados([]);
          break;
        default:
          break;
      }
      lastProcessedTimestampRef.current = lastMessage.timestamp;
    }
  }, [lastMessage, r, setDados]);

  const groupedPagamentos = useMemo(() => {
    return dados.reduce((acc, item) => {
      const dateKey = Use.formatarData(item.data); // e.g., "YYYY-MM-DD" or "DD/MM/YYYY"
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        ...item,
        horaFormatada: Use.formatarHora(item.data), // e.g., "HH:MM"
      });
      return acc;
    }, {});
  }, [dados]);

  if (loading) {
    return <div className="text-center p-4">Carregando pagamentos...</div>;
  }

  return (
    <>
      {Object.entries(groupedPagamentos)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)) // Sort days, newest first
        .map(([dateKey, itemsDoDia]) => (
          <div
            key={dateKey}
            className="overflow-x-auto rounded-box border border-info bg-base-100"
          >
            <table className="table table-xs w-full">
              <thead>
                <tr>
                  <th className="w-24">Hora</th>
                  <th>Nome</th>
                  <th className="w-28 text-right">Real</th>
                  <th className="w-28 text-right">Pix</th>
                </tr>
              </thead>
              <tbody>
                {itemsDoDia.map((item) => (
                  <tr key={item.id} className="border-b border-info/30">
                    <td>{item.horaFormatada}</td>
                    <td>{item.nome}</td>
                    <td className="text-right">
                      $ {Number(item.real).toFixed(2)}
                    </td>
                    <td className="text-right">
                      $ {Number(item.pix).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" className="font-bold text-right">
                    Total do Dia:
                  </td>
                  <td className="font-bold text-right bg-info/10">
                    {Number(
                      itemsDoDia.reduce(
                        (sum, item) => sum + Number(item.real),
                        0,
                      ),
                    ).toFixed(2)}
                  </td>
                  <td className="font-bold text-right bg-info/10">
                    {Number(
                      itemsDoDia.reduce(
                        (sum, item) => sum + Number(item.pix),
                        0,
                      ),
                    ).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}
      {Object.keys(groupedPagamentos).length === 0 && !loading && (
        <div className="badge badge-neutral badge-outline badge-sm whitespace-normal h-auto text-black">
          Nenhum Pagamento na Semana
        </div>
      )}
    </>
  );
};

export default Pagamentos;
