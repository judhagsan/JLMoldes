import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

async function notifyWebSocketServer(data) {
  // Descomente se este endpoint precisar notificar
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
        `Erro WebSocket (${response.status}) para tables/deve: ${errorData}`,
      );
    } else {
      // console.log("Notificação WebSocket para tables/deve enviada:", data);
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket para tables/deve:", error);
  }
}

const router = createRouter();

router.post(postHandlerDeve);
router.get(getHandlerDeve);
router.delete(deleteHandler);
router.put(updateHandler);

export default router.handler(controller.errorHandlers);

async function postHandlerDeve(request, response) {
  const ordemInputValues = request.body;
  const newDeveItemResult = await ordem.createDeve(ordemInputValues);

  if (newDeveItemResult?.rows?.length > 0) {
    await notifyWebSocketServer({
      type: "DEVE_NEW_ITEM",
      payload: newDeveItemResult.rows[0], // Assume que createDeve retorna o item criado
    });
  }
  return response.status(201).json(newDeveItemResult);
}

async function getHandlerDeve(request, response) {
  const { r } = request.query;
  const ordemGetValues = await ordem.getDeve(r);
  return response.status(200).json(ordemGetValues);
}

async function deleteHandler(request, response) {
  const { codigo } = request.body;
  const result = await ordem.deleteDeve(codigo);

  // Notifica sobre a exclusão usando o código
  await notifyWebSocketServer({
    type: "DEVE_DELETED_ITEM",
    payload: { codigo: codigo }, // Envia o código do item deletado
  });

  return response.status(200).json(result);
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const result = await ordem.updateDeve(updatedData);
  return response.status(200).json(result);
}
