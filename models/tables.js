import database from "infra/database.js";

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
    text: `SELECT * FROM "m1table"`,
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
  getR1BSA,
  getR1JustBSA,
  getM1TableAltSis,
  getM1TableBase,
  getVerificador,
  getDeve,
  getDeveJustValor,
  getDevo,
  getDevoJustValor,
  deleteM1,
  deleteR1,
  deleteDeve,
  deleteDevo,
  updateAltSis,
  updateAltSisR1,
  updateBase,
  updateR1Button,
};

export default ordem;
