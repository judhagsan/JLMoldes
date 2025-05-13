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
      console.error(`Erro WebSocket (${response.status}): ${errorData}`);
    } else {
      console.log("Notificação WebSocket enviada:", data);
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket:", error);
  }
}

async function postHandler(req, res) {
  const input = req.body;
  const result = await ordem.createSaidaP(input);

  if (result?.rows?.length > 0) {
    const newItem = result.rows[0];
    await notifyWebSocketServer({
      type: "SAIDAS_PESSOAL_NEW_ITEM",
      payload: newItem,
    });
    return res.status(201).json(newItem);
  }

  res.status(400).json({ error: "Falha ao criar item" });
}

async function getHandler(req, res) {
  const { letras } = req.query;
  try {
    const rows = await ordem.getSaidaP(letras);
    res.status(200).json({ rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteHandler(req, res) {
  const { id } = req.body;
  const result = await ordem.deleteSaidaP(id);

  if (result?.rows?.length > 0) {
    const deleted = result.rows[0];
    await notifyWebSocketServer({
      type: "SAIDAS_PESSOAL_DELETED_ITEM",
      payload: deleted,
    });
    return res.status(200).json(deleted);
  }

  res.status(400).json({ error: "Falha ao DELETAR" });
}

async function updateHandler(req, res) {
  const input = req.body;
  const result = await ordem.updateSaidaP(input);

  if (result?.rows?.length > 0) {
    const updated = result.rows[0];
    await notifyWebSocketServer({
      type: "SAIDAS_PESSOAL_UPDATED_ITEM",
      payload: updated,
    });
    return res.status(200).json(updated);
  }

  res.status(400).json({ error: "Falha ao atualizar" });
}
