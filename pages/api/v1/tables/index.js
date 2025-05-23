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
        `Erro WebSocket (${response.status}) para tables/index: ${errorData}`,
      );
    } else {
      // console.log("Notificação WebSocket para tables/index enviada:", data);
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket para tables/index:", error);
  }
}

const router = createRouter();

router.get(getHandler);
router.post(postHandler);
router.delete(deleteHandler);
router.put(updateHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const { oficina, filterType } = request.query; // Adicionado filterType
  try {
    let valores;
    if (filterType === "base") {
      valores = await ordem.getMTableBase(oficina);
    } else {
      // Padrão para 'alt_sis' ou qualquer outro valor/ausência de filterType
      valores = await ordem.getMTableAltSis(oficina);
    }
    response.status(200).json(valores); // A resposta de getMTableAltSis/Base já é { rows: [...] } ou similar
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}

async function postHandler(request, response) {
  const ordemInputValues = request.body;
  const newMOrdem = await ordem.createM(ordemInputValues);

  if (newMOrdem?.rows?.length > 0) {
    await notifyWebSocketServer({
      type: "TABELAM_NEW_ITEM",
      payload: newMOrdem.rows[0], // Envia o item criado
    });
  }
  return response.status(201).json(newMOrdem);
}

async function deleteHandler(request, response) {
  const { id } = request.body;
  const idsToDelete = Array.isArray(id) ? id : [id];
  const result = await ordem.deleteM(idsToDelete); // deleteM retorna os rows deletados

  if (result && result.length > 0) {
    // result aqui é diretamente o array de rows deletados
    for (const deletedItem of result) {
      await notifyWebSocketServer({
        type: "TABELAM_DELETED_ITEM",
        payload: { id: deletedItem.id, oficina: deletedItem.oficina }, // Envia ID e oficina do item deletado
      });
    }
  }
  return response.status(200).json(result);
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  // Este handler é para updateAltSis, que atualiza observacao, dec, nome, sis, alt
  const result = await ordem.updateAltSis(updatedData);

  if (result?.rows?.length > 0) {
    await notifyWebSocketServer({
      type: "TABELAM_UPDATED_ITEM",
      payload: result.rows[0], // Envia o item atualizado
    });
  }
  return response.status(200).json(result);
}

// Se houver um endpoint específico para updateRButton (R1/R2/R3), ele também precisaria
// chamar notifyWebSocketServer com type: "TABELAM_UPDATED_ITEM" e o payload do Mtable atualizado.
