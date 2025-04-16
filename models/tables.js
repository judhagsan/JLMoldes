import database from "infra/database.js";

async function createC(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "C" (codigo, data, nome, sis, alt, base, real, pix) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
    values: [
      ordemInputValues.codigo,
      ordemInputValues.data,
      ordemInputValues.nome,
      ordemInputValues.sis,
      ordemInputValues.alt,
      ordemInputValues.base,
      ordemInputValues.real,
      ordemInputValues.pix,
    ],
  });

  return result;
}

async function createPessoal(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "Pessoal" (dec, item, quantidade, unidade, valor, gastos, pago, proximo, dia, alerta) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `,
    values: [
      ordemInputValues.letras,
      ordemInputValues.item,
      ordemInputValues.quantidade,
      ordemInputValues.unidade,
      ordemInputValues.valor,
      ordemInputValues.gastos,
      ordemInputValues.pago,
      ordemInputValues.proximo,
      ordemInputValues.dia,
      ordemInputValues.alerta,
    ],
  });

  return result;
}

async function createOficina(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "Oficina" (dec, item, quantidade, unidade, valor, gastos, pago, proximo, dia, alerta) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `,
    values: [
      ordemInputValues.letras,
      ordemInputValues.item,
      ordemInputValues.quantidade,
      ordemInputValues.unidade,
      ordemInputValues.valor,
      ordemInputValues.gastos,
      ordemInputValues.pago,
      ordemInputValues.proximo,
      ordemInputValues.dia,
      ordemInputValues.alerta,
    ],
  });

  return result;
}

async function createPapelC(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "PapelC" (codigo, data, nome, multi, papel, papelpix, papelreal, encaixepix, encaixereal, desperdicio, util, perdida, comentarios ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `,
    values: [
      ordemInputValues.codigo,
      ordemInputValues.data,
      ordemInputValues.nome,
      ordemInputValues.multi,
      ordemInputValues.papel,
      ordemInputValues.papelpix,
      ordemInputValues.papelreal,
      ordemInputValues.encaixepix,
      ordemInputValues.encaixereal,
      ordemInputValues.desperdicio,
      ordemInputValues.util,
      ordemInputValues.perdida,
      ordemInputValues.comentarios,
    ],
  });

  return result;
}

async function createM(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "Mtable" (oficina, observacao, codigo, dec, nome, sis, base, alt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
    values: [
      ordemInputValues.oficina,
      ordemInputValues.observacao,
      ordemInputValues.codigo,
      ordemInputValues.dec,
      ordemInputValues.nome,
      ordemInputValues.sis,
      ordemInputValues.base,
      ordemInputValues.alt,
    ],
  });

  return result;
}

async function createRBSA(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "RBSA" (id, r, codigo, nome, sis, alt, base) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `,
    values: [
      ordemInputValues.id,
      ordemInputValues.r,
      ordemInputValues.codigo,
      ordemInputValues.nome,
      ordemInputValues.sis,
      ordemInputValues.alt,
      ordemInputValues.base,
    ],
  });

  return result;
}
async function createDevo(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "Devo" (codigo, nome, valor) 
      VALUES ($1, $2, $3)
      RETURNING *;
    `,
    values: [
      ordemInputValues.codigo,
      ordemInputValues.nome,
      ordemInputValues.valor,
    ],
  });

  return result;
}

async function createDeve(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "Deve" (codigo, nome, valor, data) 
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    values: [
      ordemInputValues.codigo,
      ordemInputValues.nome,
      ordemInputValues.valor,
      ordemInputValues.data,
    ],
  });

  return result;
}

async function updateAltSis(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "Mtable"
      SET 
        observacao = $1,
        dec = $2,
        nome = $3,
        sis = $4,
        alt = $5
      WHERE id = $6
      RETURNING *;
    `,
    values: [
      updatedData.observacao,
      updatedData.dec,
      updatedData.nome,
      updatedData.sis,
      updatedData.alt,
      updatedData.id,
    ],
  });

  return result;
}

async function updateC(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "C"
      SET 
        nome = $1,
        base = $2,
        sis = $3,
        alt = $4,
        real = $5,
        pix = $6
      WHERE id = $7
      RETURNING *;
    `,
    values: [
      updatedData.nome,
      updatedData.base,
      updatedData.sis,
      updatedData.alt,
      updatedData.real,
      updatedData.pix,
      updatedData.id,
    ],
  });

  return result;
}

async function updateConfig(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "config"
      SET 
        m = $1,
        e = $2,
        d = $3
      WHERE id = $4
      RETURNING *;
    `,
    values: [updatedData.m, updatedData.e, updatedData.d, updatedData.id],
  });

  return result;
}

