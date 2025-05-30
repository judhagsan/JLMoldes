import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

async function notifyWebSocketServer(data) {
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
        `Erro WebSocket (${response.status}) para tables/devo: ${errorData}`,
      );
    } else {
      // console.log("Notificação WebSocket para tables/devo enviada:", data);
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket para tables/devo:", error);
  }
}

const router = createRouter();

router.post(postHandlerDevo);
router.get(getHandlerDevo);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandlerDevo(request, response) {
  const ordemInputValues = request.body;
  const newDevoItemResult = await ordem.createDevo(ordemInputValues);

  if (newDevoItemResult?.rows?.length > 0) {
    await notifyWebSocketServer({
      type: "DEVO_NEW_ITEM",
      payload: newDevoItemResult.rows[0], // Assume que createDevo retorna o item criado
    });
  }
  return response.status(201).json(newDevoItemResult);
}

async function getHandlerDevo(request, response) {
  const { r } = request.query;
  const ordemGetValues = await ordem.getDevo(r);
  return response.status(200).json(ordemGetValues);
}

async function deleteHandler(request, response) {
  const { codigo } = request.body;
  const result = await ordem.deleteDevo(codigo);

  // Notifica sobre a exclusão usando o código
  await notifyWebSocketServer({
    type: "DEVO_DELETED_ITEM",
    payload: { codigo: codigo }, // Envia o código do item deletado
  });

  return response.status(200).json(result);
}
