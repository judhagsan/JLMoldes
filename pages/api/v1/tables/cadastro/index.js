import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/cadastro";

const router = createRouter();

router.post(postHandler);
router.get(getHandler);
router.delete(deleteHandler);
router.put(updateHandler);

export default router.handler(controller.errorHandlers);

async function notifyWebSocketServer(data) {
  const wsHttpPort = parseInt(process.env.WS_PORT || "8080") + 1;
  const wsNotifyUrl = `http://localhost:${wsHttpPort}/broadcast`;
  try {
    const response = await fetch(wsNotifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `Erro ao notificar servidor WebSocket (${response.status}) para CADASTRO: ${errorData}`,
      );
    } else {
      console.log("Notificação CADASTRO enviada ao servidor WebSocket:", data);
    }
  } catch (error) {
    console.error(
      "Falha ao conectar/notificar servidor WebSocket para CADASTRO:",
      error,
    );
  }
}

async function postHandler(request, response) {
  const ordemInputValues = request.body;
  const newMOrdemResult = await ordem.createCad(ordemInputValues);

  if (
    newMOrdemResult &&
    newMOrdemResult.rows &&
    newMOrdemResult.rows.length > 0
  ) {
    const newItem = newMOrdemResult.rows[0];
    await notifyWebSocketServer({
      type: "CADASTRO_NEW_ITEM",
      payload: newItem,
    });
  }

  return response
    .status(201)
    .json(
      newMOrdemResult && newMOrdemResult.rows ? newMOrdemResult.rows[0] : {},
    );
}

async function getHandler(request, response) {
  try {
    const ordemGetValues = await ordem.getCad();
    response.status(200).json({ rows: ordemGetValues });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}

async function deleteHandler(request, response) {
  const { id } = request.body;
  const result = await ordem.deleteCad(id);
  console.log("Linhas deletadas:", result);

  if (result && result.length > 0) {
    await notifyWebSocketServer({
      type: "CADASTRO_DELETED_ITEM",
      payload: { id },
    });
  }
  return response.status(200).json({ deleted: result });
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const updateResult = await ordem.updateCad(updatedData);

  if (updateResult && updateResult.rows && updateResult.rows.length > 0) {
    const updatedItem = updateResult.rows[0];
    await notifyWebSocketServer({
      type: "CADASTRO_UPDATED_ITEM",
      payload: updatedItem,
    });
  }

  return response
    .status(200)
    .json(updateResult && updateResult.rows ? updateResult.rows[0] : {});
}
