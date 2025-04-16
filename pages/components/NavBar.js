import Update from "pages/components/Update.js";
import React from "react";

const NavBar = ({ Rcontent, MContent, Cadastro, Ccontent, Gastos }) => {
  const isMContentAvailable = Boolean(MContent);
  const isCadastroAvailable = Boolean(Cadastro);
  const isR1Available = Boolean(Rcontent);
  const isGastosAvailable = Boolean(Gastos);
  // Grupos de tabs para organização
  const tabGroups = [
    {
      label: "R1",
      content: isR1Available ? <Rcontent r={1} /> : "Loading...",
    },
    {
      label: "R2",
      content: isR1Available ? <Rcontent r={2} /> : "Loading...",
    },
    {
      label: "R3",
      content: isR1Available ? <Rcontent r={3} /> : "Loading...",
    },

    {
      label: "M1",
      content: isMContentAvailable ? (
        <MContent oficina="m1" r={1} />
      ) : (
        "Loading..."
      ),
      checked: true,
    },
    {
      label: "M2",
      content: isMContentAvailable ? (
        <MContent oficina="m2" r={2} />
      ) : (
        "Loading..."
      ),
    },
    {
      label: "M3",
      content: isMContentAvailable ? (
        <MContent oficina="m3" r={3} />
      ) : (
        "Loading..."
      ),
    },
    { label: "C1", content: isMContentAvailable ? <Ccontent /> : "Loading..." },
    { label: "C2", content: "Tab content 3" },
    { label: "C3", content: "Tab content 3" },
    { label: "T1", content: "Tab content 2" },
    { label: "T2", content: "Tab content 3" },
    { label: "T3", content: "Tab content 2" },
    {
      label: "A-Gastos",
      content: isGastosAvailable ? <Gastos letras="A" /> : "Loading...",
    },
    {
      label: "B-Gastos",
      content: isGastosAvailable ? <Gastos letras="B" /> : "Loading...",
    },
    {
      label: "C-Gastos",
      content: isGastosAvailable ? <Gastos letras="C" /> : "Loading...",
    },
    {
      label: "D-Gastos",
      content: isGastosAvailable ? <Gastos letras="D" /> : "Loading...",
    },
    {
      label: "E-Gastos",
      content: isGastosAvailable ? <Gastos letras="E" /> : "Loading...",
    },
    {
      label: "F-Gastos",
      content: isGastosAvailable ? <Gastos letras="F" /> : "Loading...",
    },
    {
      label: "G-Gastos",
      content: isGastosAvailable ? <Gastos letras="G" /> : "Loading...",
    },
    {
      label: "H-Gastos",
      content: isGastosAvailable ? <Gastos letras="H" /> : "Loading...",
    },
    {
      label: "I-Gastos",
      content: isGastosAvailable ? <Gastos letras="I" /> : "Loading...",
    },
    {
      label: "J-Gastos",
      content: isGastosAvailable ? <Gastos letras="J" /> : "Loading...",
    },
    {
      label: "K-Gastos",
      content: isGastosAvailable ? <Gastos letras="K" /> : "Loading...",
    },
    {
      label: "L-Gastos",
      content: isGastosAvailable ? <Gastos letras="L" /> : "Loading...",
    },
    { label: "Total Anual", content: "Tab content 3" },
    {
      label: "Cadastros",
      content: isCadastroAvailable ? <Cadastro /> : "Loading...",
    },
    // Adicione outros grupos conforme necessário
  ];

  return (
    <div className="p-4">
      <div className="tabs tabs-lift">
        {tabGroups.map((tab, index) => (
          <React.Fragment key={index}>
            {tab.label === "Cadastros" ? (
              // Aba especial para Cadastros com componente Update
              <>
                <input
                  type="radio"
                  name="my_tabs_3"
                  id="cadastros-tab"
                  className="hidden [&:checked~div]:!block"
                />
                <label
                  htmlFor="cadastros-tab"
                  className="tab flex items-center gap-2 hover:bg-base-200"
                  aria-label={tab.label}
                >
                  {tab.label}
                  <Update />
                </label>
              </>
            ) : (
              // Abas normais
              <input
                type="radio"
                name="my_tabs_3"
                className="tab"
                aria-label={tab.label}
                defaultChecked={tab.checked}
              />
            )}

            <div className="tab-content bg-base-100 border-base-300 p-2">
              {tab.content}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
export default NavBar;
