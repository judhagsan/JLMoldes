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
        const response = await fetch("/api/v1/tables/verificador", {});
        if (!response.ok) throw new Error("Erro ao buscar dados");

        const data = await response.json();
        if (Array.isArray(data.rows)) {
          const matchingCodes = data.rows.filter(
            (item) => item.codigo === codigo,
          );
          setCount(matchingCodes.length);
        }
      } catch (error) {
        console.error("Erro ao verificar código:", error);
      }
    };

    fetchData();
  }, [codigo]); // Dispara sempre que `codigo` mudar

  return <div className="badge badge-outline badge-success mx-2">{count}</div>;
};

export default CodigoVerifier;
