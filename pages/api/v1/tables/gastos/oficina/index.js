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
        `Erro ao notificar servidor WebSocket (${response.status}) para OFICINA: ${errorData}`,
      );
    } else {
      console.log("Notificação OFICINA enviada ao servidor WebSocket:", data);
    }
  } catch (error) {
    console.error(
      "Falha ao conectar/notificar servidor WebSocket para OFICINA:",
      error,
    );
  }
}

async function postHandler(request, response) {
  const ordemInputValues = request.body;
  const newOficinaResult = await ordem.createOficina(ordemInputValues);

  // Assumindo que newOficinaResult.rows[0] contém o item criado, similar ao endpoint de cadastro
  if (
    newOficinaResult &&
    newOficinaResult.rows &&
    newOficinaResult.rows.length > 0
  ) {
    const newItem = newOficinaResult.rows[0];
    await notifyWebSocketServer({ type: "OFICINA_NEW_ITEM", payload: newItem });
  }
  return response
    .status(201)
    .json(
      newOficinaResult && newOficinaResult.rows ? newOficinaResult.rows[0] : {},
    );
}

async function getHandler(request, response) {
  const { letras } = request.query;
  try {
    const valores = await ordem.getOficina(letras);
    response.status(200).json({ rows: valores });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}

async function deleteHandler(request, response) {
  const { id } = request.body;
  const deletedRows = await ordem.deleteOficina(id);
  console.log("Linhas deletadas:", deletedRows);

  // verifica se há ao menos 1 elemento no array
  if (deletedRows && deletedRows.length > 0) {
    await notifyWebSocketServer({
      type: "OFICINA_DELETED_ITEM",
      payload: { id },
    });
  }
  return response.status(200).json({ deleted: deletedRows });
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const updateResult = await ordem.updateOficina(updatedData);

  // Assumindo que updateResult.rows[0] contém o item atualizado, similar ao endpoint de cadastro
  if (updateResult && updateResult.rows && updateResult.rows.length > 0) {
    const updatedItem = updateResult.rows[0];
    await notifyWebSocketServer({
      type: "OFICINA_UPDATED_ITEM",
      payload: updatedItem,
    });
  }
  return response
    .status(200)
    .json(updateResult && updateResult.rows ? updateResult.rows[0] : {});
}
