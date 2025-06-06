import { useState, useEffect, useRef } from "react";
import Calculadora from "./Calculadora.js";
import Execute from "models/functions";
import BSTA from "./BSATable.js";
import Deve from "./Deve.js";
import Devo from "./Devo.js";
import Pendente from "./Pendente.js";
import Pagamentos from "./Pagamentos.js";

const Rcontent = ({ codigoExterno, r }) => {
  // Referência para o valor de codigoExterno, para garantir que não altere depois de passado
  const codigoExternoRef = useRef(codigoExterno);
  const tablesToSearch = useRef(["R", "deve", "devo", "cadastro"]);

  // Se o codigoExterno for passado, não alteramos o estado de codigo
  const [codigo, setCodigo] = useState(codigoExterno || "");
  const [nome, setNome] = useState("");
  const [plusCalculadora, setPlusCalculadora] = useState(0);
  const [valuesCalculadora, setValuesCalculadora] = useState(
    Array(28).fill(""),
  );
  const [data, setData] = useState();
  const [selectedPendenteItem, setSelectedPendenteItem] = useState(null);

  useEffect(() => {
    if (codigoExterno !== codigoExternoRef.current) {
      codigoExternoRef.current = codigoExterno;
      setCodigo(codigoExterno || "");
    }
  }, [codigoExterno]);

  useEffect(() => {
    let isMounted = true;
    // Se um item foi selecionado do Pendente, não busca o nome automaticamente
    if (selectedPendenteItem) {
      return;
    }

    const fetchNome = async () => {
      if (!codigo) {
        if (isMounted) {
          setNome("");
          setData(undefined);
        }
        return;
      }

      try {
        let foundItem = null;
        for (const table of tablesToSearch.current) {
          const items = await Execute.receiveFromRDeveDevo(table);
          foundItem = items.find((item) => item.codigo === codigo);
          if (foundItem) break;
        }

        if (isMounted && foundItem) {
          setNome(foundItem.nome || "");
          setData(foundItem.data);
        } else if (isMounted) {
          setNome("");
          setData(undefined);
        }
      } catch (error) {
        console.error("Falha ao buscar nome:", error);
        if (isMounted) {
          setNome("");
          setData(undefined);
        }
      }
    };

    fetchNome();
    return () => {
      isMounted = false;
    };
  }, [codigo, selectedPendenteItem]);

  useEffect(() => {
    if (selectedPendenteItem) {
      return;
    }

    let isMounted = true;
    const fetchCodigo = async () => {
      if (!nome) {
        if (isMounted) setCodigo("");
        return;
      }

      try {
        let foundCodigo = "";
        for (const table of tablesToSearch.current) {
          const items = await Execute.receiveFromRDeveDevo(table);
          const foundItem = items.find((item) => item.nome === nome);
          if (foundItem) {
            foundCodigo = foundItem.codigo;
            break;
          }
        }
        if (isMounted) setCodigo(foundCodigo);
      } catch (error) {
        console.error("Falha ao buscar código:", error);
      }
    };

    fetchCodigo();
    return () => {
      isMounted = false;
    };
  }, [nome, selectedPendenteItem]); // Adiciona selectedPendenteItem como dependência

  // Atualizando o estado 'codigo' ou 'nome' diretamente
  const handleCodigoChange = (novoCodigo) => {
    if (!codigoExternoRef.current) {
      setCodigo(novoCodigo); // Só altera o código se codigoExterno não estiver definido
      setSelectedPendenteItem(null); // Limpa a seleção do pendente
      setPlusCalculadora(0); // Reseta o plus
      setValuesCalculadora(Array(28).fill("")); // Reseta os values
    }
  };

  const handleNomeChange = (novoNome) => {
    setNome(novoNome);
    setSelectedPendenteItem(null); // Limpa a seleção do pendente
    setPlusCalculadora(0); // Reseta o plus
    setValuesCalculadora(Array(28).fill("")); // Reseta os values
  };

  const handlePlusChange = (newPlus) => {
    setPlusCalculadora(newPlus);
    // Opcional: Se alterar o plus manualmente deve "desvincular" do item pendente:
    // setSelectedPendenteItem(null);
  };

  const handleValuesChange = (newValues) => {
    setValuesCalculadora(newValues);
    // Opcional: Se alterar os valores manualmente deve "desvincular" do item pendente:
    // setSelectedPendenteItem(null);
  };

  const handlePendenteSelect = (item) => {
    setSelectedPendenteItem(item);
    setCodigo(item.codigo || "");
    setNome(item.nome || "");
    setPlusCalculadora(Number(item.comissao) || 0);
    const itemValues = Array.from({ length: 28 }, (_, i) => {
      const propName = `v${String(i + 1).padStart(2, "0")}`;
      return item[propName] !== undefined && item[propName] !== null
        ? String(item[propName])
        : "";
    });
    setValuesCalculadora(itemValues);
    setData(item.data); // Atualiza a data também, se relevante
  };
  return (
    <div>
      <div className="grid grid-flow-col auto-cols-auto gap-2">
        <div>
          <BSTA codigo={codigo} r={r} />
        </div>
        <div>
          <Pendente r={r} onSelectItem={handlePendenteSelect} />
          <div className="mt-2">
            <Deve codigo={codigo} r={r} />
          </div>
        </div>
        <div>
          <Calculadora
            r={r}
            codigo={codigo}
            nome={nome}
            plus={plusCalculadora}
            values={valuesCalculadora}
            onCodigoChange={handleCodigoChange}
            onNomeChange={handleNomeChange}
            onPlusChange={handlePlusChange}
            onValuesChange={handleValuesChange}
            data={data}
          />
          <Devo codigo={codigo} r={r} />
        </div>
        <div>
          <Pagamentos r={r} />
        </div>
      </div>
    </div>
  );
};

export default Rcontent;
