const sendTrueMR = async (id, r) => {
  try {
    const response = await fetch("/api/v1/tables/RButton", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [`r${r}`]: true }),
    });

    if (!response.ok) throw new Error("Erro ao atualizar");
  } catch (error) {
    console.error("Erro ao salvar:", error);
    throw error; // Importante re-lançar o erro para ser capturado no catch do botão
  }
};

async function sendToR(itemData) {
  try {
    const idExists = await receiveFromR(itemData.r);
    const itemDataNumber = Number(itemData.id);
    const idExistsNumber = idExists.some(
      (item) => Number(item.id) === itemDataNumber,
    );

    // Adicionando logs para depuração
    console.log("Verificando IDs...");

    if (idExistsNumber) {
      throw new Error("RID"); // Erro específico para ID duplicado
    }

    const response = await fetch("/api/v1/tables/R", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: itemData.id,
        r: itemData.r,
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
        data: itemData.data,
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

async function sendToDeveUpdate(codigo, valor) {
  try {
    const response = await fetch(
      `/api/v1/tables/deve?codigo=${codigo}&valor=${valor}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo,
          valor,
        }),
      },
    );

    if (!response.ok) throw new Error("Erro ao atualizar");
  } catch (error) {
    console.error("Erro ao salvar:", error);
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

async function sendToPessoal(
  letras,
  item,
  quantidade,
  unidade,
  valor,
  gastos,
  pago,
  proximo,
  dia,
  alerta,
) {
  try {
    const response = await fetch("/api/v1/tables/gastos/pessoal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        letras,
        item,
        quantidade,
        unidade,
        valor,
        gastos,
        pago,
        proximo,
        dia,
        alerta,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao criar registro em Pessoal");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro no createPessoal:", error);
    throw error;
  }
}

async function sendToOficina(
  letras,
  item,
  quantidade,
  unidade,
  valor,
  gastos,
  pago,
  proximo,
  dia,
  alerta,
) {
  try {
    const response = await fetch("/api/v1/tables/gastos/oficina", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        letras,
        item,
        quantidade,
        unidade,
        valor,
        gastos,
        pago,
        proximo,
        dia,
        alerta,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao criar registro em Oficina");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro no createOficina:", error);
    throw error;
  }
}

async function sendToC(itemData) {
  try {
    const response = await fetch("/api/v1/tables/c", {
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
      throw new Error(errorData.error || "Erro ao criar registro em C");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro no createC:", error);
    throw error;
  }
}

async function sendToPapelC(itemData) {
  try {
    const response = await fetch("/api/v1/tables/c/papel", {
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
      throw new Error(errorData.error || "Erro ao criar registro em C");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro no createPapelC:", error);
    throw error;
  }
}

async function receiveFromRDeveDevo(tableName) {
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

async function receiveFromR(r) {
  try {
    const response = await fetch(`/api/v1/tables/R?r=${r}`);
    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados R:", error);
    return [];
  }
}

async function receiveFromConfig() {
  try {
    const response = await fetch("/api/v1/tables/Config");
    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados Config:", error);
    return [];
  }
}

async function receiveFromDeve() {
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

async function receiveFromDeveJustValor(codigo) {
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

async function receiveFromDevoJustValor(codigo) {
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

async function receiveFromDevo() {
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

async function receiveFromC() {
  try {
    const response = await fetch("/api/v1/tables/c");
    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados deve:", error);
    return [];
  }
}

async function receiveFromCData(codigo, data) {
  try {
    const encodedData = encodeURIComponent(JSON.stringify(data));

    const response = await fetch(
      `/api/v1/tables/c/calculadora?codigo=${codigo}&data=${encodedData}`,
    );

    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const result = await response.json();

    return result.exists; // true ou false
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return false;
  }
}

async function receiveFromPapelCData(codigo, data) {
  try {
    const encodedData = encodeURIComponent(JSON.stringify(data));

    const response = await fetch(
      `/api/v1/tables/c/papel/calculadora?codigo=${codigo}&data=${encodedData}`,
    );

    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const result = await response.json();

    return result.exists; // true ou false
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return false;
  }
}

async function receiveFromPapelC() {
  try {
    const response = await fetch("/api/v1/tables/c/papel");
    if (!response.ok) throw new Error("Erro ao carregar os dados");
    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados deve:", error);
    return [];
  }
}

async function receiveFromRJustBSA(codigo) {
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
    console.error("Erro ao buscar dados R:", error);
    return {
      total_base: 0,
      total_sis: 0,
      total_alt: 0,
    };
  }
}

async function receiveFromPessoal(letras) {
  try {
    const response = await fetch(
      `/api/v1/tables/gastos/pessoal?letras=${letras}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao carregar os dados");
    }

    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados Pessoal:", error);
  }
}

async function receiveFromOficina(letras) {
  try {
    const response = await fetch(
      `/api/v1/tables/gastos/oficina?letras=${letras}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao carregar os dados");
    }

    const data = await response.json();
    return Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    console.error("Erro ao buscar dados Pessoal:", error);
  }
}

async function removeMandR(id) {
  const response = await fetch("/api/v1/tables", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }), // Envia o `id` no corpo da requisição
  });

  const response2 = await fetch("/api/v1/tables/R", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }), // Envia o `id` no corpo da requisição
  });

  const result = await response.json();
  console.log(result);

  const result2 = await response2.json();
  console.log(result2);
}

async function removeC(id) {
  const response = await fetch("/api/v1/tables/c", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }), // Envia o `id` no corpo da requisição
  });

  const result = await response.json();
  console.log(result);
}

async function removePapelC(id) {
  const response = await fetch("/api/v1/tables/c/papel", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }), // Envia o `id` no corpo da requisição
  });

  const result = await response.json();
  console.log(result);
}
async function removePessoal(id) {
  const response = await fetch("/api/v1/tables/gastos/pessoal", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }), // Envia o `id` no corpo da requisição
  });

  const result = await response.json();
  console.log(result);
}

async function removeOficina(id) {
  const response = await fetch("/api/v1/tables/gastos/oficina", {
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
    body: JSON.stringify({ codigo }),
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
  sendTrueMR,
  sendToR,
  sendToDeve,
  sendToDeveUpdate,
  sendToDevo,
  sendToC,
  sendToPessoal,
  sendToOficina,
  sendToPapelC,
  receiveFromC,
  receiveFromPessoal,
  receiveFromOficina,
  receiveFromCData,
  receiveFromConfig,
  receiveFromPapelC,
  receiveFromPapelCData,
  receiveFromRDeveDevo,
  receiveFromDeve,
  receiveFromDeveJustValor,
  receiveFromDevo,
  receiveFromDevoJustValor,
  receiveFromR,
  receiveFromRJustBSA,
  removeC,
  removePapelC,
  removePessoal,
  removeOficina,
  removeMandR,
  removeDeve,
  removeDevo,
};

export default execute;
