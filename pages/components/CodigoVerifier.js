import { useEffect, useState } from "react";

const CodigoVerifier = ({ codigo }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!codigo) {
        setCount(0);
        return;
      }

      try {
        const response1 = await fetch("/api/v1/tables/verificador", {});
        if (!response1.ok)
          throw new Error("Erro ao buscar dados da primeira tabela");

        const data1 = await response1.json();
        let count1 = 0;
        if (Array.isArray(data1.rows)) {
          const matchingCodes1 = data1.rows.filter(
            (item) => item.codigo === codigo,
          );
          count1 = matchingCodes1.length;
        }

        const response2 = await fetch("/api/v1/tables/R1", {});
        if (!response2.ok)
          throw new Error("Erro ao buscar dados da segunda tabela");

        const data2 = await response2.json();
        let count2 = 0;
        if (Array.isArray(data2.rows)) {
          const matchingCodes2 = data2.rows.filter(
            (item) => item.codigo === codigo,
          );
          count2 = matchingCodes2.length;
        }

        // Somando os resultados das duas tabelas e atualizando o estado
        setCount(count1 + count2);
      } catch (error) {
        console.error("Erro ao verificar código:", error);
      }
    };

    fetchData();
  }, [codigo]); // Dispara sempre que `codigo` mudar

  return <div className="badge badge-outline badge-success mx-2">{count}</div>;
};

export default CodigoVerifier;
