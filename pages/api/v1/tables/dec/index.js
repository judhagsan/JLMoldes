// /home/judhagsan/JLMoldes/pages/api/v1/tables/dec/index.js
// Nenhuma mudança necessária aqui, mas para referência:
import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js"; // Presumindo que 'ordem' exporta 'updateDec'

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
        `Erro WebSocket (${response.status}) para tables/dec: ${errorData}`,
      );
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket para tables/dec:", error);
  }
}

const router = createRouter();

router.get(getHandler);
router.put(updateHandler); // Este é o handler que estamos usando

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const { r } = request.query;
  // Supondo que ordem.getDec existe e funciona como esperado
  const result = await ordem.getDec(r); // ordem.getDec deve retornar { rows: [...] }
  return response.status(200).json(result.rows || []); // Envia apenas o array de linhas
}

async function updateHandler(request, response) {
  const updatedData = request.body; // Contém { on, r, dec }
  const result = await ordem.updateDec(updatedData); // updateDec usa on, r, dec

  if (result?.rows?.length > 0) {
    const updatedItem = result.rows[0]; // Linha completa com id, on, r, dec, sis, base, alt
    // A verificação de updatedItem.r ainda é válida para o WebSocket
    if (updatedItem.r !== undefined) {
      await notifyWebSocketServer({
        type: "DEC_UPDATED_ITEM",
        payload: updatedItem,
      });
    } else {
      // A mensagem de aviso pode ser ajustada se necessário
      console.warn(
        `Item Dec atualizado (id: ${updatedItem.id}, dec: ${updatedItem.dec}) não possui 'r' ou 'r' é undefined. A notificação WebSocket DEC_UPDATED_ITEM pode ter problemas. Payload:`,
        updatedItem,
      );
    }
  }
  return response.status(200).json(result.rows?.[0] || null); // Retorna o item atualizado ou null
}
