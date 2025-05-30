/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import TabelaAnual from "./TabelaAnual.js";
import Execute from "models/functions.js";
import SaldoMensal from "./SaldoMensal";
import { useWebSocket } from "../../../contexts/WebSocketContext.js";

const Tcontent = ({ r, oficina }) => {
  const [papelData, setPapelData] = useState([]);
  const [despesasData, setDespesasData] = useState([]);
  const { lastMessage } = useWebSocket(); // Adicione esta linha

  const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };

  const processarDados = (dados, campoData, campoValor) => {
    const somasDiarias = {};

    dados?.forEach((item) => {
      try {
        const data = item[campoData].substring(0, 10);
        const valor = Number(item[campoValor]) || 0;

        somasDiarias[data] = (somasDiarias[data] || 0) + valor;
      } catch (error) {
        console.error("Erro ao processar item:", item, error);
      }
    });

    return Object.entries(somasDiarias).map(([data, total]) => ({
      data,
      valor: formatCurrency(total),
    }));
  };

  const fetchPapelData = useCallback(async () => {
    if (typeof r === "undefined" || r === null) {
      setPapelData([]);
      return;
    }
    try {
      const papel = await Execute.receiveFromPapelC(r);
      setPapelData(papel ? processarDados(papel, "data", "papel") : []);
    } catch (error) {
      console.error("Erro ao buscar dados 'papel':", error);
      setPapelData([]);
    }
  }, [r]);

  const fetchDespesasData = useCallback(async () => {
    if (typeof oficina === "undefined" || oficina === null) {
      setDespesasData([]);
      return;
    }
    try {
      const despesas = await Execute.receiveFromSaidaOficina(oficina);
      setDespesasData(
        despesas ? processarDados(despesas, "pago", "valor") : [],
      );
    } catch (error) {
      console.error("Erro ao buscar dados 'despesas':", error);
      setDespesasData([]);
    }
  }, [oficina]);

  useEffect(() => {
    fetchPapelData();
    fetchDespesasData();
  }, [fetchPapelData, fetchDespesasData]);

  useEffect(() => {
    if (lastMessage?.data) {
      let messageData;

      try {
        // Tenta parsear se for JSON string
        if (typeof lastMessage.data === "string") {
          messageData = JSON.parse(lastMessage.data);
        } else {
          // Caso já seja objeto
          messageData = lastMessage.data;
        }
      } catch (error) {
        console.error("Erro ao parsear lastMessage.data:", error);
        return; // Sai do useEffect, pois não conseguimos processar
      }

      const { type, payload } = messageData;

      if (typeof type === "string") {
        if (type.startsWith("PAPELC_")) {
          if (
            (payload &&
              payload.r !== undefined &&
              String(payload.r) === String(r)) ||
            (payload && payload.r === undefined)
          ) {
            fetchPapelData();
          }
        } else if (type.startsWith("SAIDAS_OFICINA_")) {
          if (
            (payload &&
              payload.oficina !== undefined &&
              String(payload.oficina) === String(oficina)) ||
            (payload && payload.oficina === undefined)
          ) {
            fetchDespesasData();
          }
        }
      }
    }
  }, [lastMessage, r, oficina, fetchPapelData, fetchDespesasData]);

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <TabelaAnual titulo="PAPEL" cor="warning" dados={papelData} />
      <SaldoMensal
        titulo=" PAPEL - DESPESAS"
        data1={papelData}
        titulo1="Papel"
        data2={despesasData}
        titulo2="Despesas"
      />
      <TabelaAnual titulo="DESPESAS" cor="warning" dados={despesasData} />
    </div>
  );
};

export default Tcontent;
