/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import Pessoal from "./Pessoal.js";
import Oficina from "./Oficina.js";
import SaidasPessoal from "./SaidasPessoal.js";
import SaidasOficina from "./SaidasOficina.js";
import TabelaAnual from "../T/TabelaAnual.js";
import SaldoMensal from "../T/SaldoMensal.js";
import Execute from "models/functions.js";
import { useWebSocket } from "../../../contexts/WebSocketContext.js";

const Gastos = ({ letras }) => {
  const [variosData, setVariosData] = useState([]);
  const [gastosData, setGastosData] = useState([]);
  const { lastMessage } = useWebSocket();

  const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };

  const processarDados = (dados, campoData, camposValor) => {
    const somasDiarias = {};
    const campos = Array.isArray(camposValor) ? camposValor : [camposValor];

    dados?.forEach((item) => {
      try {
        const data = item[campoData]?.substring(0, 10);
        if (!data) return;

        const totalValor = campos.reduce(
          (acc, campo) => acc + (Number(item[campo]) || 0),
          0,
        );

        somasDiarias[data] = (somasDiarias[data] || 0) + totalValor;
      } catch (error) {
        console.error("Erro ao processar item:", item, error);
      }
    });

    return Object.entries(somasDiarias).map(([data, total]) => ({
      data,
      valor: formatCurrency(total),
    }));
  };

  const fetchVariosData = async () => {
    if (!letras) return;
    try {
      const varios = await Execute.receiveFromCGastos(letras);
      setVariosData(processarDados(varios, "data", ["real", "pix"]));
    } catch (error) {
      console.error("Erro ao buscar dados 'varios':", error);
      setVariosData([]);
    }
  };

  const fetchGastosData = async () => {
    if (!letras) return;
    try {
      const gastos = await Execute.receiveFromSaidaP(letras);
      setGastosData(processarDados(gastos, "pago", "valor"));
    } catch (error) {
      console.error("Erro ao buscar dados 'gastos':", error);
      setGastosData([]);
    }
  };

  useEffect(() => {
    fetchVariosData();
    fetchGastosData();
  }, [letras]);

  useEffect(() => {
    if (lastMessage?.data) {
      const { type } = lastMessage.data;

      // Atualizar váriosData (CGastos)
      if (type.startsWith("GASTOS_C_")) {
        fetchVariosData();
      }
      // Atualizar gastosData (SaidaP) sem verificar o payload
      else if (type.startsWith("SAIDAS_PESSOAL_")) {
        fetchGastosData();
      }
    }
  }, [lastMessage, letras]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <Pessoal letras={letras} />
        <Oficina letras={letras} />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <TabelaAnual titulo="VARIOS" cor="warning" dados={variosData} />
        <SaldoMensal
          titulo=" VARIOS - GASTOS"
          data1={variosData}
          titulo1="Varios"
          data2={gastosData}
          titulo2="Gastos"
        />
        <TabelaAnual titulo="GASTOS" cor="warning" dados={gastosData} />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <SaidasPessoal letras={letras} />
        <SaidasOficina letras={letras} />
      </div>
    </div>
  );
};

export default Gastos;
