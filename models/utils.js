const diasDaSemana = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const mesesAbreviados = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatarData(dataStr) {
  const data = new Date(dataStr);

  return `${diasDaSemana[data.getDay()]} - ${String(data.getDate()).padStart(2, "0")}/${
    mesesAbreviados[data.getMonth()]
  }`;
}

function formatarDataHora(dataStr) {
  const data = new Date(dataStr);

  const diaSemana = diasDaSemana[data.getDay()];
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = mesesAbreviados[data.getMonth()];
  const hora = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");

  return `${diaSemana} - ${dia}/${mes} - ${hora}:${minutos}`;
}
function formatarDataHoraSegundo(dataStr) {
  const data = new Date(dataStr);

  const hora = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");
  const segundo = String(data.getSeconds()).padStart(2, "0");

  return `${hora}:${minutos}:${segundo}`;
}

// Função para formatar apenas a hora e os minutos
function formatarHora(dataStr) {
  const data = new Date(dataStr);
  const hora = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");
  return `${hora}:${minutos}`;
}

// models/utils.js
export function formatarDataAno(dataString) {
  if (!dataString) return "—";
  const data = new Date(dataString);
  return `${String(data.getUTCDate()).padStart(2, "0")}/${String(data.getUTCMonth() + 1).padStart(2, "0")}/${data.getUTCFullYear()}`;
}

export function formatarProximo(dataString, mesesAdicionais, diasAdicionais) {
  const meses = Number(mesesAdicionais);
  const dias = Number(diasAdicionais);
  if (meses === 0 && dias === 0) {
    return "—";
  } else {
    const data = new Date(dataString);
    const novaData = new Date(data);
    novaData.setUTCMonth(novaData.getUTCMonth() + meses);
    novaData.setUTCDate(novaData.getUTCDate() + dias);
    return `${String(novaData.getUTCDate()).padStart(2, "0")}/${String(novaData.getUTCMonth() + 1).padStart(2, "0")}/${novaData.getUTCFullYear()}`;
  }
}

function NowData() {
  const data = new Date();
  const isoString = data.toISOString();
  const [dataParte, tempoParte] = isoString.split("T");
  const [tempo] = tempoParte.split(".");
  return `${dataParte} ${tempo}.000000+00`;
}

const use = {
  formatarDataHora,
  formatarDataHoraSegundo,
  formatarHora,
  formatarData,
  formatarDataAno,
  formatarProximo,
  NowData,
};

export default use;
