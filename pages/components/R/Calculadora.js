import Execute from "models/functions";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Use from "models/utils.js";

let codigoAleatorioGlobal = "";
function gerarEArmazenarCodigoAleatorio() {
  codigoAleatorioGlobal = Math.random().toString(36).slice(2, 10).toUpperCase();
  console.log("Novo código aleatório gerado:", codigoAleatorioGlobal); // Para fins de demonstração
  return codigoAleatorioGlobal;
}

const Calculadora = ({
  codigo,
  nome,
  onCodigoChange,
  onNomeChange,
  data,
  r,
}) => {
  const ErrorComponent = dynamic(() => import("../Errors.js"), { ssr: false });
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setShowError(false); // Resetar no cliente após a montagem
  }, []);

  // Efeito para esconder o erro após 5 segundos
  useEffect(() => {
    let timer;
    if (showError) {
      timer = setTimeout(() => setShowError(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [showError]);

  const [dadosR, setDadosR] = useState(0);
  const [idsArray, setIdsArray] = useState(0);
  const [decGroups, setDecGroups] = useState([]);

  const [valorDevo, setValorDevo] = useState(0);
  const [valorDeve, setValorDeve] = useState(0);
  const [deveIdsArray, setDeveIdsArray] = useState([]); // Novo estado para armazenar os deveids
  const [multiplier, setMultiplier] = useState(0);
  const [comissi, setComissi] = useState(0);
  const [desperdicio, setDesperdicio] = useState(0);
  const [plus, setPlus] = useState(0);
  const [values, setValues] = useState(Array(28).fill(""));
  const [pix, setPix] = useState("");
  const [real, setReal] = useState("");
  const [comentario, setComentario] = useState("");
  const [perdida, setPerdida] = useState("");

  // Calcula a soma bruta dos valores (novo cálculo)
  const sumValues = values.reduce((sum, current) => {
    const num = current === "" ? 0 : Number(current);
    return sum + num;
  }, 0);

  const handleMultiplierChange = (e) => {
    setMultiplier(Number(e.target.value));
  };
  const handlePlusChange = (e) => {
    setPlus(Number(e.target.value));
  };

  const handleValueChange = (index, e) => {
    const newValue = e.target.value;
    const newValues = [...values];
    newValues[index] = newValue;
    setValues(newValues);
  };

  // calculos da calculadora
  const comitions = plus * comissi;
  const papel = values.some((val) => val !== "")
    ? values.reduce((sum, current) => {
        const num = current === "" ? 0 : Number(current);
        return sum + num * multiplier;
      }, 0)
    : "";

  const total = papel + comitions;

  const totalGeral =
    (Number(dadosR) || 0) +
    sumValues * multiplier -
    valorDevo +
    valorDeve +
    comitions;

  const totalTroco = totalGeral - (Number(pix) || 0) - (Number(real) || 0);
  const pixMaisReal = Number(pix) + Number(real);
  // Buscar dados R agrupados por dec
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const resultado = await Execute.receiveFromRJustBSA(codigo, r);

        const groups = resultado.map((group) => ({
          dec: group.dec,
          base: Number(group.total_base) || 0,
          sis: Number(group.total_sis) || 0,
          alt: Number(group.total_alt) || 0,
          ids: group.ids || [],
        }));

        setDecGroups(groups);
        setDadosR(groups.reduce((sum, g) => sum + g.base + g.sis + g.alt, 0));
        setIdsArray(groups.flatMap((g) => g.ids));
      } catch (error) {
        console.error("Erro:", error);
        setDecGroups([]);
        setDadosR(0);
        setIdsArray([]);
      }
    };
    buscarDados();
  }, [codigo, r]);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        // Garante que codigo e r estão presentes antes de buscar
        if (!codigo || !r) {
          setValorDeve(0);
          setDeveIdsArray([]);
          // console.log("valorDeve/deveIds: codigo ou r ausente, definindo para padrões");
          return;
        }
        const resultado = await Execute.receiveFromDeveJustValor(codigo, r);

        const somaTotal = Number(resultado.total_valor || 0);
        const ids = resultado.deveids || [];

        setValorDeve(somaTotal);
        setDeveIdsArray(ids);
      } catch (error) {
        console.error(
          `Erro ao buscar valorDeve/deveIds para codigo: ${codigo}, r: ${r}:`,
          error,
        );
        setValorDeve(0);
        setDeveIdsArray([]);
      }
    };
    buscarDados();
  }, [codigo, r]);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const resultado = await Execute.receiveFromDevoJustValor(codigo);

        // Soma todos os valores
        const somaTotal = Number(resultado.total_valor || 0);

        setValorDevo(somaTotal);
      } catch (error) {
        console.error("Erro:", error);
        setValorDevo(0);
      }
    };
    buscarDados();
  }, [codigo]);

  useEffect(() => {
    const fetchData = async () => {
      const dataConfig = await Execute.receiveFromConfig();

      if (dataConfig.length > 0) {
        setMultiplier(dataConfig[0].m);
        setDesperdicio(dataConfig[0].d);
        setComissi(dataConfig[0].e);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSave = async (editedData) => {
    try {
      const response = await fetch("/api/v1/tables/R/calculadora", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleUpdateC = async (codigo, data, New, currentTotal, dec) => {
    try {
      // Decodificar a data
      const decodedData = decodeURIComponent(data);

      // Obter valores atuais do C para este dec
      const existingData = await Execute.receiveFromCData(
        codigo,
        decodedData,
        r,
        dec,
      );

      // Calcular novos valores
      const newSis = (existingData.sis || 0) + (New.sis || 0);
      const newAlt = (existingData.alt || 0) + (New.alt || 0);
      const newBase = (existingData.base || 0) + (New.base || 0);

      // Ajustar valores de real e pix para não ultrapassar o total permitido
      let adjustedReal = Number(real);
      let adjustedPix = Number(pix);

      // Calcular o máximo permitido para este grupo dec
      const maxForDec = newSis + newAlt + newBase;

      // Garantir que nenhum valor exceda o máximo do grupo
      adjustedReal = Math.min(adjustedReal, maxForDec);
      adjustedPix = Math.min(adjustedPix, maxForDec);

      // Ajustar soma se necessário
      const soma = adjustedReal + adjustedPix;
      if (soma > maxForDec) {
        const excesso = soma - maxForDec;
        const ratioReal = adjustedReal / soma;
        const ratioPix = adjustedPix / soma;

        adjustedReal -= Math.round(excesso * ratioReal);
        adjustedPix -= Math.round(excesso * ratioPix);

        // Garantir valores não negativos
        adjustedReal = Math.max(adjustedReal, 0);
        adjustedPix = Math.max(adjustedPix, 0);

        // Correção final de arredondamento
        if (adjustedReal + adjustedPix > maxForDec) {
          adjustedReal = maxForDec - adjustedPix;
        }
      }

      // Fazer a requisição PUT atualizada com dec
      const response = await fetch(
        `/api/v1/tables/c/calculadora?codigo=${codigo}&data=${decodedData}&r=${r}&dec=${dec}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sis: newSis,
            alt: newAlt,
            base: newBase,
            real: adjustedReal,
            pix: adjustedPix,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar registro no C");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao atualizar C para dec", dec, ":", error);
      throw error;
    }
  };

  const sendToCAndUpdateR = async (value) => {
    await Execute.removeDevo(codigo);
    const currentTotal = decGroups.reduce(
      (sum, g) => sum + g.base + g.sis + g.alt,
      0,
    );
    const excessoTotal = currentTotal - value;

    // Verificar existência no C para cada dec
    const existsMap = new Map();
    for (const group of decGroups) {
      const exists = await Execute.receiveFromCData(codigo, data, r, group.dec);
      existsMap.set(group.dec, exists);
    }

    if (excessoTotal > 0) {
      // Criar lista única para ajuste
      const allEntries = [];
      decGroups.forEach((g) => {
        allEntries.push(
          { dec: g.dec, type: "base", value: g.base },
          { dec: g.dec, type: "sis", value: g.sis },
          { dec: g.dec, type: "alt", value: g.alt },
        );
      });

      // Ordenar e ajustar valores
      allEntries.sort((a, b) => b.value - a.value);
      let remaining = excessoTotal;
      const adjustments = {};

      decGroups.forEach((g) => {
        adjustments[g.dec] = { base: g.base, sis: g.sis, alt: g.alt };
      });

      for (const entry of allEntries) {
        if (remaining <= 0) break;
        const subtract = Math.min(entry.value, remaining);
        adjustments[entry.dec][entry.type] -= subtract;
        remaining -= subtract;
      }

      // Atualizar R
      const novosDados = decGroups.map((g) => ({
        dec: g.dec,
        base: adjustments[g.dec].base,
        sis: adjustments[g.dec].sis,
        alt: adjustments[g.dec].alt,
        codigo,
        r,
      }));
      await handleSave(novosDados);

      // Atualizar/enviar para C
      for (const group of decGroups) {
        const diff = {
          base: group.base - adjustments[group.dec].base,
          sis: group.sis - adjustments[group.dec].sis,
          alt: group.alt - adjustments[group.dec].alt,
          real: Math.min(Number(real)), // Adicione
          pix: Math.min(Number(pix)), // Adicione
        };

        const exists = existsMap.get(group.dec);

        if (exists) {
          await handleUpdateC(codigo, data, diff, currentTotal, group.dec);
        } else {
          await Execute.sendToC({
            ...ObjC1,
            dec: group.dec,
            ...diff,
            real: Math.min(Number(real), diff.base + diff.sis + diff.alt),
            pix: Math.min(Number(pix), diff.base + diff.sis + diff.alt),
          });
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trocoValue = Number(totalTroco);

    try {
      if (dadosR && !valorDeve && trocoValue > 0 && !Number(total)) {
        await sendToCAndUpdateR(trocoValue);
        console.log("caiu em Pago Parte do R");

        //
      } else if (dadosR && !trocoValue && !Number(total) && !valorDeve) {
        await sendToCAndUpdateR(trocoValue);
        await Execute.removeMandR(idsArray);
        console.log("caiu em Pago todo R");
        //
      } else if (trocoValue < 0) {
        await Execute.removeDeve(codigo);
        await Execute.sendToDevo({
          nome,
          r,
          codigo,
          valor: Math.abs(trocoValue),
        });
        await Execute.removeMandR(idsArray);
        console.log("Caiu em Troco Menor que Zero.");
      } else if (
        trocoValue === totalGeral &&
        Number(pix) == 0 &&
        Number(real) == 0
      ) {
        if (Number(total) > 0) {
          const novoCodigo = gerarEArmazenarCodigoAleatorio();
          await Execute.removeDevo(codigo);
          await Execute.sendToDeve({
            deveid: novoCodigo,
            nome,
            r,
            data: Use.NowData(),
            codigo,
            valorpapel: papel,
            valorcomissao: comitions,
            valor: Number(total),
          });

          await Execute.sendToPapelC({
            ...ObjPapelC,
            deveid: novoCodigo,
            data: Use.NowData(),
            papelpix: 0,
            papelreal: 0,
            encaixepix: 0,
            encaixereal: 0,
          });
        } else {
          setShowError(true);
        }

        console.log("Deve Todo o Papel");
        //
      } else if (!trocoValue && valorDeve && dadosR) {
        const exists = await Execute.receiveFromCData(codigo, data);

        if (exists) {
          const values = totalGeral - Number(total) - pixMaisReal;
          await sendToCAndUpdateR(values);
          await Execute.removeDeve(codigo);
          await Execute.removeDevo(codigo);
          await Execute.removeMandR(idsArray);
          console.log("Existe no C");
        } else {
          await sendToCAndUpdateR(trocoValue);
          await Execute.removeDeve(codigo);
          await Execute.removeDevo(codigo);
          await Execute.removeMandR(idsArray);
        }
        console.log("Caiu em foi tudo pago Papel e R.");
        //
      } else if (valorDeve && !trocoValue) {
        await Execute.sendToDeveUpdate(
          codigo,
          trocoValue,
          r,
          deveIdsArray,
          Number(pix),
          Number(real),
        );
        await Execute.removeDeve(codigo);
        await Execute.removeDevo(codigo);

        console.log("Caiu em Foi pago todo o papel.");

        //
      } else if (valorDeve && trocoValue && !dadosR) {
        const novoCodigo = gerarEArmazenarCodigoAleatorio();
        await Execute.sendToDeve({
          deveid: novoCodigo,
          nome,
          r,
          data: Use.NowData(),
          codigo,
          valorpapel: papel,
          valorcomissao: comitions,
          valor: trocoValue,
        });
        await Execute.sendToPapelC({
          ...ObjPapelC,
          deveid: novoCodigo,
          data: Use.NowData(),
          papelpix: 0,
          papelreal: 0,
          encaixepix: 0,
          encaixereal: 0,
        });
        await Execute.removeDevo(codigo);
        console.log("Caiu em Foi pago Parte do Valor do Papel.");
        //
      } else if (dadosR > 0 && !trocoValue && !Number(total)) {
        await sendToCAndUpdateR(trocoValue);
        await Execute.removeMandR(idsArray);
        console.log("Caiu em foi pago todo o R.");
        //
      } else if (dadosR > 0 && !trocoValue && Number(total)) {
        await sendToCAndUpdateR(trocoValue);
        await Execute.sendToPapelC(ObjPapelC);
        await Execute.removeMandR(idsArray);
        console.log("Caiu em foi pago todo o R e Papel.");
        //
      } else if (dadosR > 0 && trocoValue && Number(total)) {
        if (dadosR === pixMaisReal) {
          await Execute.sendToC(ObjC1);
          await Execute.removeMandR(idsArray);
          if (total > 0) {
            const novoCodigo = gerarEArmazenarCodigoAleatorio();
            await Execute.removeDevo(codigo);
            await Execute.sendToDeve({
              deveid: novoCodigo,
              nome,
              r,
              data: Use.NowData(),
              codigo,
              valorpapel: papel,
              valorcomissao: comitions,
              valor: trocoValue,
            });
            await Execute.sendToPapelC({
              ...ObjPapelC,
              deveid: novoCodigo,
              data: Use.NowData(),
              papelpix: 0,
              papelreal: 0,
              encaixepix: 0,
              encaixereal: 0,
            });
          } else {
            setShowError(true);
          }
          console.log("Caiu em foi pago todo o R e deve todo o Papel.");
          //
        } else if (
          (pixMaisReal < dadosR && pixMaisReal < Number(total)) ||
          (pixMaisReal < dadosR && pixMaisReal > Number(total))
        ) {
          const values = totalGeral - Number(total) - pixMaisReal;
          const novoCodigo = gerarEArmazenarCodigoAleatorio();
          await sendToCAndUpdateR(values);
          if (total > 0) {
            await Execute.removeDevo(codigo);
            await Execute.removeDeve(codigo);
            await Execute.sendToDeve({
              deveid: novoCodigo,
              nome,
              r,
              data: Use.NowData(),
              codigo,
              valorpapel: papel,
              valorcomissao: comitions,
              valor: Number(total),
            });

            await Execute.sendToPapelC({
              ...ObjPapelC,
              deveid: novoCodigo,
              data: Use.NowData(),
              papelpix: 0,
              papelreal: 0,
              encaixepix: 0,
              encaixereal: 0,
            });
          } else {
            setShowError(true);
          }
          console.log("Caiu em foi pago parte do R deve o Papel.");
          //
        } else if (pixMaisReal > dadosR && Number(total)) {
          await sendToCAndUpdateR(0);
          await Execute.removeMandR(idsArray);
          if (total > 0) {
            const value = Math.abs(totalGeral - pixMaisReal);
            await Execute.removeDevo(codigo);
            await Execute.removeDeve(codigo);
            await Execute.sendToDeve({
              nome,
              r,
              data: Use.NowData(),
              codigo,
              valor: value,
            });
            await Execute.sendToPapelC({
              ...ObjPapelC,
              data: Use.NowData(),
            });
          } else {
            setShowError(true);
          }
          console.log("Caiu em foi pago todo o R e parte do Papel.");
          //
        } else if (Number(total) === pixMaisReal) {
          await Execute.sendToPapelC(ObjPapelC);
          await sendToCAndUpdateR(trocoValue);
          console.log("Caiu em foi pago todo o Papel e deve todo o R.");
          //
        }
      } else if (
        dadosR > 0 &&
        valorDeve > 0 &&
        trocoValue > 0 &&
        !Number(total)
      ) {
        if (dadosR === pixMaisReal) {
          await sendToCAndUpdateR(0);
          await Execute.removeDevo(codigo);
          await Execute.removeMandR(idsArray);

          console.log("Caiu em foi pago todo R deve o Papel.");
          //
        } else if (pixMaisReal < dadosR) {
          await sendToCAndUpdateR(pixMaisReal);
          console.log("Caiu em foi pago Parte R deve o Papel.");
        } else if (pixMaisReal > dadosR) {
          await Execute.sendToDeveUpdate(codigo, trocoValue, r);
          await Execute.sendToCAndUpdateR(0);
          await Execute.removeMandR(idsArray);
          console.log("Caiu em foi Todo R e Parte Papel.");
        }
        console.log("Caiu em Tem R e Tem DEVE");
      } else if (valorDevo && totalGeral === pixMaisReal) {
        await Execute.removeDevo(codigo);
        await Execute.sendToPapelC(ObjPapelC);

        console.log("Caiu em DEVO e Pagou tudo o Papel");
      } else if (Number(total) && !dadosR && !valorDeve && !trocoValue) {
        await Execute.sendToPapelC(ObjPapelC);
        console.log("Caiu em tem Serviço e papel e foi Pago todo o papel");
      } else if (Number(total) && !dadosR && !valorDeve && trocoValue) {
        const novoCodigo = gerarEArmazenarCodigoAleatorio();
        await Execute.sendToDeve({
          deveid: novoCodigo,
          nome,
          r,
          data: Use.NowData(),
          codigo,
          valorpapel: papel - pixMaisReal,
          valorcomissao: comitions,
          valor: trocoValue,
        });
        await Execute.sendToPapelC({
          ...ObjPapelC,
          deveid: novoCodigo,
        });
        console.log("Caiu em tem Serviço e papel e foi Pago parte o papel");
      } else {
        console.log("Caiu em sem condições");
      }

      setPix("");
      setPlus(0);
      setReal("");
      setComentario("");
      setPerdida("");
      onNomeChange("");
      onCodigoChange("");
      setValues(Array(28).fill(""));
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar os dados!");
    }
  };

  const ObjC1 = {
    codigo,
    dec: "", // Será sobrescrito por grupo
    r,
    data,
    nome,
    sis: 0, // Valores serão ajustados
    alt: 0,
    base: 0,
    real: Number(real),
    pix: Number(pix),
  };

  const ObjPapelC = {
    deveid: 0,
    codigo,
    r,
    data: Use.NowData(),
    nome,
    multi: multiplier,
    comissao: plus || 0,
    papel: papel || 0,
    papelpix: Number(pix) > 0 ? Math.min(Number(pix), papel) : 0,
    papelreal:
      Number(real) > 0
        ? Math.min(
            Number(real),
            papel - (Number(pix) > 0 ? Math.min(Number(pix), papel) : 0),
          )
        : 0,
    encaixepix: Number(pix) > 0 ? Math.min(Number(pix), comitions) : 0,
    encaixereal:
      Number(real) > 0
        ? Math.min(
            Number(real),
            comitions -
              (Number(pix) > 0 ? Math.min(Number(pix), comitions) : 0),
          )
        : 0,
    desperdicio,
    util: sumValues,
    perdida: perdida || 0,
    comentario,
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Inputs superiores */}
        <div className="join z-2">
          <input
            type="text"
            placeholder="Nome"
            className="input input-warning input-xs w-32 join-item"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="CODIGO"
            className="input input-warning input-xs w-23 join-item"
            value={codigo}
            onChange={(e) => onCodigoChange(e.target.value)}
            required
          />
          <input
            type="number"
            className="input input-warning text-warning text-left input-xs w-7.5 join-item"
            value={plus}
            placeholder={0}
            onChange={handlePlusChange}
          />
        </div>
        <input
          type="number"
          className="input input-warning hidden text-warning input-xs w-7.5"
          value={multiplier}
          onChange={handleMultiplierChange}
        />
        <div className="grid grid-cols-4 mt-0.5 w-fit">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="relative">
              <input
                min="0"
                step="0.01"
                type="number"
                className="input input-info input-xs w-15.5 appearance-none"
                value={values[i]}
                onChange={(e) => handleValueChange(i, e)}
              />
            </div>
          ))}
        </div>
        <div>
          <input
            type="text" // Mudei para type="text" para permitir valor vazio
            placeholder="Total"
            value={typeof total === "number" ? total.toFixed(2) : ""}
            className="input input-warning input-xs w-62 z-3 text-center text-warning font-bold"
            readOnly
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="SOMA TOTAL"
            value={totalGeral !== 0 ? totalGeral.toFixed(2) : ""}
            className="input input-success input-xl w-62 z-3 text-center text-success mt-0.5 font-bold"
            readOnly
          />
        </div>
        <div className="join grid grid-cols-3 mt-0.5 w-62">
          <input
            min="0"
            step={0.01}
            type="number"
            placeholder="Pix"
            className="input input-secondary input-lg z-2 text-secondary font-bold join-item"
            value={pix}
            onChange={(e) => setPix(e.target.value)}
          />
          <input
            min="0"
            type="text"
            placeholder="Troco"
            value={totalTroco !== 0 ? totalTroco.toFixed(2) : ""}
            className="input input-defaut input-lg join-item font-bold"
          />
          <input
            min="0"
            step={0.01}
            type="number"
            placeholder="Real"
            className="input input-secondary input-lg z-2 text-secondary font-bold join-item"
            value={real}
            onChange={(e) => setReal(e.target.value)}
          />
          <button type="submit" className="btn px-30.5 btn-secondary">
            Salvar
          </button>
        </div>
        <div className="join">
          <input
            type="text"
            placeholder="Comentário"
            className="input input-primary w-42 input-xs join-item"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
          <input
            min="0"
            step={0.01}
            type="number"
            placeholder="Desperdício"
            className="input input-primary w-20 input-xs join-item"
            value={perdida}
            onChange={(e) => setPerdida(e.target.value)}
          />
        </div>
      </form>
      {typeof window !== "undefined" && showError && (
        <ErrorComponent errorCode="Nulo" />
      )}
    </>
  );
};
export default Calculadora;
