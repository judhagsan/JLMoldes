function formatarData(dataStr) {
  const data = new Date(dataStr);
  const diasDaSemana = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];
  const mesesAbreviados = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  return `${diasDaSemana[data.getDay()]} - ${String(data.getDate()).padStart(2, "0")}/${
    mesesAbreviados[data.getMonth()]
  } ${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`;
}

const use = {
  formatarData,
};

export default use;
