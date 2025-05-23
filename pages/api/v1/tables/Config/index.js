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
      console.error(`Erro WebSocket (${response.status}): ${errorData}`);
    } else {
      console.log("Notificação WebSocket para Config enviada:", data);
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket:", error);
  }
}

const router = createRouter();

router.get(getHandler);
router.put(updateHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const ordemGetValues = await ordem.getConfig();
  return response.status(200).json(ordemGetValues);
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const result = await ordem.updateConfig(updatedData);

  // Notify WebSocket clients about the update
  if (result?.rows?.length > 0) {
    await notifyWebSocketServer({
      type: "CONFIG_UPDATED_ITEM",
      payload: result.rows[0], // Assuming updateConfig returns the updated row
    });
  }
  return response.status(200).json(result);
}
