import { useState } from "react";
import TableCad from "./TableCad.js";

function Cadastro() {
  const [regiao, setRegiao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp1, setWhatsapp1] = useState("");
  const [whatsapp2, setWhatsapp2] = useState("");
  const [nome, setNome] = useState("");
  const [grupo, setGrupo] = useState("");
  const [observacao, setObservacao] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ordemInputValues = {
      regiao,
      codigo,
      facebook,
      instagram,
      email,
      whatsapp1,
      whatsapp2,
      nome,
      grupo,
      observacao,
    };

    try {
      const response = await fetch("/api/v1/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ordemInputValues),
      });

      if (!response.ok) throw new Error("Erro ao enviar os dados.");
      await response.json();
      setRegiao("");
      setCodigo("");
      setFacebook("");
      setInstagram("");
      setEmail("");
      setWhatsapp1("");
      setWhatsapp2("");
      setGrupo("");
      setNome("");
      setObservacao("");
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };

  return (
    <div className="h-full">
      {/* Formulário */}
      <div className="bg-base-100 border-base-300 pb-2 px-40">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Região/País"
            className="input input-info input-xs join-item w-24"
            value={regiao}
            onChange={(e) => setRegiao(e.target.value)}
          />
          <input
            type="text"
            placeholder="CODIGO"
            className="input input-info input-xs join-item w-20"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Facebook"
            className="input input-info input-xs join-item w-40"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
          />
          <input
            type="text"
            placeholder="instagram"
            className="input input-info input-xs join-item w-40"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="input input-info input-xs join-item w-35"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Whatsapp 1"
            className="input input-info input-xs join-item w-35"
            value={whatsapp1}
            onChange={(e) => setWhatsapp1(e.target.value)}
          />
          <input
            type="text"
            placeholder="Whatsapp 2"
            className="input input-info input-xs join-item w-35"
            value={whatsapp2}
            onChange={(e) => setWhatsapp2(e.target.value)}
          />
          <input
            type="text"
            placeholder="Grupo"
            className="input input-info input-xs join-item w-35"
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nome"
            className="input input-info input-xs join-item w-35"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="text"
            placeholder="Observações"
            className="input input-info input-xs join-item w-70"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
          <button type="submit" className="btn btn-xs btn-info join-item">
            Enviar
          </button>
        </form>
      </div>
      <div>
        <TableCad />
      </div>
    </div>
  );
}

export default Cadastro;
