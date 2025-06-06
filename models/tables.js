import database from "infra/database.js";

async function notifyWebSocketServer(data) {
  const wsNotifyUrl = process.env.RAILWAY_WB
    ? `https://${process.env.RAILWAY_WB}/broadcast`
    : null;

  if (!wsNotifyUrl) {
    console.warn(
      "RAILWAY_WB environment variable is not set. WebSocket notification will be skipped.",
    );
    return;
  }

  try {
    const response = await fetch(wsNotifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `Erro WebSocket (${response.status}) ao enviar notificação: ${errorData}. Dados:`,
        data,
      );
    } else {
      // console.log("Notificação WebSocket enviada com sucesso:", data);
    }
  } catch (error) {
    console.error(
      "Falha ao conectar/enviar notificação WebSocket:",
      error,
      "Dados:",
      data,
    );
  }
}

async function createC(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "C" (codigo,dec, data, nome, sis, alt, base, real, pix, r) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `,
    values: [
      ordemInputValues.codigo,
      ordemInputValues.dec,
      ordemInputValues.data,
      ordemInputValues.nome,
      ordemInputValues.sis,
      ordemInputValues.alt,
      ordemInputValues.base,
      ordemInputValues.real,
      ordemInputValues.pix,
      ordemInputValues.r,
    ],
  });

  return result;
}

async function createNota(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "Nota" (texto, r, colum) 
      VALUES ($1, $2, $3)
      RETURNING *;
    `,
    values: [
      ordemInputValues.texto,
      ordemInputValues.r,
      ordemInputValues.colum,
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

async function createSaidaP(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "SaidaP" (dec, gastos, valor, pago) 
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    values: [
      ordemInputValues.letras,
      ordemInputValues.gastos,
      ordemInputValues.valor,
      ordemInputValues.pago,
    ],
  });

  return result;
}

async function createSaidaO(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "SaidaO" (dec, oficina, gastos, valor, pago) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    values: [
      ordemInputValues.letras,
      ordemInputValues.oficina,
      ordemInputValues.gastos,
      ordemInputValues.valor,
      ordemInputValues.pago,
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

async function createPapel(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "Papel" (dec, item, quantidade, unidade, valor, gastos, pago, alerta, metragem) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      ordemInputValues.alerta,
      ordemInputValues.metragem,
    ],
  });

  return result;
}

async function createPapelC(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "PapelC" (deveid, codigo, data, nome, multi, papel, papelpix, papelreal, encaixepix, encaixereal, desperdicio, util, perdida, comentarios, r, comissao ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *;
    `,
    values: [
      ordemInputValues.deveid,
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
      ordemInputValues.r,
      ordemInputValues.comissao,
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
      INSERT INTO "RBSA" (id, dec, r, codigo, nome, sis, alt, base) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
    values: [
      ordemInputValues.id,
      ordemInputValues.dec,
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
      INSERT INTO "Devo" (codigo, nome, valor, r) 
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    values: [
      ordemInputValues.codigo,
      ordemInputValues.nome,
      ordemInputValues.valor,
      ordemInputValues.r,
    ],
  });

  return result;
}

async function createDeve(ordemInputValues) {
  const result = await database.query({
    text: `
      INSERT INTO "Deve" (deveid, codigo, nome, valor, data, r, valorpapel, valorcomissao) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
    values: [
      ordemInputValues.deveid,
      ordemInputValues.codigo,
      ordemInputValues.nome,
      ordemInputValues.valor,
      ordemInputValues.data,
      ordemInputValues.r,
      ordemInputValues.valorpapel,
      ordemInputValues.valorcomissao,
    ],
  });

  return result;
}

async function createTemp(tempData) {
  const valuesPlaceholders = Array.from(
    { length: 28 },
    (_, i) => `$${i + 7}`,
  ).join(", ");
  const valuesColumns = Array.from(
    { length: 28 },
    (_, i) => `v${String(i + 1).padStart(2, "0")}`,
  ).join(", ");

  const result = await database.query({
    text: `
      INSERT INTO "Temp" (nome, codigo, multi, r, data, comissao, ${valuesColumns})
      VALUES ($1, $2, $3, $4, $5, $6, ${valuesPlaceholders})
      RETURNING *;
    `,
    values: [
      tempData.nome,
      tempData.codigo,
      tempData.multi,
      tempData.r,
      tempData.data,
      tempData.comissao,
      ...tempData.values_array,
    ],
  });
  return result.rows[0];
}

