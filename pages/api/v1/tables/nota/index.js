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
        `Erro WebSocket (${response.status}) para tables/nota: ${errorData}`,
      );
    } else {
      // console.log("Notificação WebSocket para tables/nota enviada:", data);
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket para tables/nota:", error);
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
  const newNotaResult = await ordem.createNota(ordemInputValues);

  // Assumindo que createNota retorna o item criado com id, texto, r, colum
  if (newNotaResult?.rows?.length > 0) {
    const newNote = newNotaResult.rows[0];
    // Garante que o payload inclui r e colum para o frontend filtrar
    if (newNote.r !== undefined && newNote.colum !== undefined) {
      await notifyWebSocketServer({
        type: "NOTA_NEW_ITEM",
        payload: newNote,
      });
    } else {
      console.warn(
        `Nota criada (id: ${newNote.id}) não possui 'r' ou 'colum'. Notificação WebSocket incompleta.`,
      );
    }
  }
  return response.status(201).json(newNotaResult);
}

async function getHandler(request, response) {
  const { r, colum } = request.query;
  const result = await ordem.getNotas(r, colum);
  return response.status(200).json(result);
}

async function deleteHandler(request, response) {
  const { id } = request.body;

  const deleteResult = await ordem.deleteNota(id);

  await notifyWebSocketServer({
    type: "NOTA_DELETED_ITEM",
    payload: { id: id },
  });
  console.warn(
    `Item Nota com id ${id} foi deletado. Notificação WebSocket 'NOTA_DELETED_ITEM' enviada apenas com ID. O frontend EditorNotes.js pode precisar de ajustes para filtrar esta mensagem corretamente.`,
  );

  return response.status(200).json(deleteResult);
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const result = await ordem.updateNota(updatedData);
  // Assumindo que updateNota retorna o item atualizado com id, texto, r, colum
  if (result?.rows?.length > 0) {
    const updatedNote = result.rows[0];
    // Garante que o payload inclui r e colum para o frontend filtrar
    if (updatedNote.r !== undefined && updatedNote.colum !== undefined) {
      await notifyWebSocketServer({
        type: "NOTA_UPDATED_ITEM",
        payload: updatedNote,
      });
    } else {
      console.warn(
        `Nota atualizada (id: ${updatedNote.id}) não possui 'r' ou 'colum'. Notificação WebSocket incompleta.`,
      );
    }
  }
  return response.status(200).json(result);
}
