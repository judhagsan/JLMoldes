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
        `Erro WebSocket (${response.status}) para tables/temp: ${errorData}`,
      );
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket para tables/temp:", error);
  }
}

const router = createRouter();

router.get(getHandler);
router.post(postHandler);
router.delete(deleteHandler);

async function getHandler(request, response) {
  const tempEntries = await ordem.getTemp();
  if (tempEntries) {
    return response.status(200).json(tempEntries);
  }
  return response.status(404).json({ message: "Nenhum dado encontrado." });
}

async function postHandler(request, response) {
  const tempData = request.body;
  const createdTempEntry = await ordem.createTemp(tempData);
  // Check if createdTempEntry is a valid object (e.g., has an id)
  if (createdTempEntry && createdTempEntry.id) {
    await notifyWebSocketServer({
      type: "TEMP_NEW_ITEM",
      payload: createdTempEntry, // Send the created item object directly
    });
  }
  return response.status(201).json(createdTempEntry);
}
async function deleteHandler(request, response) {
  const { id } = request.body;

  const deleteResult = await ordem.deleteTemp(id);

  if (deleteResult && deleteResult.rows && deleteResult.rows.length > 0) {
    const deletedId = deleteResult.rows[0].id;
    await notifyWebSocketServer({
      type: "TEMP_DELETED_ITEM",
      payload: { id: deletedId },
    });
    return response.status(200).json(deletedId);
  }
}

export default router.handler(controller.errorHandlers);
