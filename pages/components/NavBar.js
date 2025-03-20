const NavBar = ({ MContent, Cadastro }) => {
  const isMContentAvailable = Boolean(MContent);
  const isCadastroAvailable = Boolean(Cadastro);
  // Grupos de tabs para organização
  const tabGroups = [
    { label: "R1", content: "Tab content 1" },
    { label: "R2", content: "Tab content 2" },
    { label: "R3", content: "Tab content 3" },
    {
      label: "M1",
      content: isMContentAvailable ? <MContent /> : "Loading...",
      checked: true,
    },
    { label: "M2", content: "Tab content 2" },
    { label: "M3", content: "Tab content 3" },
    { label: "T1", content: "Tab content 2" },
    { label: "T2", content: "Tab content 3" },
    { label: "T3", content: "Tab content 2" },
    { label: "A-Gastos", content: "Tab content 3" },
    { label: "B-Gastos", content: "Tab content 3" },
    { label: "C-Gastos", content: "Tab content 3" },
    { label: "D-Gastos", content: "Tab content 3" },
    { label: "E-Gastos", content: "Tab content 3" },
    { label: "F-Gastos", content: "Tab content 3" },
    { label: "G-Gastos", content: "Tab content 3" },
    { label: "H-Gastos", content: "Tab content 3" },
    { label: "I-Gastos", content: "Tab content 3" },
    { label: "J-Gastos", content: "Tab content 3" },
    { label: "K-Gastos", content: "Tab content 3" },
    { label: "L-Gastos", content: "Tab content 3" },
    { label: "Total Anual", content: "Tab content 3" },
    {
      label: "Cadastros",
      content: isCadastroAvailable ? <Cadastro /> : "Loading...",
      checked: true,
    },
    // Adicione outros grupos conforme necessário
  ];

  return (
    <div className="p-4">
      <div className="tabs tabs-lift ">
        {tabGroups.map((tab, index) => (
          <>
            <input
              key={`input-${index}`}
              type="radio"
              name="my_tabs_3"
              className="tab"
              aria-label={tab.label}
              defaultChecked={tab.checked}
            />
            <div
              key={`content-${index}`}
              className="tab-content bg-base-100 border-base-300 p-2"
            >
              {tab.content}
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

export default NavBar;
