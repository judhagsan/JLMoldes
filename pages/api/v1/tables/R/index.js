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
        `Erro WebSocket (${response.status}) para tables/R: ${errorData}`,
      );
    } else {
      // console.log("Notificação WebSocket para tables/R enviada:", data);
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket para tables/R:", error);
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
  const newMOrdem = await ordem.createRBSA(ordemInputValues);

  if (newMOrdem?.rows?.length > 0) {
    await notifyWebSocketServer({
      type: "BSA_NEW_ITEM",
      payload: newMOrdem.rows[0], // Assume que createRBSA retorna o item criado
    });
  }

  return response.status(201).json(newMOrdem); // Retorna o resultado da criação
}

async function getHandler(request, response) {
  const { r } = request.query;
  try {
    const valores = await ordem.getRBSA(r);
    response.status(200).json(valores);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}

async function deleteHandler(request, response) {
  const { id } = request.body;
  const idsToDelete = Array.isArray(id) ? id : [id];

  const deleteResult = await ordem.deleteR(idsToDelete);

  for (const deletedId of idsToDelete) {
    await notifyWebSocketServer({
      type: "BSA_DELETED_ITEM",
      payload: { id: deletedId }, // Cliente BSATable filtrará por ID
    });
  }

  return response.status(200).json(deleteResult);
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const updatedRItemResult = await ordem.updateAltSisR(updatedData);

  if (updatedRItemResult?.rows?.length > 0) {
    const rItem = updatedRItemResult.rows[0];
    // Notifica sobre a atualização do item na tabela R (para BSATable)
    await notifyWebSocketServer({ type: "BSA_UPDATED_ITEM", payload: rItem });

    // Mantém a notificação existente para TabelaM se um id_mtable estiver envolvido
    if (updatedData.id_mtable) {
      const mtableItem = await ordem.getMTableById(updatedData.id_mtable);
      if (mtableItem?.rows?.length > 0) {
        await notifyWebSocketServer({
          type: "TABELAM_UPDATED_ITEM",
          payload: mtableItem.rows[0],
        });
      }
    }
  }
  return response.status(200).json(updatedRItemResult);
}