async function updateCBSA(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "C"
      SET 
        base = base + $1,
        sis = sis + $2,
        alt = alt + $3,
        real = real + $4,
        pix = pix + $5
      WHERE codigo = $6 AND data = $7
      RETURNING *;
    `,
    values: [
      updatedData.base,
      updatedData.sis,
      updatedData.alt,
      updatedData.real,
      updatedData.pix,
      updatedData.codigo,
      updatedData.data,
    ],
  });

  return result;
}

async function updatePapelC(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "PapelC"
      SET 
        nome = $1,
        multi = $2,
        papel = $3,
        papelpix = $4,
        papelreal = $5,
        encaixereal = $6,
        encaixepix = $7,
        desperdicio = $8,
        util = $9,
        perdida = $10,
        comentarios = $11
      WHERE id = $12
      RETURNING *;
    `,
    values: [
      updatedData.nome,
      updatedData.multi,
      updatedData.papel,
      updatedData.papelpix,
      updatedData.papelreal,
      updatedData.encaixereal,
      updatedData.encaixepix,
      updatedData.desperdicio,
      updatedData.util,
      updatedData.perdida,
      updatedData.comentarios,
      updatedData.id,
    ],
  });

  return result;
}

async function updatePessoal(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "Pessoal"
      SET 
        item = $1,
        quantidade = $2,
        unidade = $3,
        valor = $4,
        gastos = $5,
        pago = $6,
        proximo = $7,
        dia = $8,
        alerta = $9
      WHERE id = $10
      RETURNING *;
    `,
    values: [
      updatedData.item,
      updatedData.quantidade,
      updatedData.unidade,
      updatedData.valor,
      updatedData.gastos,
      updatedData.pago,
      updatedData.proximo,
      updatedData.dia,
      updatedData.alerta,
      updatedData.id,
    ],
  });

  return result;
}

async function updateOficina(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "Oficina"
      SET 
        item = $1,
        quantidade = $2,
        unidade = $3,
        valor = $4,
        gastos = $5,
        pago = $6,
        proximo = $7,
        dia = $8,
        alerta = $9
      WHERE id = $10
      RETURNING *;
    `,
    values: [
      updatedData.item,
      updatedData.quantidade,
      updatedData.unidade,
      updatedData.valor,
      updatedData.gastos,
      updatedData.pago,
      updatedData.proximo,
      updatedData.dia,
      updatedData.alerta,
      updatedData.id,
    ],
  });

  return result;
}

async function updateRButton(updatedData) {
  // Extrai a chave dinâmica (ex: 'r1', 'r2') dos dados recebidos
  const rColumn = Object.keys(updatedData).find(
    (key) => key.startsWith("r") && key !== "id" && /^r\d+$/.test(key), // Valida o formato 'r' seguido de números
  );

  if (!rColumn) {
    throw new Error("Coluna R inválida");
  }

  // Usa a coluna identificada na query SQL
  const result = await database.query({
    text: `
      UPDATE "Mtable"
      SET ${rColumn} = $1
      WHERE id = $2
      RETURNING *;
    `,
    values: [true, updatedData.id],
  });

  return result.rows[0];
}

async function updateAltSisR(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "RBSA"
      SET 
        nome = $1,
        base = $2,
        sis = $3,
        alt = $4
      WHERE id = $5
      RETURNING *;
    `,
    values: [
      updatedData.nome,
      updatedData.base || 0,
      updatedData.sis || 0,
      updatedData.alt || 0,
      updatedData.id,
    ],
  });

  return result;
}

async function updateRCalculadora(updatedData) {
  const result = await database.query({
    text: `
      WITH current_totals AS (
        SELECT 
          codigo,
          SUM(base) AS total_base,
          SUM(sis) AS total_sis,
          SUM(alt) AS total_alt
        FROM "RBSA"
        WHERE codigo = $4
          AND (base > 0 OR sis > 0 OR alt > 0)
        GROUP BY codigo
      ),
      desired_totals AS (
        SELECT 
          $1::numeric AS desired_base,  -- Sem precisão fixa
          $2::numeric AS desired_sis,
          $3::numeric AS desired_alt
      )
      UPDATE "RBSA" r1
      SET
        base = CASE 
          WHEN ct.total_base = 0 THEN r1.base
          ELSE TRIM_SCALE( (r1.base * dt.desired_base) / ct.total_base )
        END,
        sis = CASE 
          WHEN ct.total_sis = 0 THEN r1.sis
          ELSE TRIM_SCALE( (r1.sis * dt.desired_sis) / ct.total_sis )
        END,
        alt = CASE 
          WHEN ct.total_alt = 0 THEN r1.alt
          ELSE TRIM_SCALE( (r1.alt * dt.desired_alt) / ct.total_alt )
        END
      FROM current_totals ct, desired_totals dt
      WHERE r1.codigo = ct.codigo
        AND (r1.base > 0 OR r1.sis > 0 OR r1.alt > 0)
      RETURNING *;
    `,
    values: [
      Number(updatedData.base) || 0,
      Number(updatedData.sis) || 0,
      Number(updatedData.alt) || 0,
      updatedData.codigo,
    ],
  });

  return result;
}

async function updateBase(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "Mtable"
      SET 
        observacao = $1,
        dec = $2,
        nome = $3,
        base = $4
      WHERE id = $5
      RETURNING *;
    `,
    values: [
      updatedData.observacao,
      updatedData.dec,
      updatedData.nome,
      updatedData.base,
      updatedData.id,
    ],
  });

  return result;
}

