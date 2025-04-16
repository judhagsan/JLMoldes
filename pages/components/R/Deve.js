import React, { useEffect, useState } from "react";
import Execute from "models/functions";
import Use from "models/utils";

const Deve = ({ codigo }) => {
  const [dados, setDados] = useState([]);
  const loadData = async () => {
    const data = await Execute.receiveFromDeve();
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
    <div className="overflow-x-auto rounded-box border border-secondary bg-base-100">
      <table className="table table-xs">
        <thead>
          <tr>
            <th className="hidden">ID</th>
            <th className="w-36">Data</th>
            <th className="hidden">CODIGO</th>
            <th>Nome</th>
            <th className="w-20">Deve</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr
              key={item.id}
              className={
                item.codigo === codigo
                  ? "bg-green-200"
                  : "border-b border-secondary"
              }
            >
              <td className="hidden">{item.id}</td>
              <td>{Use.formatarDataHora(item.data)}</td>
              <td className="hidden">{item.codigo}</td>
              <td>{item.nome}</td>
              <td>$ {Number(item.valor).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Deve;
