import Execute from "models/functions";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Use from "models/utils.js";

const Calculadora = ({ codigo, nome, onCodigoChange, onNomeChange, data }) => {
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
  const [dadosR1, setDadosR1] = useState(0);
  const [idsArray, setIdsArray] = useState(0);
  const [valorDevo, setValorDevo] = useState(0);
  const [valorDeve, setValorDeve] = useState(0);
  const [multiplier, setMultiplier] = useState(0);
  const [comissi, setComissi] = useState(0);
  const [desperdicio, setDesperdicio] = useState(0);
  const [plus, setPlus] = useState(0);
  const [values, setValues] = useState(Array(28).fill(""));
  const [pix, setPix] = useState("");
  const [real, setReal] = useState("");
  const [comentario, setComentario] = useState("");
  const [perdida, setPerdida] = useState("");
  const [base, setBase] = useState("");
  const [sis, setSis] = useState("");
  const [alt, setAlt] = useState("");
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
    (Number(dadosR1) || 0) +
    sumValues * multiplier -
    valorDevo +
    valorDeve +
    comitions;

  const totalTroco = totalGeral - (Number(pix) || 0) - (Number(real) || 0);

  const pixMaisReal = Number(pix) + Number(real);
  // fim dos calculos

  // No seu useEffect de busca de dados, atualize para garantir conversão numérica
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const resultado = await Execute.receiveFromR1JustBSA(codigo);
        // Garantir conversão numérica correta
        const newBase = Number(resultado.total_base) || 0;
        const newSis = Number(resultado.total_sis) || 0;
        const newAlt = Number(resultado.total_alt) || 0;

        setIdsArray(resultado.ids || []);
        setBase(newBase);
        setSis(newSis);
        setAlt(newAlt);
        setDadosR1(newBase + newSis + newAlt);
      } catch (error) {
        console.error("Erro:", error);
        setBase(0);
        setSis(0);
        setAlt(0);
        setDadosR1(0);
        setIdsArray([]);
      }
    };
    buscarDados();
  }, [codigo]);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const resultado = await Execute.receiveFromDeveJustValor(codigo);
        // Soma todos os valores
        const somaTotal = Number(resultado.total_valor || 0);

        setValorDeve(somaTotal);
      } catch (error) {
        console.error("Erro:", error);
        setValorDeve(0);
      }
    };
    buscarDados();
  }, [codigo]);

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
      const response = await fetch("/api/v1/tables/R1/calculadora", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  async function handleUpdateC1(codigo, data, New, currentTotal) {
    try {
      const decodedData = decodeURIComponent(data);

      const response = await fetch(
        `/api/v1/tables/c1/calculadora?codigo=${codigo}&data=${data}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo,
            data: decodedData,
            sis: New.sis || 0,
            alt: New.alt || 0,
            base: New.base || 0,
            ...(function () {
              // Valores originais do ObjC1
              let adjustedReal = ObjC1.real || 0;
              let adjustedPix = ObjC1.pix || 0;

              // Garante que nenhum valor individual exceda o currentTotal
              adjustedReal = Math.min(adjustedReal, currentTotal);
              adjustedPix = Math.min(adjustedPix, currentTotal);

              // Ajusta a soma se necessário
              const soma = adjustedReal + adjustedPix;
              if (soma > currentTotal) {
                const excesso = soma - currentTotal;
                const ratioReal = adjustedReal / soma;
                const ratioPix = adjustedPix / soma;

                adjustedReal -= Math.round(excesso * ratioReal);
                adjustedPix -= Math.round(excesso * ratioPix);

                // Garantir valores não negativos
                adjustedReal = Math.max(adjustedReal, 0);
                adjustedPix = Math.max(adjustedPix, 0);

                // Correção de arredondamento
                if (adjustedReal + adjustedPix > currentTotal) {
                  adjustedReal -= adjustedReal + adjustedPix - currentTotal;
                }
              }

              return { real: adjustedReal, pix: adjustedPix };
            })(),
          }),
        },
      );

      if (!response.ok) throw new Error("Erro ao atualizar");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  }

  async function sendToC1AndUpdateR1(value) {
    await Execute.removeDevo(codigo);

    const currentTotal = base + sis + alt;
    const excessoTotal = currentTotal - value;
    const exists = await Execute.receiveFromC1Data(codigo, data);

    if (exists) {
      const dataEncoded = encodeURIComponent(data);

      if (excessoTotal > 0) {
        const valores = [
          { nome: "base", valor: base },
          { nome: "sis", valor: sis },
          { nome: "alt", valor: alt },
        ];
        valores.sort((a, b) => b.valor - a.valor);

        let resto = excessoTotal;
        for (const item of valores) {
          if (resto <= 0) break;
          const subtrair = Math.min(item.valor, resto);
          item.valor -= subtrair;
          resto -= subtrair;
        }

        const novosDados = {
          base: valores.find((v) => v.nome === "base").valor,
          sis: valores.find((v) => v.nome === "sis").valor,
          alt: valores.find((v) => v.nome === "alt").valor,
          codigo,
        };

        await handleSave(novosDados);

        // Calcular os novos valores para C1 (excesso)
        const updateData = {
          sis: (exists.sis || 0) + (sis - novosDados.sis),
          alt: (exists.alt || 0) + (alt - novosDados.alt),
          base: (exists.base || 0) + (base - novosDados.base),
        };

        await handleUpdateC1(codigo, dataEncoded, updateData, currentTotal);
      }
    } else {
      if (excessoTotal > 0) {
        const valores = [
          { nome: "base", valor: base },
          { nome: "sis", valor: sis },
          { nome: "alt", valor: alt },
        ];
        valores.sort((a, b) => b.valor - a.valor);

        let resto = excessoTotal;
        for (const item of valores) {
          if (resto <= 0) break;
          const subtrair = Math.min(item.valor, resto);
          item.valor -= subtrair;
          resto -= subtrair;
        }

        const novosDados = {
          base: valores.find((v) => v.nome === "base").valor,
          sis: valores.find((v) => v.nome === "sis").valor,
          alt: valores.find((v) => v.nome === "alt").valor,
          codigo,
        };

        await handleSave(novosDados);

        await Execute.sendToC1({
          ...ObjC1,
          sis: sis - novosDados.sis,
          alt: alt - novosDados.alt,
          base: base - novosDados.base,
          // Ajustar real e pix para não ultrapassar currentTotal
          ...(function () {
            // Valores originais do ObjC1
            let adjustedReal = ObjC1.real || 0;
            let adjustedPix = ObjC1.pix || 0;

            // Garante que nenhum valor individual exceda o currentTotal
            adjustedReal = Math.min(adjustedReal, currentTotal);
            adjustedPix = Math.min(adjustedPix, currentTotal);

            // Ajusta a soma se necessário
            const soma = adjustedReal + adjustedPix;
            if (soma > currentTotal) {
              const excesso = soma - currentTotal;
              const ratioReal = adjustedReal / soma;
              const ratioPix = adjustedPix / soma;

              adjustedReal -= Math.round(excesso * ratioReal);
              adjustedPix -= Math.round(excesso * ratioPix);

              // Garantir valores não negativos
              adjustedReal = Math.max(adjustedReal, 0);
              adjustedPix = Math.max(adjustedPix, 0);

              // Correção de arredondamento
              if (adjustedReal + adjustedPix > currentTotal) {
                adjustedReal -= adjustedReal + adjustedPix - currentTotal;
              }
            }

            return { real: adjustedReal, pix: adjustedPix };
          })(),
        });
      } else if (excessoTotal === 0) {
        await Execute.sendToC1({
          ...ObjC1,
          sis: 0,
          alt: 0,
          base: 0,
          pix: 0,
          real: 0,
        });
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trocoValue = Number(totalTroco);

    try {
      if (dadosR1 && !valorDeve && trocoValue > 0 && !Number(total)) {
        await sendToC1AndUpdateR1(trocoValue);
        console.log("caiu em Pago Parte do R1");

        //
      } else if (dadosR1 && !trocoValue && !Number(total) && !valorDeve) {
        await sendToC1AndUpdateR1(trocoValue);
        await Execute.removeM1andR1(idsArray);
        console.log("caiu em Pago todo R1");
        //
      } else if (trocoValue < 0) {
        await Execute.removeDeve(codigo);
        await Execute.sendToDevo({
          nome,
          codigo,
          valor: Math.abs(trocoValue),
        });
        await Execute.removeM1andR1(idsArray);
        console.log("Caiu em Troco Menor que Zero.");
      } else if (
        trocoValue === totalGeral &&
        Number(pix) == 0 &&
        Number(real) == 0
      ) {
        if (Number(total) > 0) {
          await Execute.removeDevo(codigo);
          await Execute.sendToDeve({
            nome,
            data: Use.NowData(),
            codigo,
            valor: Number(total),
          });

          await Execute.sendToPapelC1({
            ...ObjPapelC1,
            data: Use.NowData(),
            papelreal: papel,
            encaixereal: comitions,
          });
        } else {
          setShowError(true);
        }

        console.log("Deve Todo o Papel");
        //
      } else if (!trocoValue && valorDeve && dadosR1) {
        const exists = await Execute.receiveFromC1Data(codigo, data);

        if (exists) {
          const values = totalGeral - Number(total) - pixMaisReal;
          await sendToC1AndUpdateR1(values);
          await Execute.removeDeve(codigo);
          await Execute.removeDevo(codigo);
          await Execute.removeM1andR1(idsArray);
          console.log("Existe no C1");
        } else {
          await sendToC1AndUpdateR1(trocoValue);
          await Execute.removeDeve(codigo);
          await Execute.removeDevo(codigo);
          await Execute.removeM1andR1(idsArray);
        }
        console.log("Caiu em foi tudo pago Papel e R1.");
        //
      } else if (valorDeve && !trocoValue) {
        await Execute.removeDeve(codigo);
        await Execute.removeDevo(codigo);
        console.log("Caiu em Foi pago todo o papel.");

        //
      } else if (valorDeve && trocoValue && !dadosR1) {
        await Execute.sendToDeveUpdate(codigo, trocoValue);
        await Execute.removeDevo(codigo);
        console.log("Caiu em Foi pago Parte do Valor do Papel.");
        //
      } else if (dadosR1 > 0 && !trocoValue && !Number(total)) {
        await sendToC1AndUpdateR1(trocoValue);
        await Execute.removeM1andR1(idsArray);
        console.log("Caiu em foi pago todo o R1.");
        //
      } else if (dadosR1 > 0 && !trocoValue && Number(total)) {
        await sendToC1AndUpdateR1(trocoValue);
        await Execute.sendToPapelC1(ObjPapelC1);
        await Execute.removeM1andR1(idsArray);
        console.log("Caiu em foi pago todo o R1 e Papel.");
        //
      } else if (dadosR1 > 0 && trocoValue && Number(total)) {
        if (dadosR1 === pixMaisReal) {
          await Execute.sendToC1(ObjC1);
          await Execute.removeM1andR1(idsArray);
          if (total > 0) {
            await Execute.removeDevo(codigo);
            await Execute.removeDeve(codigo);
            await Execute.sendToDeve({
              nome,
              data: Use.NowData(),
              codigo,
              valor: trocoValue,
            });
            await Execute.sendToPapelC1({
              ...ObjPapelC1,
              data: Use.NowData(),
            });
          } else {
            setShowError(true);
          }
          console.log("Caiu em foi pago todo o R1 e deve todo o Papel.");
          //
        } else if (
          (pixMaisReal < dadosR1 && pixMaisReal < Number(total)) ||
          (pixMaisReal < dadosR1 && pixMaisReal > Number(total))
        ) {
          const values = totalGeral - Number(total) - pixMaisReal;
          await sendToC1AndUpdateR1(values);
          if (total > 0) {
            await Execute.removeDevo(codigo);
            await Execute.removeDeve(codigo);
            await Execute.sendToDeve({
              nome,
              data: Use.NowData(),
              codigo,
              valor: Number(total),
            });
            await Execute.sendToPapelC1({
              ...ObjPapelC1,
              data: Use.NowData(),
            });
          } else {
            setShowError(true);
          }
          console.log("Caiu em foi pago parte do R1 deve o Papel.");
          //
        } else if (pixMaisReal > dadosR1 && Number(total)) {
          await sendToC1AndUpdateR1(0);
          await Execute.removeM1andR1(idsArray);
          if (total > 0) {
            const value = Math.abs(totalGeral - pixMaisReal);
            await Execute.removeDevo(codigo);
            await Execute.removeDeve(codigo);
            await Execute.sendToDeve({
              nome,
              data: Use.NowData(),
              codigo,
              valor: value,
            });
            await Execute.sendToPapelC1({
              ...ObjPapelC1,
              data: Use.NowData(),
            });
          } else {
            setShowError(true);
          }
          console.log("Caiu em foi pago todo o R1 e parte do Papel.");
          //
        } else if (Number(total) === pixMaisReal) {
          await Execute.sendToPapelC1(ObjPapelC1);
          await sendToC1AndUpdateR1(trocoValue);
          console.log("Caiu em foi pago todo o Papel e deve todo o R1.");
          //
        }
        console.log("Caiu em foi pago Parte do R1 e Papel.");
        //
      } else if (
        dadosR1 > 0 &&
        valorDeve > 0 &&
        trocoValue > 0 &&
        !Number(total)
      ) {
        if (dadosR1 === pixMaisReal) {
          await sendToC1AndUpdateR1(0);
          await Execute.removeDevo(codigo);
          await Execute.removeM1andR1(idsArray);

          console.log("Caiu em foi pago todo R1 deve o Papel.");
          //
        } else if (pixMaisReal < dadosR1) {
          await sendToC1AndUpdateR1(pixMaisReal);
          console.log("Caiu em foi pago Parte R1 deve o Papel.");
        } else if (pixMaisReal > dadosR1) {
          await Execute.sendToDeveUpdate(codigo, trocoValue);
          await Execute.sendToC1AndUpdateR1(0);
          await Execute.removeM1andR1(idsArray);
          console.log("Caiu em foi Todo R1 e Parte Papel.");
        }
        console.log("Caiu em Tem R1 e Tem DEVE");
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
    data,
    nome,
    sis,
    alt,
    base,
    real: Number(real),
    pix: Number(pix),
  };
  const ObjPapelC1 = {
    codigo,
    data,
    nome,
    multi: multiplier,
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
    <div className="flex flex-col">
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
    </div>
  );
};
export default Calculadora;
