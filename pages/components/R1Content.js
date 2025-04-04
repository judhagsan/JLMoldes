import { useState, useEffect, useRef } from "react";
import Calculadora from "./Calculadora.js";
import Execute from "models/functions";
import BSTA from "./BSATable.js";
import Deve from "./Deve.js";
import Devo from "./Devo.js";

const R1content = ({ codigoExterno }) => {
  // Referência para o valor de codigoExterno, para garantir que não altere depois de passado
  const codigoExternoRef = useRef(codigoExterno);
  const tablesToSearch = useRef(["R1", "deve", "devo", "cadastro"]);

  // Se o codigoExterno for passado, não alteramos o estado de codigo
  const [codigo, setCodigo] = useState(codigoExterno || "");
  const [nome, setNome] = useState("");
  const [data, setData] = useState();

  useEffect(() => {
    if (codigoExterno !== codigoExternoRef.current) {
      codigoExternoRef.current = codigoExterno;
      setCodigo(codigoExterno || "");
    }
  }, [codigoExterno]);

  useEffect(() => {
    let isMounted = true;

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
          const items = await Execute.reciveFromR1DeveDevo(table);
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
  }, [codigo]); // Apenas codigo como dependência

  // Busca codigo quando nome muda
  useEffect(() => {
    let isMounted = true;
    const fetchCodigo = async () => {
      if (!nome) {
        if (isMounted) setCodigo("");
        return;
      }

      try {
        let foundCodigo = "";
        for (const table of tablesToSearch.current) {
          const items = await Execute.reciveFromR1DeveDevo(table);
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
  }, [nome]); // A dependência é o 'nome', pois a busca do código depende dele

  // Atualizando o estado 'codigo' ou 'nome' diretamente
  const handleCodigoChange = (novoCodigo) => {
    if (!codigoExternoRef.current) {
      setCodigo(novoCodigo); // Só altera o código se codigoExterno não estiver definido
    }
  };

  const handleNomeChange = (novoNome) => {
    setNome(novoNome);
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <BSTA codigo={codigo} />
        </div>
        <div>
          <Deve codigo={codigo} />
        </div>
        <div>
          <Calculadora
            codigo={codigo}
            nome={nome}
            onCodigoChange={handleCodigoChange} // Passando a função de alteração para a Calculadora
            onNomeChange={handleNomeChange} // Passando a função de alteração para a Calculadora
            data={data}
          />
          <Devo codigo={codigo} />
        </div>
      </div>
    </div>
  );
};

export default R1content;
