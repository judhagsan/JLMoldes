import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.post(postHandler);
router.get(getHandler);
router.delete(deleteHandler);
router.put(updateHandler);

export default router.handler(controller.errorHandlers);

async function notifyWebSocketServer(data) {
  // Assume que WS_PORT é a porta base do servidor WebSocket, e o endpoint de broadcast está em WS_PORT + 1
  const wsNotifyUrl = `https://${process.env.RAILWAY_WB}/broadcast`;
  try {
    const response = await fetch(wsNotifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `Erro ao notificar servidor WebSocket (${response.status}) para PAPEL: ${errorData}`,
      );
    } else {
      console.log("Notificação Papel enviada ao servidor WebSocket:", data);
    }
  } catch (error) {
    console.error(
      "Falha ao conectar/notificar servidor WebSocket para Papel:",
      error,
    );
  }
}

async function postHandler(request, response) {
  const ordemInputValues = request.body;
  const newPapelResult = await ordem.createPapel(ordemInputValues);

  if (newPapelResult && newPapelResult.rows && newPapelResult.rows.length > 0) {
    const newItem = newPapelResult.rows[0];
    await notifyWebSocketServer({ type: "PAPEL_NEW_ITEM", payload: newItem });
  }
  return response
    .status(201)
    .json(newPapelResult && newPapelResult.rows ? newPapelResult.rows[0] : {});
}

async function getHandler(request, response) {
  const { letras } = request.query;
  try {
    const valores = await ordem.getPapel(letras);
    response.status(200).json({ rows: valores });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}

async function deleteHandler(request, response) {
  const { id } = request.body;
  const deletedRows = await ordem.deletePapel(id);
  console.log("Linhas deletadas:", deletedRows);

  // verifica se há ao menos 1 elemento no array
  if (deletedRows && deletedRows.length > 0) {
    await notifyWebSocketServer({
      type: "PAPEL_DELETED_ITEM",
      payload: { id },
    });
  }
  return response.status(200).json({ deleted: deletedRows });
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const updateResult = await ordem.updatePapel(updatedData);

  // Assumindo que updateResult.rows[0] contém o item atualizado, similar ao endpoint de cadastro
  if (updateResult && updateResult.rows && updateResult.rows.length > 0) {
    const updatedItem = updateResult.rows[0];
    await notifyWebSocketServer({
      type: "PAPEL_UPDATED_ITEM",
      payload: updatedItem,
    });
  }
  return response
    .status(200)
    .json(updateResult && updateResult.rows ? updateResult.rows[0] : {});
}