async function createPagamento(pagamentoData) {
  // Ensure you have a "Pagamentos" table with columns: nome, r, data, pix, real, etc.
  // Adjust column names and placeholders ($1, $2, etc.) as per your table structure.
  const result = await database.query({
    text: `
      INSERT INTO "Pagamentos" (nome, r, data, pix, real) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *; 
    `,
    values: [
      pagamentoData.nome,
      pagamentoData.r,
      pagamentoData.data, // Ensure this is in a format PostgreSQL understands (e.g., ISO string)
      parseFloat(pagamentoData.pix) || 0,
      parseFloat(pagamentoData.real) || 0,
    ],
  });
  return result; // The handler expects result.rows[0]
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

async function updateDec(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "Dec"
      SET
        "on" = COALESCE($1, "on"),
        sis  = COALESCE(sis, 0) + $2,
        base = COALESCE(base, 0) + $3,
        alt  = COALESCE(alt, 0) + $4
      WHERE r = $5 AND dec = $6
      RETURNING *;
    `,
    values: [
      updatedData.on !== undefined ? updatedData.on : null,
      Number(updatedData.sis) || 0,
      Number(updatedData.base) || 0,
      Number(updatedData.alt) || 0,
      updatedData.r,
      updatedData.dec,
    ],
  });
  return result;
}

async function updateNota(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "Nota"
      SET 
        texto = $1
      WHERE id = $2
      RETURNING *;
    `,
    values: [updatedData.texto, updatedData.id],
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

async function updateCBSA(codigo, data, r, dec, newValues) {
  return await database.query({
    text: `UPDATE "C"
           SET
             sis  = sis  + $5,
             alt  = alt  + $6,
             base = base + $7,
             real = real + $8,
             pix  = pix  + $9
           WHERE codigo = $1
             AND data   = $2
             AND r      = $3
             AND dec    = $4
           RETURNING *;`,
    values: [
      codigo,
      data,
      r,
      dec,
      newValues.sis,
      newValues.alt,
      newValues.base,
      newValues.real,
      newValues.pix,
    ],
  });
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

async function updateSaidaP(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "SaidaP"
      SET 
        gastos = $1,
        valor = $2
      WHERE id = $3
      RETURNING *;
    `,
    values: [updatedData.gastos, updatedData.valor, updatedData.id],
  });

  return result;
}

async function updateSaidaO(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "SaidaO"
      SET 
        gastos = $1,
        valor = $2
      WHERE id = $3
      RETURNING *;
    `,
    values: [updatedData.gastos, updatedData.valor, updatedData.id],
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

async function updatePapel(updatedData) {
  const result = await database.query({
    text: `
      UPDATE "Papel"
      SET
        item = COALESCE($1, item),
        quantidade = COALESCE($2, quantidade),
        unidade = COALESCE($3, unidade),
        valor = COALESCE($4, valor),
        gastos = COALESCE($5, gastos),
        pago = COALESCE($6, pago),
        alerta = COALESCE($7, alerta),
        metragem = COALESCE($8, metragem)
      WHERE id = $9
      RETURNING *;
    `,
    values: [
      updatedData.item !== undefined ? updatedData.item : null,
      updatedData.quantidade !== undefined ? updatedData.quantidade : null,
      updatedData.unidade !== undefined ? updatedData.unidade : null,
      updatedData.valor !== undefined ? updatedData.valor : null,
      updatedData.gastos !== undefined ? updatedData.gastos : null,
      updatedData.pago !== undefined ? updatedData.pago : null,
      updatedData.alerta !== undefined ? updatedData.alerta : null,
      updatedData.metragem !== undefined ? updatedData.metragem : null,
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
          AND r1 = false
          AND r2 = false
          AND r3 = false
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

// models/tables.js

async function updateRCalculadora(updatedDataArray) {
  if (!Array.isArray(updatedDataArray) || updatedDataArray.length === 0) {
    throw new Error("updateRCalculadora: precisa receber um array não-vazio");
  }

  // todas as linhas têm mesmo codigo e r
  const { codigo, r } = updatedDataArray[0];

  // preparamos só o dec + valores que serão desejados
  const simpleUpdates = updatedDataArray.map(({ dec, base, sis, alt }) => ({
    dec,
    base: Number(base) || 0,
    sis: Number(sis) || 0,
    alt: Number(alt) || 0,
  }));

  const result = await database.query({
    text: `
      WITH updates AS (
        -- converte o JSONB em tabela (uma linha por dec)
        SELECT
          u.dec,
          u.base  AS desired_base,
          u.sis   AS desired_sis,
          u.alt   AS desired_alt
        FROM jsonb_to_recordset($1::jsonb) AS u(
          dec     text,
          base    numeric,
          sis     numeric,
          alt     numeric
        )
      ),
      current_totals AS (
        -- soma os valores atuais por dec
        SELECT
          dec,
          COALESCE(SUM(base),0) AS total_base,
          COALESCE(SUM(sis),0)  AS total_sis,
          COALESCE(SUM(alt),0)  AS total_alt
        FROM "RBSA"
        WHERE codigo = $2
          AND r      = $3
        GROUP BY dec
      ),
      diffs AS (
        -- para cada dec, quanto precisa subtrair do total
        SELECT
          ct.dec,
          (ct.total_base - u.desired_base) AS diff_base,
          (ct.total_sis  - u.desired_sis)  AS diff_sis,
          (ct.total_alt  - u.desired_alt)  AS diff_alt,
          ct.total_base,
          ct.total_sis,
          ct.total_alt
        FROM updates u
        JOIN current_totals ct
          ON ct.dec = u.dec
      )
      UPDATE "RBSA" AS r1
      SET
        base = CASE
          WHEN d.total_base = 0 THEN 0
          ELSE r1.base
               - d.diff_base * (r1.base / d.total_base)
        END,
        sis = CASE
          WHEN d.total_sis = 0 THEN 0
          ELSE r1.sis
               - d.diff_sis  * (r1.sis  / d.total_sis)
        END,
        alt = CASE
          WHEN d.total_alt = 0 THEN 0
          ELSE r1.alt
               - d.diff_alt  * (r1.alt  / d.total_alt)
        END
      FROM diffs d
      WHERE
        r1.codigo = $2
        AND r1.r      = $3
        AND r1.dec    = d.dec
      RETURNING r1.*;
    `,
    values: [
      JSON.stringify(simpleUpdates), // $1: JSONB com [ {dec, base, sis, alt}, ... ]
      codigo, // $2
      r, // $3
    ],
  });

  return result.rows;
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
  const client = await database.getNewClient();
  const papelCNotifications = []; // To store PapelC items for notification

  try {
    await client.query("BEGIN");

    const originalDeveValuesRes = await client.query({
      text: `SELECT deveid, valorpapel, valorcomissao FROM "Deve" WHERE codigo = $1 AND r = $2`,
      values: [updatedData.codigo, updatedData.r],
    });
    const originalDeveMap = new Map(
      originalDeveValuesRes.rows.map((row) => [
        row.deveid,
        {
          valorpapel: parseFloat(row.valorpapel) || 0,
          valorcomissao: parseFloat(row.valorcomissao) || 0,
        },
      ]),
    );

    // Passo 2: Executar a atualização principal na tabela "Deve"
    // Esta é a query complexa que você já tinha, que atualiza 'valor', 'valorpapel' e 'valorcomissao'
    const updateDeveResult = await client.query({
      text: `
      -- Passo 1: Calcula a soma total dos valores
      WITH total_sum AS (
        SELECT SUM(valor) AS total FROM "Deve" WHERE codigo = $2 AND r = $3
      ),
      -- Passo 2: Ordena as linhas por data (para identificar a última linha)
      ordered_rows AS (
        SELECT 
          deveid, -- Adicionado para referência
          data, 
          valor,
          valorpapel, -- Adicionado para referência
          valorcomissao, -- Adicionado para referência
          ROW_NUMBER() OVER (ORDER BY data DESC) AS row_num
        FROM "Deve"
        WHERE codigo = $2 AND r = $3
      ),
      -- Passo 3: Atualiza as linhas
      updated_rows AS (
        UPDATE "Deve" d
        SET 
          valor = ( 
            CASE
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
                WHERE codigo = $2 AND r = $3
              ) s WHERE s.data = d.data)
            ELSE
              CASE
                WHEN (SELECT row_num FROM ordered_rows o WHERE o.deveid = d.deveid AND o.data = d.data) = 1 THEN -- Ajustado para usar deveid se data não for única
                  ABS((SELECT total FROM total_sum) - $1)
                ELSE 0
              END
            END
          ),

          valorpapel =
            CASE
              WHEN ((CASE 
                    WHEN (SELECT total FROM total_sum) >= $1 THEN
                      (SELECT subtract_amount FROM (SELECT data, CASE WHEN (SUM(valor) OVER (ORDER BY data) - valor) <= $1 THEN CASE WHEN SUM(valor) OVER (ORDER BY data) <= $1 THEN valor ELSE $1 - (SUM(valor) OVER (ORDER BY data) - valor) END ELSE 0 END AS subtract_amount FROM "Deve" WHERE codigo = $2 AND r = $3) s WHERE s.data = d.data)
                    ELSE CASE WHEN (SELECT row_num FROM ordered_rows o WHERE o.deveid = d.deveid AND o.data = d.data) = 1 THEN ABS((SELECT total FROM total_sum) - $1) ELSE 0 END
                  END)) <= 0 THEN 0 
              ELSE 
                CASE
                  WHEN (d.valorpapel + d.valorcomissao) > 0 THEN 
                    ((CASE WHEN (SELECT total FROM total_sum) >= $1 THEN (SELECT subtract_amount FROM (SELECT data, CASE WHEN (SUM(valor) OVER (ORDER BY data) - valor) <= $1 THEN CASE WHEN SUM(valor) OVER (ORDER BY data) <= $1 THEN valor ELSE $1 - (SUM(valor) OVER (ORDER BY data) - valor) END ELSE 0 END AS subtract_amount FROM "Deve" WHERE codigo = $2 AND r = $3) s WHERE s.data = d.data) ELSE CASE WHEN (SELECT row_num FROM ordered_rows o WHERE o.deveid = d.deveid AND o.data = d.data) = 1 THEN ABS((SELECT total FROM total_sum) - $1) ELSE 0 END END)) * (d.valorpapel / (d.valorpapel + d.valorcomissao))
                  ELSE 
                    ((CASE WHEN (SELECT total FROM total_sum) >= $1 THEN (SELECT subtract_amount FROM (SELECT data, CASE WHEN (SUM(valor) OVER (ORDER BY data) - valor) <= $1 THEN CASE WHEN SUM(valor) OVER (ORDER BY data) <= $1 THEN valor ELSE $1 - (SUM(valor) OVER (ORDER BY data) - valor) END ELSE 0 END AS subtract_amount FROM "Deve" WHERE codigo = $2 AND r = $3) s WHERE s.data = d.data) ELSE CASE WHEN (SELECT row_num FROM ordered_rows o WHERE o.deveid = d.deveid AND o.data = d.data) = 1 THEN ABS((SELECT total FROM total_sum) - $1) ELSE 0 END END)) / 2.0
                END
            END,

          valorcomissao =
            CASE
              WHEN ((CASE 
                    WHEN (SELECT total FROM total_sum) >= $1 THEN
                      (SELECT subtract_amount FROM (SELECT data, CASE WHEN (SUM(valor) OVER (ORDER BY data) - valor) <= $1 THEN CASE WHEN SUM(valor) OVER (ORDER BY data) <= $1 THEN valor ELSE $1 - (SUM(valor) OVER (ORDER BY data) - valor) END ELSE 0 END AS subtract_amount FROM "Deve" WHERE codigo = $2 AND r = $3) s WHERE s.data = d.data)
                    ELSE CASE WHEN (SELECT row_num FROM ordered_rows o WHERE o.deveid = d.deveid AND o.data = d.data) = 1 THEN ABS((SELECT total FROM total_sum) - $1) ELSE 0 END
                  END)) <= 0 THEN 0 
              ELSE 
                CASE
                  WHEN (d.valorpapel + d.valorcomissao) > 0 THEN 
                    ((CASE WHEN (SELECT total FROM total_sum) >= $1 THEN (SELECT subtract_amount FROM (SELECT data, CASE WHEN (SUM(valor) OVER (ORDER BY data) - valor) <= $1 THEN CASE WHEN SUM(valor) OVER (ORDER BY data) <= $1 THEN valor ELSE $1 - (SUM(valor) OVER (ORDER BY data) - valor) END ELSE 0 END AS subtract_amount FROM "Deve" WHERE codigo = $2 AND r = $3) s WHERE s.data = d.data) ELSE CASE WHEN (SELECT row_num FROM ordered_rows o WHERE o.deveid = d.deveid AND o.data = d.data) = 1 THEN ABS((SELECT total FROM total_sum) - $1) ELSE 0 END END)) * (d.valorcomissao / (d.valorpapel + d.valorcomissao))
                  ELSE 
                    ((CASE WHEN (SELECT total FROM total_sum) >= $1 THEN (SELECT subtract_amount FROM (SELECT data, CASE WHEN (SUM(valor) OVER (ORDER BY data) - valor) <= $1 THEN CASE WHEN SUM(valor) OVER (ORDER BY data) <= $1 THEN valor ELSE $1 - (SUM(valor) OVER (ORDER BY data) - valor) END ELSE 0 END AS subtract_amount FROM "Deve" WHERE codigo = $2 AND r = $3) s WHERE s.data = d.data) ELSE CASE WHEN (SELECT row_num FROM ordered_rows o WHERE o.deveid = d.deveid AND o.data = d.data) = 1 THEN ABS((SELECT total FROM total_sum) - $1) ELSE 0 END END)) / 2.0
                END
            END
        WHERE codigo = $2 AND r = $3
        RETURNING deveid, valor, valorpapel, valorcomissao -- Retornar os valores atualizados
      )
      SELECT * FROM updated_rows;
    `,
      values: [updatedData.valor, updatedData.codigo, updatedData.r], // $1, $2, $3
    });
    const updatedDeveRows = updateDeveResult.rows;

    // Passo 3: Calcular diferenças e atualizar "PapelC" para cada deveid relevante
    const pixPaymentAmount = parseFloat(updatedData.pix) || 0;
    const realPaymentAmount = parseFloat(updatedData.real) || 0;
    const totalPixRealPayment = pixPaymentAmount + realPaymentAmount;

    for (const updatedRow of updatedDeveRows) {
      // Verificar se este deveid está na lista para atualizar PapelC
      if (
        updatedData.deveIdsArray &&
        updatedData.deveIdsArray.includes(updatedRow.deveid)
      ) {
        const originalRow = originalDeveMap.get(updatedRow.deveid);

        if (originalRow) {
          const currentValorpapel = parseFloat(updatedRow.valorpapel) || 0;
          const currentValorcomissao =
            parseFloat(updatedRow.valorcomissao) || 0;

          const valorpapelDiff = originalRow.valorpapel - currentValorpapel;
          const valorcomissaoDiff =
            originalRow.valorcomissao - currentValorcomissao;

          let addPapelpix = 0;
          let addPapelreal = 0;
          let addEncaixepix = 0;
          let addEncaixereal = 0;

          if (valorpapelDiff > 0) {
            if (totalPixRealPayment > 0) {
              addPapelpix =
                valorpapelDiff * (pixPaymentAmount / totalPixRealPayment);
              addPapelreal =
                valorpapelDiff * (realPaymentAmount / totalPixRealPayment);
            } else if (pixPaymentAmount > 0) {
              // Fallback se só PIX foi informado como pagamento
              addPapelpix = valorpapelDiff;
            } else if (realPaymentAmount > 0) {
              // Fallback se só REAL foi informado
              addPapelreal = valorpapelDiff;
            }
            // Se totalPixRealPayment é 0, não há base para distribuir em papelpix/real
          }

          if (valorcomissaoDiff > 0) {
            if (totalPixRealPayment > 0) {
              addEncaixepix =
                valorcomissaoDiff * (pixPaymentAmount / totalPixRealPayment);
              addEncaixereal =
                valorcomissaoDiff * (realPaymentAmount / totalPixRealPayment);
            } else if (pixPaymentAmount > 0) {
              addEncaixepix = valorcomissaoDiff;
            } else if (realPaymentAmount > 0) {
              addEncaixereal = valorcomissaoDiff;
            }
          }

          // Arredondar para 2 casas decimais
          addPapelpix = parseFloat(addPapelpix.toFixed(2));
          addPapelreal = parseFloat(addPapelreal.toFixed(2));
          addEncaixepix = parseFloat(addEncaixepix.toFixed(2));
          addEncaixereal = parseFloat(addEncaixereal.toFixed(2));

          if (
            addPapelpix > 0 ||
            addPapelreal > 0 ||
            addEncaixepix > 0 ||
            addEncaixereal > 0
          ) {
            const updatePapelCResult = await client.query({
              text: `
                UPDATE "PapelC"
                SET 
                  papelpix = papelpix + $1,
                  papelreal = papelreal + $2,
                  encaixepix = encaixepix + $3,
                  encaixereal = encaixereal + $4
                WHERE deveid = $5
                RETURNING * -- Added RETURNING * to get the updated row
              `,
              values: [
                addPapelpix,
                addPapelreal,
                addEncaixepix,
                addEncaixereal,
                updatedRow.deveid,
              ],
            });

            if (updatePapelCResult.rows.length > 0) {
              // Add the fully updated PapelC item to our notification list
              papelCNotifications.push(updatePapelCResult.rows[0]);
            }
          }
        }
      }
    }

    await client.query("COMMIT"); // Confirmar transação

    // After successful commit, send all collected PapelC update notifications
    for (const papelCRow of papelCNotifications) {
      await notifyWebSocketServer({
        type: "PAPELC_UPDATED_ITEM",
        payload: papelCRow,
      });
    }

    return updateDeveResult; // Retornar o resultado da atualização em "Deve"
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK"); // Desfazer transação em caso de erro
    }
    console.error("Erro na transação updateDeve:", error);
    throw error; // Propagar o erro para o handler da API
  } finally {
    if (client) {
      await client.end(); // Liberar cliente
    }
  }
}

async function getC(r) {
  const result = await database.query({
    text: `SELECT * FROM "C" WHERE r = $1;`,
    values: [r],
  });
  return result;
}

async function getDec(r) {
  const result = await database.query({
    text: `SELECT * FROM "Dec" WHERE r = $1;`,
    values: [r],
  });
  return result;
}

async function getAnualC() {
  const result = await database.query({
    text: `SELECT * FROM "C"`,
  });
  return result;
}

async function getCByDec(letras) {
  const result = await database.query({
    text: `SELECT * FROM "C" WHERE dec = $1;`,
    values: [letras],
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

async function getSaidaP(letras) {
  const result = await database.query({
    text: `SELECT * FROM "SaidaP" WHERE dec = $1;`,
    values: [letras],
  });
  return result.rows;
}

async function getAnualSaidaP() {
  const result = await database.query({
    text: `SELECT * FROM "SaidaP"`,
  });
  return result;
}

async function getAnualSaidaO() {
  const result = await database.query({
    text: `SELECT * FROM "SaidaO"`,
  });
  return result;
}

async function getSaidaO(letras) {
  const result = await database.query({
    text: `SELECT * FROM "SaidaO" WHERE dec = $1;`,
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

async function getPapel(letras) {
  const result = await database.query({
    text: `SELECT * FROM "Papel" WHERE dec = $1;`,
    values: [letras],
  });
  return result.rows;
}

async function getPapelCalculadora(oficina) {
  const result = await database.query({
    text: `SELECT * FROM "Papel" WHERE item = $1;`,
    values: [oficina],
  });
  return result;
}

async function getValorOficinas(oficina) {
  const result = await database.query({
    text: `SELECT * FROM "SaidaO" WHERE oficina = $1;`,
    values: [oficina],
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
async function getCData(codigo, data, r, dec) {
  const result = await database.query({
    text: `SELECT EXISTS(SELECT 1 FROM "C" WHERE codigo = $1 AND data = $2 AND r = $3 AND dec = $4) AS exists;`,
    values: [codigo, data, r, dec],
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

async function getPapelC(r) {
  const result = await database.query({
    text: `SELECT * FROM "PapelC" WHERE r = $1;`,
    values: [r],
  });
  return result;
}

async function getAnualPapelC() {
  const result = await database.query({
    text: `SELECT * FROM "PapelC"`,
  });
  return result;
}

async function getNotas(r, colum) {
  const result = await database.query({
    text: `SELECT * FROM "Nota" WHERE r = $1 AND colum = $2 ORDER BY id DESC;;`,
    values: [r, colum],
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

async function getVerificador(r) {
  const result = await database.query({
    text: `SELECT * FROM "Deve" WHERE r = $1`,
    values: [r],
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

async function getDeve(r) {
  const result = await database.query({
    text: `SELECT * FROM "Deve" WHERE r = $1`,
    values: [r],
  });
  return result;
}
async function getDevo(r) {
  const result = await database.query({
    text: `SELECT * FROM "Devo" WHERE r = $1`,
    values: [r],
  });
  return result;
}

async function getRJustBSA(codigo, r) {
  const result = await database.query({
    text: `SELECT 
            dec,
            SUM(base) AS total_base,
            SUM(sis) AS total_sis,
            SUM(alt) AS total_alt,
            array_agg(id) AS ids
          FROM "RBSA" 
          WHERE r = $2 AND codigo = $1
          GROUP BY dec;`,
    values: [codigo, r],
  });
  return result.rows;
}

async function getDeveJustValor(codigo, r) {
  const result = await database.query({
    text: `SELECT
             array_agg(deveid) AS deveids,
             COALESCE(SUM(valor), 0) AS total_valor
          FROM "Deve"
           WHERE codigo = $1 AND r = $2;`,
    values: [codigo, r],
  });

  return result.rows[0];
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

async function getTemp() {
  const result = await database.query({
    text: `SELECT * FROM "Temp" ORDER BY data DESC;`,
  });
  return result;
}

async function getPagamentos(r) {
  const result = await database.query({
    text: `SELECT * FROM "Pagamentos" WHERE r = $1 ORDER BY data DESC;`,
    values: [r],
  });
  // The API handler will access result.rows
  return result;
}

async function getComentario(codigo) {
  const result = await database.query({
    // Seleciona todas as colunas da tabela "cadastro" onde o código corresponde.
    // Isso garante que 'codigo' e 'comentario' estejam disponíveis.
    text: `SELECT * FROM "cadastro" WHERE codigo = $1;`,
    values: [codigo],
  });
  // Retorna o array de linhas do resultado da query.
  return result.rows;
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

async function deleteNota(ids) {
  const result = await database.query({
    text: `DELETE FROM "Nota" WHERE id = $1 RETURNING *`,
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

async function deleteSaidaP(ids) {
  const result = await database.query({
    text: `DELETE FROM "SaidaP" WHERE id = $1 RETURNING *`,
    values: [ids],
  });
  return result;
}

async function deleteSaidaO(ids) {
  const result = await database.query({
    text: `DELETE FROM "SaidaO" WHERE id = $1 RETURNING *`,
    values: [ids],
  });
  return result;
}

async function deleteOficina(ids) {
  const result = await database.query({
    text: `DELETE FROM "Oficina" WHERE id = $1 RETURNING *`,
    values: [ids],
  });
  return result.rows;
}
async function deletePapel(ids) {
  const result = await database.query({
    text: `DELETE FROM "Papel" WHERE id = $1 RETURNING *`,
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

export async function deleteTemp(id) {
  const result = await database.query({
    text: `DELETE FROM "Temp" WHERE id = $1 RETURNING id;`,
    values: [id],
  });
  // Retorna o objeto de resultado da query, que inclui rows (com o id do item deletado se encontrado)
  return result;
}

async function deleteAllPagamentos() {
  const result = await database.query({
    text: `DELETE FROM "Pagamentos" RETURNING id;`, // Sem cláusula WHERE
  });
  // result will contain rowCount and potentially the deleted rows if RETURNING was used effectively
  return result;
}

const ordem = {
  createM,
  createPessoal,
  createSaidaP,
  createSaidaO,
  createOficina,
  createRBSA,
  createDevo,
  createDeve,
  createC,
  createNota,
  createPapel,
  createPapelC,
  createTemp,
  createPagamento,
  getTemp,
  getComentario,
  getPessoal,
  getSaidaP,
  getAnualSaidaP,
  getAnualSaidaO,
  getSaidaO,
  getOficina,
  getValorOficinas,
  getC,
  getDec,
  getAnualC,
  getNotas,
  getCByDec,
  getCData,
  getPapel,
  getPapelCalculadora,
  getPapelC,
  getAnualPapelC,
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
  getPagamentos,
  deleteC,
  deleteNota,
  deletePapel,
  deletePapelC,
  deletePessoal,
  deleteSaidaP,
  deleteSaidaO,
  deleteOficina,
  deleteM,
  deleteR,
  deleteDeve,
  deleteDevo,
  deleteTemp,
  deleteAllPagamentos,
  updateDeve,
  updateConfig,
  updateC,
  updateDec,
  updateNota,
  updateCBSA,
  updatePessoal,
  updateSaidaP,
  updateSaidaO,
  updateOficina,
  updatePapel,
  updatePapelC,
  updateAltSis,
  updateAltSisR,
  updateRCalculadora,
  updateBase,
  updateRButton,
};

export default ordem;
