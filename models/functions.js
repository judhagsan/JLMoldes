const sendTrueMR1 = async (id) => {
  try {
    const response = await fetch("/api/v1/tables/R1Button", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, r1: true }),
    });

    if (!response.ok) throw new Error("Erro ao atualizar");
  } catch (error) {
    console.error("Erro ao salvar:", error);
    throw error; // Importante re-lançar o erro para ser capturado no catch do botão
  }
};

async function sendToR1(itemData) {
  try {
    const idExists = await reciveFromR1(itemData.id);
    const itemDataNumber = Number(itemData.id);
    const idExistsNumber = idExists.some(
      (item) => Number(item.id) === itemDataNumber,
    );

    // Adicionando logs para depuração
    console.log("Verificando IDs...");

    if (idExistsNumber) {
      throw new Error("R1ID"); // Erro específico para ID duplicado
    }

    const response = await fetch("/api/v1/tables/R1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: itemData.id,
        codigo: itemData.codigo,
        nome: itemData.nome,
        sis: itemData.sis ?? 0,
        alt: itemData.alt ?? 0,
        base: itemData.base ?? 0,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Erro no sendToR1:", error);
    throw error; // Propaga o erro para o chamador
  }
}

async function sendToDeve(itemData) {
  try {
    const response = await fetch("/api/v1/tables/deve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: itemData.nome,
        codigo: itemData.codigo,
        valor: itemData.valor,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao criar registro em Deve");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro no createDeve:", error);
    throw error;
  }
}

async function sendToDevo(itemData) {
  try {
    const response = await fetch("/api/v1/tables/devo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: itemData.nome,
        codigo: itemData.codigo,
        valor: itemData.valor,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao criar registro em Devo");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro no createDevo:", error);
    throw error;
  }
}

async function sendToC1(itemData) {
  try {
    const response = await fetch("/api/v1/tables/c1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: itemData.codigo,
        data: itemData.data,
        nome: itemData.nome,
        sis: itemData.sis,
        alt: itemData.alt,
        base: itemData.base,
        real: itemData.real,
        pix: itemData.pix,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao criar registro em C1");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro no createC1:", error);
    throw error;
  }
}

async function sendToPapelC1(itemData) {
  try {
    const response = await fetch("/api/v1/tables/c1/papel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: itemData.codigo,
        data: itemData.data,
        nome: itemData.nome,
        multi: itemData.multi,
        papel: itemData.papel,
        papelpix: itemData.papelpix,
        papelreal: itemData.papelreal,
        encaixepix: itemData.encaixepix,
        encaixereal: itemData.encaixereal,
        desperdicio: itemData.desperdicio,
        util: itemData.util,
        perdida: itemData.perdida,
        comentarios: itemData.comentario,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao criar registro em C1");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro no createPapelC1:", error);
    throw error;
  }
}

async function reciveFromR1DeveDevo(tableName) {
  try {
    const response = await fetch(`/api/v1/tables/${tableName}`);
    if (!response.ok) return [];

    const data = await response.json();
    // Filtrar itens que possuem ambos 'nome' e 'codigo'
    return data.rows.filter((item) => item.nome && item.codigo);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return [];
  }
}

async function reciveFromR1() {
  try {
    const response = await fetch("/api/v1/tables/R1");
    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados R1:", error);
    return [];
  }
}

async function reciveFromDeve() {
  try {
    const response = await fetch("/api/v1/tables/deve");
    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados deve:", error);
    return [];
  }
}

async function reciveFromDeveJustValor(codigo) {
  try {
    const response = await fetch(
      `/api/v1/tables/calculadora/deve?codigo=${codigo}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao carregar os dados");
    }

    const data = await response.json();

    // Retorna o objeto direto com os totais
    return (
      data || {
        total_valor: 0,
      }
    );
  } catch (error) {
    console.error("Erro ao buscar dados deve:", error);
    return {
      total_valor: 0,
    };
  }
}

async function reciveFromDevoJustValor(codigo) {
  try {
    const response = await fetch(
      `/api/v1/tables/calculadora/devo?codigo=${codigo}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao carregar os dados");
    }

    const data = await response.json();

    // Retorna o objeto direto com os totais
    return (
      data || {
        total_valor: 0,
      }
    );
  } catch (error) {
    console.error("Erro ao buscar dados devo:", error);
    return {
      total_valor: 0,
    };
  }
}

async function reciveFromDevo() {
  try {
    const response = await fetch("/api/v1/tables/devo");
    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados deve:", error);
    return [];
  }
}

async function reciveFromC1() {
  try {
    const response = await fetch("/api/v1/tables/c1");
    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados deve:", error);
    return [];
  }
}

async function reciveFromC1Data(codigo, data) {
  try {
    // Codifica 'data' para enviar como parâmetro na URL
    const encodedData = encodeURIComponent(JSON.stringify(data));

    const response = await fetch(
      `/api/v1/tables/c1/calculadora?codigo=${codigo}&data=${encodedData}`,
    );

    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const result = await response.json();

    // Retorna diretamente o booleano 'exists' vindo do servidor
    return result.exists; // true ou false
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return false;
  }
}

async function reciveFromPapelC1() {
  try {
    const response = await fetch("/api/v1/tables/c1/papel");
    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados deve:", error);
    return [];
  }
}

async function reciveFromR1JustBSA(codigo) {
  try {
    const response = await fetch(`/api/v1/tables/calculadora?codigo=${codigo}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao carregar os dados");
    }

    const data = await response.json();

    // Retorna o objeto direto com os totais
    return (
      data || {
        total_base: 0,
        total_sis: 0,
        total_alt: 0,
      }
    );
  } catch (error) {
    console.error("Erro ao buscar dados R1:", error);
    return {
      total_base: 0,
      total_sis: 0,
      total_alt: 0,
    };
  }
}

async function removeM1andR1(id) {
  const response = await fetch("/api/v1/tables", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }), // Envia o `id` no corpo da requisição
  });

  const response2 = await fetch("/api/v1/tables/R1", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }), // Envia o `id` no corpo da requisição
  });

  const result = await response.json();
  console.log(result);

  const result2 = await response2.json();
  console.log(result2);
}

async function removeC1(id) {
  const response = await fetch("/api/v1/tables/c1", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }), // Envia o `id` no corpo da requisição
  });

  const result = await response.json();
  console.log(result);
}

async function removePapelC1(id) {
  const response = await fetch("/api/v1/tables/c1/papel", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }), // Envia o `id` no corpo da requisição
  });

  const result = await response.json();
  console.log(result);
}

async function removeDeve(codigo) {
  const response = await fetch("/api/v1/tables/deve", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo }), // Envia o `id` no corpo da requisição
  });

  const result = await response.json();
  console.log(result);
}

async function removeDevo(codigo) {
  const response = await fetch("/api/v1/tables/devo", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo }), // Envia o `id` no corpo da requisição
  });

  const result = await response.json();
  console.log(result);
}

const execute = {
  sendTrueMR1,
  sendToR1,
  sendToDeve,
  sendToDevo,
  sendToC1,
  sendToPapelC1,
  reciveFromC1,
  reciveFromC1Data,
  reciveFromPapelC1,
  reciveFromR1DeveDevo,
  reciveFromDeve,
  reciveFromDeveJustValor,
  reciveFromDevo,
  reciveFromDevoJustValor,
  reciveFromR1,
  reciveFromR1JustBSA,
  removeC1,
  removePapelC1,
  removeM1andR1,
  removeDeve,
  removeDevo,
};

export default execute;
