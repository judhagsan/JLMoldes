import { useState, useEffect } from "react";
import TabelaM from "./TabelaM.js";
import TabelaMRight from "./TabelaMRight.js";
import CodigoVerifier from "./CodigoVerifier.js";
import Calculadora from "./Calculadora.js";
import ErrorComponent from "./Errors.js";
const Mcontent = () => {
  const [observacao, setObservacao] = useState("");
  const [dec, setDec] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [sis, setSis] = useState("");
  const [base, setBase] = useState("");
  const [alt, setAlt] = useState("");
  const [showError, setShowError] = useState(false);

  // Busca a observação correspondente ao código digitado
  useEffect(() => {
    const fetchDados = async () => {
      if (!codigo) {
        setObservacao("");
        setNome("");
        return;
      }

      try {
        const response = await fetch("/api/v1/cadastro");
        if (!response.ok) throw new Error("Erro ao buscar dados");

        const data = await response.json();
        const registroEncontrado = data.rows.find(
          (item) => item.codigo === codigo,
        );

        if (registroEncontrado) {
          setObservacao(registroEncontrado.observacao || "");
          setNome(registroEncontrado.nome || "");
        } else {
          setObservacao("");
          setNome("");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchDados();
  }, [codigo]);

  useEffect(() => {
    const fetchDados = async () => {
      if (!nome) {
        setObservacao("");
        setCodigo("");
        return;
      }

      try {
        const response = await fetch("/api/v1/cadastro");
        if (!response.ok) throw new Error("Erro ao buscar dados");

        const data = await response.json();
        const registroEncontrado = data.rows.find((item) => item.nome === nome);

        if (registroEncontrado) {
          setObservacao(registroEncontrado.observacao || "");
          setCodigo(registroEncontrado.codigo || "");
        } else {
          setObservacao("");
          setCodigo("");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchDados();
  }, [nome]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ordemInputValues = { observacao, codigo, dec, nome, sis, base, alt };

    // Condição para separar os dados em duas tabelas
    let hasInserted = false; // Flag para evitar inserções duplicadas

    // Se todos os valores forem 0, exibe o erro e interrompe a execução
    if (parseInt(base) === 0 && parseInt(sis) === 0 && parseInt(alt) === 0) {
      showErrorToast();
    } else {
      if (parseInt(base) > 0) {
        try {
          const responseBase = await fetch("/api/v1/tables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              observacao,
              codigo,
              dec,
              nome,
              sis: 0,
              base,
              alt: 0,
            }),
          });

          if (!responseBase.ok)
            throw new Error("Erro ao enviar os dados para a tabela 'base'.");
          await responseBase.json();
          hasInserted = true; // Marca que pelo menos uma inserção foi feita
        } catch (error) {
          console.error("Erro ao enviar base:", error);
        }
      }

      if (parseInt(sis) > 0 || parseInt(alt) > 0) {
        try {
          const responseSisAlt = await fetch("/api/v1/tables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              observacao,
              codigo,
              dec,
              nome,
              sis,
              base: 0,
              alt,
            }),
          });

          if (!responseSisAlt.ok)
            throw new Error("Erro ao enviar os dados para a tabela 'sis_alt'.");
          await responseSisAlt.json();
          hasInserted = true; // Marca que pelo menos uma inserção foi feita
        } catch (error) {
          console.error("Erro ao enviar sis_alt:", error);
        }
      }

      // Se nenhum dado foi inserido antes, faz o envio para a tabela padrão
      if (!hasInserted) {
        try {
          const response = await fetch("/api/v1/tables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ordemInputValues),
          });

          if (!response.ok) throw new Error("Erro ao enviar os dados.");
          await response.json();
        } catch (error) {
          console.error("Erro ao enviar:", error);
        }
      }

      // Limpa os campos após o envio
      setObservacao("");
      setDec("");
      setCodigo("");
      setNome("");
      setSis("");
      setBase("");
      setAlt("");
    }
  };

  const showErrorToast = () => {
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 5000);
  };

  return (
    <div className="h-full">
      {/* Formulário */}
      <div className="bg-base-100 border-base-300 pb-2 px-[15%]">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Observações"
            className="input input-info input-xs"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
          <input
            type="text"
            placeholder="CODIGO"
            className="input input-info input-xs w-24"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <input
            type="text"
            placeholder="DEC"
            required
            className="input input-info input-xs w-24"
            value={dec}
            maxLength={1} // Limita o número máximo de caracteres para 1
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              if (/^[A-Z]*$/.test(value)) {
                setDec(value);
              }
            }}
          />
          <input
            type="text"
            placeholder="Nome"
            className="input input-info input-xs"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="number"
            required
            placeholder="Sis"
            className="input input-info input-xs w-24"
            value={sis}
            onChange={(e) => setSis(e.target.value)}
          />
          <input
            type="number"
            required
            placeholder="Base"
            className="input input-info input-xs w-24"
            value={base}
            onChange={(e) => setBase(e.target.value)}
          />
          <input
            type="number"
            required
            placeholder="Alt"
            className="input input-info input-xs w-24"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
          <button type="submit" className="btn btn-xs btn-info">
            Enviar
          </button>
          <CodigoVerifier codigo={codigo} /> {/* Exibe a contagem ao lado */}
        </form>
      </div>

      {/* Tabelas */}
      <div className="columns-2">
        <TabelaM codigo={codigo} />
        <TabelaMRight codigo={codigo} />
      </div>
      <div className="divider divider-neutral">OFICINA</div>
      <div>
        <Calculadora />
      </div>
      {showError && <ErrorComponent errorCode="000SAB" />}
    </div>
  );
};

export default Mcontent;
