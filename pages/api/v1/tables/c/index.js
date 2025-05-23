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
        `Erro WebSocket (${response.status}) para tables/c: ${errorData}`,
      );
    } else {
      // console.log("Notificação WebSocket para tables/c enviada:", data);
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket para tables/c:", error);
  }
}

const router = createRouter();

router.post(postHandler);
router.get(getHandler);
router.delete(deleteHandler);
router.put(updateHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const ordemInputValues = request.body;
  const newCItemResult = await ordem.createC(ordemInputValues);

  if (newCItemResult?.rows?.length > 0) {
    await notifyWebSocketServer({
      type: "C_NEW_ITEM",
      payload: newCItemResult.rows[0], // Assume que createC retorna o item criado
    });
  }
  return response.status(201).json(newCItemResult);
}

async function getHandler(request, response) {
  const { r } = request.query;
  const result = await ordem.getC(r);
  return response.status(200).json(result);
}

async function deleteHandler(request, response) {
  const { id } = request.body;
  const result = await ordem.deleteC(id);

  await notifyWebSocketServer({
    type: "C_DELETED_ITEM",
    payload: { id: id }, // Envia o ID do item deletado
  });
  return response.status(200).json(result);
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const result = await ordem.updateC(updatedData);

  if (result?.rows?.length > 0) {
    const updatedItem = result.rows[0];
    // Coluna-1.js espera 'r' no payload para C_UPDATED_ITEM
    if (updatedItem.r !== undefined) {
      await notifyWebSocketServer({
        type: "C_UPDATED_ITEM",
        payload: updatedItem,
      });
    } else {
      console.warn(
        `Item C atualizado (id: ${updatedItem.id}) não possui 'r'. A notificação WebSocket C_UPDATED_ITEM pode não ser processada corretamente por Coluna-1.js.`,
      );
      // Opcionalmente, você pode decidir enviar a notificação mesmo sem 'r' se outros componentes puderem usá-la
      // await notifyWebSocketServer({ type: "C_UPDATED_ITEM", payload: updatedItem });
    }
  }
  return response.status(200).json(result);
}
