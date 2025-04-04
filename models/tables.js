import database from "infra/database.js";

async function createC1(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "C1" (codigo, data, nome, sis, alt, base, real, pix) 
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

async function createPapelC1(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "PapelC1" (codigo, data, nome, multi, papel, papelpix, papelreal, encaixepix, encaixereal, desperdicio, util, perdida, comentarios ) 
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

async function createM1(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "m1table" (observacao, codigo, dec, nome, sis, base, alt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `,
    values: [
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

async function createR1BSA(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "R1BSA" (id, codigo, nome, sis, alt, base) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,
    values: [
      ordemInputValues.id,
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
      INSERT INTO "Deve" (codigo, nome, valor) 
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

async function updateAltSis(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "m1table"
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

async function updateC1(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "C1"
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

async function updateC1BSA(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "C1"
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

async function updatePapelC1(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "PapelC1"
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

async function updateR1Button(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "m1table"
      SET r1 = $1
      WHERE id = $2
      RETURNING *;
    `,
    values: [true, updatedData.id],
  });
  return result.rows[0];
}

async function updateAltSisR1(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "R1BSA"
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

async function updateR1Calculadora(updatedData) {
  const result = await database.query({
    text: `
      WITH current_totals AS (
        SELECT 
          codigo,
          SUM(base) AS total_base,
          SUM(sis) AS total_sis,
          SUM(alt) AS total_alt
        FROM "R1BSA"
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
      UPDATE "R1BSA" r1
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
      UPDATE "m1table"
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

async function getC1() {
  const result = await database.query({
    text: `SELECT * FROM "C1"`,
  });
  return result;
}

// Modificação no getC1Data
async function getC1Data(codigo, data) {
  const result = await database.query({
    text: `SELECT EXISTS(SELECT 1 FROM "C1" WHERE codigo = $1 AND data = $2) AS exists;`,
    values: [codigo, data], // Supondo que 'data' seja um objeto compatível com o tipo da coluna
  });

  return result.rows[0].exists; // Retorna true ou false
}

async function getPapelC1() {
  const result = await database.query({
    text: `SELECT * FROM "PapelC1"`,
  });
  return result;
}

async function getM1TableAltSis() {
  const result = await database.query({
    text: `SELECT id, data, observacao, codigo, dec, nome, sis, alt, r1, r2, r3 FROM "m1table" WHERE sis > 0 OR alt > 0 ORDER BY data DESC;`,
  });
  return result;
}

async function getM1TableBase() {
  const result = await database.query({
    text: `SELECT id, data, observacao, codigo, dec, nome, base, r1, r2, r3 FROM "m1table" WHERE base > 0 ORDER BY data DESC;`,
  });
  return result;
}

async function getVerificador() {
  const result = await database.query({
    text: `SELECT * FROM "Deve"`,
  });
  return result;
}
async function getR1BSA() {
  const result = await database.query({
    text: `SELECT * FROM "R1BSA"`,
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

async function getR1JustBSA(codigo) {
  const result = await database.query({
    text: `SELECT 
            (SELECT array_agg(id) FROM "R1BSA" WHERE codigo = $1) AS ids,  -- Todos os IDs em um array
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

async function deleteM1(ids) {
  const result = await database.query({
    text: `DELETE FROM "m1table" WHERE id = ANY($1) RETURNING *`,
    values: [ids],
  });
  return result.rows;
}

async function deleteC1(ids) {
  const result = await database.query({
    text: `DELETE FROM "C1" WHERE id = $1 RETURNING *`,
    values: [ids],
  });
  return result.rows;
}

async function deletePapelC1(ids) {
  const result = await database.query({
    text: `DELETE FROM "PapelC1" WHERE id = $1 RETURNING *`,
    values: [ids],
  });
  return result.rows;
}

export async function deleteR1(ids) {
  const result = await database.query({
    text: `DELETE FROM "R1BSA" WHERE id = ANY($1) RETURNING *`,
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
  createM1,
  createR1BSA,
  createDevo,
  createDeve,
  createC1,
  createPapelC1,
  getC1,
  getC1Data,
  getPapelC1,
  getR1BSA,
  getR1JustBSA,
  getM1TableAltSis,
  getM1TableBase,
  getVerificador,
  getDeve,
  getDeveJustValor,
  getDevo,
  getDevoJustValor,
  deleteC1,
  deletePapelC1,
  deleteM1,
  deleteR1,
  deleteDeve,
  deleteDevo,
  updateC1,
  updateC1BSA,
  updatePapelC1,
  updateAltSis,
  updateAltSisR1,
  updateR1Calculadora,
  updateBase,
  updateR1Button,
};

export default ordem;
