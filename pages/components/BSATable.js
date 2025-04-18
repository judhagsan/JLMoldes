import React, { useEffect, useState } from "react";
import Execute from "models/functions";
import Use from "models/utils";

const BSA = ({ codigo }) => {
  const [dados, setDados] = useState([]);
  const loadData = async () => {
    const data = await Execute.receiveFromR1();
    setDados(data.sort((a, b) => new Date(a.data) - new Date(b.data)));
  };

  useEffect(() => {
    loadData(); // Busca inicial

    const intervalId = setInterval(loadData, 5000); // Atualiza a cada 5s
    return () => clearInterval(intervalId);
  }, []);

  // Busca imediatamente quando o código muda
  useEffect(() => {
    loadData();
  }, [codigo]);

  return (
    <div className="overflow-x-auto rounded-box border border-warning bg-base-100">
      <table className="table table-xs">
        <thead>
          <tr>
            <th className="hidden">ID</th>
            <th className="w-36">Data</th>
            <th className="hidden">CODIGO</th>
            <th>Nome</th>
            <th className="w-10">Base</th>
            <th className="w-10">Sis</th>
            <th className="w-10">Alt</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr
              key={item.id}
              className={
                item.codigo === codigo
                  ? "bg-green-200"
                  : "border-b border-warning"
              }
            >
              <td className="hidden">{item.id}</td>
              <td>{Use.formatarData(item.data)}</td>
              <td className="hidden">{item.codigo}</td>
              <td>{item.nome}</td>
              <td>{item.base}</td>
              <td>{item.sis}</td>
              <td>{item.alt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BSA;
