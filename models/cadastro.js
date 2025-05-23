import database from "infra/database.js";

async function createCad(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "cadastro" (regiao, codigo, facebook, instagram, email, whatsapp1, whatsapp2, nome, grupo, observacao) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `,
    values: [
      ordemInputValues.regiao,
      ordemInputValues.codigo,
      ordemInputValues.facebook,
      ordemInputValues.instagram,
      ordemInputValues.email,
      ordemInputValues.whatsapp1,
      ordemInputValues.whatsapp2,
      ordemInputValues.nome,
      ordemInputValues.grupo,
      ordemInputValues.observacao,
    ],
  });

  return result;
}
async function updateCad(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "cadastro"
      SET 
        regiao = $1,
        codigo = $2,
        facebook = $3,
        instagram = $4,
        email = $5,
        whatsapp1 = $6,
        whatsapp2 = $7,
        nome = $8,
        grupo = $9,
        observacao = $10
      WHERE id = $11
      RETURNING *;
    `,
    values: [
      updatedData.regiao,
      updatedData.codigo,
      updatedData.facebook,
      updatedData.instagram,
      updatedData.email,
      updatedData.whatsapp1,
      updatedData.whatsapp2,
      updatedData.nome,
      updatedData.grupo,
      updatedData.observacao,
      updatedData.id,
    ],
  });

  return result;
}

async function getCad() {
  const result = await database.query({
    text: `SELECT * FROM "cadastro" ORDER BY data DESC;`,
  });
  return result;
}

export async function deleteCad(id) {
  const result = await database.query({
    text: `DELETE FROM "cadastro" WHERE id = $1 RETURNING *;`,
    values: [id],
  });
  return result.rows;
}

const ordem = {
  createCad,
  getCad,
  deleteCad,
  updateCad,
};

export default ordem;
