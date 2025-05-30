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
        `Erro WebSocket (${response.status}) para tables/c/papel: ${errorData}`,
      );
    } else {
      // console.log("Notificação WebSocket para tables/c/papel enviada:", data);
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket para tables/c/papel:", error);
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
  const newPapelCItemResult = await ordem.createPapelC(ordemInputValues);

  if (newPapelCItemResult?.rows?.length > 0) {
    await notifyWebSocketServer({
      type: "PAPELC_NEW_ITEM",
      payload: newPapelCItemResult.rows[0], // Assume que createPapelC retorna o item criado
    });
  }
  return response.status(201).json(newPapelCItemResult);
}

async function getHandler(request, response) {
  const { r } = request.query;
  const ordemGetValues = await ordem.getPapelC(r);
  return response.status(200).json(ordemGetValues);
}

async function deleteHandler(request, response) {
  const { id } = request.body;
  const deleteResult = await ordem.deletePapelC(id);

  // Envia a notificação de exclusão apenas com o ID.
  // O frontend Coluna-2.js será ajustado para lidar com isso.
  await notifyWebSocketServer({
    type: "PAPELC_DELETED_ITEM",
    payload: { id: id },
  });
  return response.status(200).json(deleteResult);
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const result = await ordem.updatePapelC(updatedData);

  if (result?.rows?.length > 0) {
    await notifyWebSocketServer({
      type: "PAPELC_UPDATED_ITEM",
      payload: result.rows[0], // Assume que updatePapelC retorna o item atualizado com 'r'
    });
  }
  return response.status(200).json(result);
}