async function updateDeve(updatedData) {
  const result = await database.query({
    text: `
      -- Passo 1: Calcula a soma total dos valores
      WITH total_sum AS (
        SELECT SUM(valor) AS total FROM "Deve" WHERE codigo = $2
      ),
      -- Passo 2: Ordena as linhas por data (para identificar a última linha)
      ordered_rows AS (
        SELECT 
          data, 
          valor,
          ROW_NUMBER() OVER (ORDER BY data DESC) AS row_num
        FROM "Deve"
        WHERE codigo = $2
      ),
      -- Passo 3: Atualiza as linhas
      -- Se soma_total >= valor_a_subtrair: subtrai normalmente
      -- Se soma_total < valor_a_subtrair: 
      --    - Zera todas as linhas
      --    - Insere a diferença positiva na última linha
      updated_rows AS (
        UPDATE "Deve" d
        SET valor = 
          CASE
            -- Caso 1: Soma total suficiente (subtrai normalmente)
            WHEN (SELECT total FROM total_sum) >= $1 THEN
              (SELECT subtract_amount FROM (
                SELECT 
                  data,
                  CASE
                    WHEN (SUM(valor) OVER (ORDER BY data) - valor) <= $1 THEN
                      CASE
                        WHEN SUM(valor) OVER (ORDER BY data) <= $1 THEN valor
                        ELSE $1 - (SUM(valor) OVER (ORDER BY data) - valor)
                      END
                    ELSE 0
                  END AS subtract_amount
                FROM "Deve"
                WHERE codigo = $2
              ) s WHERE s.data = d.data)
            -- Caso 2: Soma total insuficiente (zerar tudo e inserir diferença na última linha)
            ELSE
              CASE
                -- Se for a última linha, insere a diferença positiva
                WHEN (SELECT row_num FROM ordered_rows o WHERE o.data = d.data) = 1 THEN
                  ABS((SELECT total FROM total_sum) - $1)
                -- Outras linhas são zeradas
                ELSE 0
              END
          END
        WHERE codigo = $2
        RETURNING *
      )
      SELECT * FROM updated_rows;
    `,
    values: [updatedData.valor, updatedData.codigo],
  });

  return result;
}

async function getC() {
  const result = await database.query({
    text: `SELECT * FROM "C"`,
  });
  return result;
}

async function getPessoal(letras) {
  const result = await database.query({
    text: `SELECT * FROM "Pessoal" WHERE dec = $1;`,
    values: [letras],
  });
  return result.rows;
}

async function getOficina(letras) {
  const result = await database.query({
    text: `SELECT * FROM "Oficina" WHERE dec = $1;`,
    values: [letras],
  });
  return result.rows;
}

async function getConfig() {
  const result = await database.query({
    text: `SELECT * FROM "config"`,
  });
  return result;
}

// Modificação no getC1Data
async function getCData(codigo, data) {
  const result = await database.query({
    text: `SELECT EXISTS(SELECT 1 FROM "C" WHERE codigo = $1 AND data = $2) AS exists;`,
    values: [codigo, data], // Supondo que 'data' seja um objeto compatível com o tipo da coluna
  });

  return result.rows[0].exists; // Retorna true ou false
}

async function getPapelData(codigo, data) {
  const datas = Array.isArray(data) ? data : [data];

  // Cria placeholders dinâmicos ($2, $3, etc.)
  const placeholders = datas.map((_, i) => `$${i + 2}`).join(",");

  const result = await database.query({
    text: `SELECT EXISTS(
             SELECT 1 
             FROM "Deve" 
             WHERE codigo = $1 
             AND data IN (${placeholders})  -- Usa IN com os placeholders
           ) AS exists;`,
    values: [codigo, ...datas], // Espalha os valores do array
  });

  return result.rows[0].exists;
}

async function getPapelC() {
  const result = await database.query({
    text: `SELECT * FROM "PapelC"`,
  });
  return result;
}

async function getMTableAltSis(oficina) {
  const result = await database.query({
    text: `SELECT id, data, observacao, codigo, dec, nome, sis, alt, r1, r2, r3 
           FROM "Mtable" 
           WHERE oficina = $1 
           AND (sis > 0 OR alt > 0) 
           ORDER BY data DESC;`,
    values: [oficina],
  });
  return result;
}

