/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useCallback } from "react";
import TabelaAnual from "../T/TabelaAnual.js";
import SaldoMensal from "../T/SaldoMensal.js";
import Execute from "models/functions.js";
import { useWebSocket } from "../../../contexts/WebSocketContext.js";

const AnualContent = () => {
  const [papelData, setPapelData] = useState([]);
  const [despesasDataP, setDespesasDataP] = useState([]);
  const [despesasDataO, setDespesasDataO] = useState([]);
  const [variosData, setVariosData] = useState([]);
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

    // Garante que camposValor seja um array
    const campos = Array.isArray(camposValor) ? camposValor : [camposValor];

    dados?.forEach((item) => {
      try {
        const data = item[campoData].substring(0, 10);
        let totalValor = 0;

        // Soma todos os campos especificados
        campos.forEach((campo) => {
          totalValor += Number(item[campo]) || 0;
        });

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

  const fetchPapelData = useCallback(async () => {
    try {
      const papel = await Execute.receiveAnualFromPapelC();
      setPapelData(papel ? processarDados(papel, "data", "papel") : []);
    } catch (error) {
      console.error("Erro ao buscar dados anuais 'papel':", error);
      setPapelData([]);
    }
  }, []);

  const fetchDespesasPData = useCallback(async () => {
    try {
      const despesasP = await Execute.receiveAnualFromSaidaP();
      setDespesasDataP(
        despesasP ? processarDados(despesasP, "pago", "valor") : [],
      );
    } catch (error) {
      console.error("Erro ao buscar dados anuais 'despesas P':", error);
      setDespesasDataP([]);
    }
  }, []);

  const fetchDespesasOData = useCallback(async () => {
    try {
      const despesasO = await Execute.receiveAnualFromSaidaO();
      setDespesasDataO(
        despesasO ? processarDados(despesasO, "pago", "valor") : [],
      );
    } catch (error) {
      console.error("Erro ao buscar dados anuais 'despesas O':", error);
      setDespesasDataO([]);
    }
  }, []);

  const fetchVariosData = useCallback(async () => {
    try {
      const varios = await Execute.receiveAnualFromC();
      setVariosData(
        varios ? processarDados(varios, "date", ["sis", "alt", "base"]) : [],
      );
    } catch (error) {
      console.error("Erro ao buscar dados anuais 'varios':", error);
      setVariosData([]);
    }
  }, []);

  useEffect(() => {
    fetchPapelData();
    fetchDespesasPData();
    fetchDespesasOData();
    fetchVariosData();
  }, [fetchPapelData, fetchDespesasPData, fetchDespesasOData, fetchVariosData]);

  useEffect(() => {
    if (lastMessage?.data) {
      let messageData;

      try {
        if (typeof lastMessage.data === "string") {
          messageData = JSON.parse(lastMessage.data);
        } else {
          messageData = lastMessage.data;
        }
      } catch (error) {
        console.error("Erro ao parsear lastMessage.data:", error);
        return; // Sai do efeito
      }

      const { type } = messageData;

      if (typeof type === "string") {
        if (type.startsWith("PAPELC_")) {
          fetchPapelData();
        } else if (type.startsWith("SAIDAS_PESSOAL_")) {
          fetchDespesasPData();
        } else if (type.startsWith("SAIDAS_OFICINA_")) {
          fetchDespesasOData();
        } else if (type.startsWith("C_")) {
          fetchVariosData();
        }
      }
    }
  }, [
    lastMessage,
    fetchPapelData,
    fetchDespesasPData,
    fetchDespesasOData,
    fetchVariosData,
  ]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-3">
        <TabelaAnual titulo="PAPEL" cor="warning" dados={papelData} />
        <SaldoMensal
          titulo=" PAPEL - DESPESAS OFICINA"
          data1={papelData}
          titulo1="Papel"
          data2={despesasDataO}
          titulo2="Despesas OFICINA"
        />
        <TabelaAnual
          titulo="DESPESAS OFICINA"
          cor="warning"
          dados={despesasDataO}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-3 mt-2">
        <TabelaAnual titulo="VARIOS" cor="warning" dados={variosData} />
        <SaldoMensal
          titulo="VARIOS - DESPESAS ABC"
          data1={variosData}
          titulo1="VARIOS"
          data2={despesasDataP}
          titulo2="Despesas ABC"
        />
        <TabelaAnual
          titulo="DESPESAS ABC"
          cor="warning"
          dados={despesasDataP}
        />
      </div>
    </>
  );
};

export default AnualContent;
