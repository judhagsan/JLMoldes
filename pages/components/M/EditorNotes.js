import { useState, useEffect, useRef } from "react";
import {
  CheckIcon,
  BoldIcon,
  ItalicIcon,
  SquareFillIcon,
} from "@primer/octicons-react";

import Execute from "models/functions.js";
import { useWebSocket } from "../../../contexts/WebSocketContext.js";

const EditorNotes = ({ r, colum }) => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [activeColor, setActiveColor] = useState(null);

  const editorRef = useRef(null);
  const savedSelection = useRef(null);
  const lastProcessedTimestampRef = useRef(null); // Para evitar processamento duplicado

  const { lastMessage } = useWebSocket(); // Usar o hook WebSocket
  const colors = [
    { icon: <SquareFillIcon size={24} />, value: "#FF0000" },
    { icon: <SquareFillIcon size={24} />, value: "#0000FF" },
    { icon: <SquareFillIcon size={24} />, value: "#008000" },
  ];

  // Salva a seleção atual para formatação
  const saveSelection = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    savedSelection.current = sel.getRangeAt(0);
  };

  // Restaura a seleção salva
  const restoreSelection = () => {
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (savedSelection.current) sel.addRange(savedSelection.current);
  };

  // Aplica a formatação ao texto
  const applyFormat = (command, value = null) => {
    restoreSelection();
    document.execCommand(command, false, value);
    setCurrentNote(editorRef.current.innerHTML);
  };

  // Monitora a seleção para atualizar os botões da toolbar
  useEffect(() => {
    const handleSelectionChange = () => {
      const activeEl = document.activeElement;
      if (activeEl === editorRef.current) {
        setBoldActive(document.queryCommandState("bold"));
        setItalicActive(document.queryCommandState("italic"));
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  // Busca as notas iniciais quando 'r' ou 'colum' mudam
  useEffect(() => {
    const fetchInitialNotes = async () => {
      if (!r || !colum) {
        setNotes([]);
        return;
      }
      try {
        const res = await Execute.receiveFromNota(r, colum);
        setNotes(res.map((row) => ({ id: row.id, html: row.texto })));
      } catch (err) {
        console.error("Erro ao carregar notas:", err);
        setNotes([]);
      }
    };
    fetchInitialNotes();
    // O polling com setInterval foi removido
  }, [r, colum]);

  // Efeito para lidar com mensagens WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.data && lastMessage.timestamp) {
      if (
        lastProcessedTimestampRef.current &&
        lastMessage.timestamp <= lastProcessedTimestampRef.current
      ) {
        // console.log("EditorNotes.js: Ignorando mensagem WebSocket já processada:", lastMessage.timestamp);
        return;
      }

      const { type, payload } = lastMessage.data;
      // console.log("EditorNotes WS:", type, payload, "Props r:", r, "Props colum:", colum, "Timestamp:", lastMessage.timestamp);

      // Verificar se a nota pertence a este editor (mesmo 'r' e 'colum')
      // Comparar como strings para robustez contra tipos diferentes
      if (
        payload &&
        String(payload.r) === String(r) &&
        String(payload.colum) === String(colum)
      ) {
        if (type === "NOTA_NEW_ITEM") {
          setNotes((prevNotes) => {
            // Evitar duplicatas se a nota já existir (improvável se a lógica estiver correta)
            if (prevNotes.find((note) => note.id === payload.id))
              return prevNotes;
            return [...prevNotes, { id: payload.id, html: payload.texto }];
          });
        } else if (type === "NOTA_UPDATED_ITEM") {
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.id === payload.id ? { ...note, html: payload.texto } : note,
            ),
          );
        } else if (type === "NOTA_DELETED_ITEM") {
          // Se o backend enviar NOTA_DELETED_ITEM apenas com ID, esta condição de filtro (payload.r e payload.colum)
          // precisaria ser ajustada especificamente para NOTA_DELETED_ITEM, como foi feito em Coluna-1.js.
          // No momento, o backend para delete de nota está configurado para enviar apenas ID.
          setNotes((prevNotes) =>
            prevNotes.filter((note) => note.id !== payload.id),
          );
        }
      }
      // Lógica para NOTA_DELETED_ITEM se o payload só tiver ID (como está no backend atualmente)
      // Esta lógica é separada porque não podemos filtrar por r e colum se eles não estão no payload.
      // Isso significa que TODAS as instâncias de EditorNotes tentarão remover a nota pelo ID.
      // Se isso for um problema (ex: IDs não únicos globalmente), o backend DEVE enviar r e colum para delete.
      else if (
        type === "NOTA_DELETED_ITEM" &&
        payload &&
        payload.id !== undefined &&
        payload.r === undefined &&
        payload.colum === undefined
      ) {
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note.id !== payload.id),
        );
      }
      lastProcessedTimestampRef.current = lastMessage.timestamp;
    }
  }, [lastMessage, r, colum, setNotes]);

  // Handlers
  const handleInput = () => setCurrentNote(editorRef.current.innerHTML);

  const handleEdit = (note) => {
    setEditingNoteId(note.id);
    setCurrentNote(note.html);
    editorRef.current.innerHTML = note.html;
    setBoldActive(document.queryCommandState("bold"));
    setItalicActive(document.queryCommandState("italic"));
    setActiveColor(null);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setCurrentNote("");
    editorRef.current.innerHTML = "";
    setBoldActive(false);
    setItalicActive(false);
    setActiveColor(null);
  };

  const handleSubmit = async () => {
    if (!currentNote.trim()) return;
    try {
      if (editingNoteId) {
        const response = await fetch("/api/v1/tables/nota", {
          // Substitua pela sua rota de API para atualizar notas
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: editingNoteId, texto: currentNote }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.message || `Erro ao atualizar nota: ${response.status}`,
          );
        }

        // A atualização do estado 'notes' será feita pela mensagem WebSocket 'NOTA_UPDATED_ITEM'
        setEditingNoteId(null); // Sai do modo de edição
      } else {
        const noteOBJ = { texto: currentNote, r, colum };
        // A função Execute.sendToNota fará o POST.
        // O backend, após salvar, enviará uma mensagem WebSocket 'NOTA_NEW_ITEM'.
        // O estado 'notes' será atualizado por essa mensagem.
        await Execute.sendToNota(noteOBJ);
      }
      // Limpar o editor após o envio da requisição HTTP.
      // A atualização da lista de notas virá via WebSocket.
      editorRef.current.innerHTML = "";
      setCurrentNote("");
      setBoldActive(false);
      setItalicActive(false);
      setActiveColor(null);
    } catch (error) {
      console.error("Erro ao salvar/editar nota:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Execute.removeNota fará a requisição DELETE.
      // O backend, após excluir, enviará uma mensagem WebSocket 'NOTA_DELETED_ITEM'.
      await Execute.removeNota(id);
    } catch (error) {
      console.error("Erro ao excluir nota:", error);
    }
  };

  return (
    <>
      {/* Toolbar de Criação */}
      <div className="flex items-center gap-4 mb-2">
        <div
          onMouseDown={() => saveSelection()}
          onClick={() => applyFormat("bold")}
          className={`indicator cursor-pointer ${boldActive ? "text-base-content" : "text-base-content/50"}`}
        >
          <input
            type="checkbox"
            className="hidden"
            checked={boldActive}
            readOnly
          />
          <span className="font-bold">
            <BoldIcon size={16} />
          </span>
          {boldActive && (
            <span className="indicator-item indicator-top-right">
              <CheckIcon size={12} />
            </span>
          )}
        </div>
        <div
          onMouseDown={() => saveSelection()}
          onClick={() => applyFormat("italic")}
          className={`indicator cursor-pointer ${italicActive ? "text-base-content" : "text-base-content/50"}`}
        >
          <input
            type="checkbox"
            className="hidden"
            checked={italicActive}
            readOnly
          />
          <span className="italic">
            <ItalicIcon size={16} />
          </span>
          {italicActive && (
            <span className="indicator-item indicator-top-right">
              <CheckIcon size={12} />
            </span>
          )}
        </div>
        {colors.map((c) => (
          <div
            key={c.value}
            onMouseDown={() => saveSelection()}
            onClick={() => {
              const isActive = activeColor === c.value;
              applyFormat("foreColor", isActive ? "#000000" : c.value);
              setActiveColor(isActive ? null : c.value);
            }}
            className={`indicator cursor-pointer ${
              activeColor === c.value
                ? "text-base-content"
                : "text-base-content/50"
            }`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={activeColor === c.value}
              readOnly
            />
            <span
              style={{ color: c.value }}
              className={activeColor === c.value ? "" : "opacity-50"}
            >
              {c.icon}
            </span>
            {activeColor === c.value && (
              <span className="indicator-item indicator-top-right">
                <CheckIcon size={12} />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Editor de Criação */}
      <div
        ref={editorRef}
        contentEditable
        className="p-2 border border-base-300 rounded-lg h-32 overflow-auto mb-2 whitespace-pre-wrap break-words"
        onInput={handleInput}
        suppressContentEditableWarning
      />
      <button
        className={`btn btn-soft ${editingNoteId ? "btn-primary" : "btn-secondary"} mb-4`}
        onClick={handleSubmit}
      >
        {editingNoteId ? "Atualizar Nota" : "Salvar Nota"}
      </button>
      {editingNoteId && (
        <button
          className="btn btn-soft btn-error ml-2 mb-4"
          onClick={handleCancelEdit}
        >
          Cancelar
        </button>
      )}

      {/* Lista de Notas */}
      <ul className="space-y-4">
        {notes.length === 0 && (
          <li className="text-center text-base-content/50">
            Nenhuma nota salva.
          </li>
        )}
        {[...notes] // Cria uma cópia para não modificar o array original
          .sort((a, b) => b.id - a.id) // Ordena do maior ID (mais recente) para o menor
          .map((note) => (
            <li
              key={note.id}
              className="p-4 bg-base-200 rounded-lg shadow break-all"
            >
              <div className="flex justify-between items-start">
                <div
                  className="prose max-w-full break-words whitespace-pre-wrap text-pretty"
                  dangerouslySetInnerHTML={{ __html: note.html }}
                />
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <button
                    className="btn btn-xs btn-soft btn-primary"
                    onClick={() => handleEdit(note)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-xs btn-soft btn-error"
                    onClick={() => handleDelete(note.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </>
  );
};

export default EditorNotes;