async function getMTableBase(oficina) {
  const result = await database.query({
    text: `SELECT id, data, observacao, codigo, dec, nome, base, r1, r2, r3 
           FROM "Mtable" 
           WHERE oficina = $1 
           AND base > 0 ORDER BY data DESC;`,
    values: [oficina],
  });
  return result;
}

async function getVerificador() {
  const result = await database.query({
    text: `SELECT * FROM "Deve"`,
  });
  return result;
}
async function getRBSA(r) {
  const result = await database.query({
    text: `SELECT * FROM "RBSA" WHERE r=$1`,
    values: [r],
  });
  return result;
}

async function getDeve() {
  const result = await database.query({
    text: `SELECT * FROM "Deve"`,
  });
  return result;
}
async function getDevo() {
  const result = await database.query({
    text: `SELECT * FROM "Devo"`,
  });
  return result;
}

async function getRJustBSA(codigo) {
  const result = await database.query({
    text: `SELECT 
            (SELECT array_agg(id) FROM "RBSA" WHERE codigo = $1) AS ids,  -- Todos os IDs em um array
            SUM(base) AS total_base,
            SUM(sis) AS total_sis,
            SUM(alt) AS total_alt
          FROM "R1BSA" 
          WHERE codigo = $1;`,
    values: [codigo],
  });

  // Retorna apenas a primeira linha com os totais
  return (
    result.rows[0] || {
      total_base: 0,
      total_sis: 0,
      total_alt: 0,
    }
  );
}

async function getDeveJustValor(codigo) {
  const result = await database.query({
    text: `SELECT 
             SUM(valor) AS total_valor
           FROM "Deve" 
           WHERE codigo = $1;`,
    values: [codigo],
  });

  // Retorna apenas a primeira linha com os totais
  return (
    result.rows[0] || {
      total_valor: 0,
    }
  );
}

async function getDevoJustValor(codigo) {
  const result = await database.query({
    text: `SELECT 
             SUM(valor) AS total_valor
           FROM "Devo" 
           WHERE codigo = $1;`,
    values: [codigo],
  });

  // Retorna apenas a primeira linha com os totais
  return (
    result.rows[0] || {
      total_valor: 0,
    }
  );
}

async function deleteM(ids) {
  const result = await database.query({
    text: `DELETE FROM "Mtable" WHERE id = ANY($1) RETURNING *`,
    values: [ids],
  });
  return result.rows;
}

async function deleteC(ids) {
  const result = await database.query({
    text: `DELETE FROM "C" WHERE id = $1 RETURNING *`,
    values: [ids],
  });
  return result.rows;
}

async function deletePapelC(ids) {
  const result = await database.query({
    text: `DELETE FROM "PapelC" WHERE id = $1 RETURNING *`,
    values: [ids],
  });
  return result.rows;
}

async function deletePessoal(ids) {
  const result = await database.query({
    text: `DELETE FROM "Pessoal" WHERE id = $1 RETURNING *`,
    values: [ids],
  });
  return result.rows;
}

async function deleteOficina(ids) {
  const result = await database.query({
    text: `DELETE FROM "Oficina" WHERE id = $1 RETURNING *`,
    values: [ids],
  });
  return result.rows;
}

export async function deleteR(ids) {
  const result = await database.query({
    text: `DELETE FROM "RBSA" WHERE id = ANY($1) RETURNING *`,
    values: [ids],
  });
  return result.rows;
}

export async function deleteDevo(codigo) {
  const result = await database.query({
    text: `DELETE FROM "Devo" WHERE codigo = $1 RETURNING *`,
    values: [codigo],
  });
  return result.rows;
}

export async function deleteDeve(codigo) {
  const result = await database.query({
    text: `DELETE FROM "Deve" WHERE codigo = $1 RETURNING *`,
    values: [codigo],
  });
  return result.rows;
}

const ordem = {
  createM,
  createPessoal,
  createOficina,
  createRBSA,
  createDevo,
  createDeve,
  createC,
  createPapelC,
  getPessoal,
  getOficina,
  getC,
  getCData,
  getPapelC,
  getPapelData,
  getConfig,
  getRBSA,
  getRJustBSA,
  getMTableAltSis,
  getMTableBase,
  getVerificador,
  getDeve,
  getDeveJustValor,
  getDevo,
  getDevoJustValor,
  deleteC,
  deletePapelC,
  deletePessoal,
  deleteOficina,
  deleteM,
  deleteR,
  deleteDeve,
  deleteDevo,
  updateDeve,
  updateConfig,
  updateC,
  updateCBSA,
  updatePessoal,
  updateOficina,
  updatePapelC,
  updateAltSis,
  updateAltSisR,
  updateRCalculadora,
  updateBase,
  updateRButton,
};

export default ordem;
