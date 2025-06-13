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
        `Erro WebSocket (${response.status}) para pagametos: ${errorData}`,
      );
    } else {
      // console.log("Notificação WebSocket para tables/c enviada:", data);
    }
  } catch (error) {
    console.error("Erro ao notificar WebSocket para pagamentos:", error);
  }
}

const router = createRouter();

router.get(getHandlerPagamentos);
router.post(postHandlerPagamentos);
router.delete(deleteHandlerPagamentos); // Added DELETE handler

export default router.handler(controller.errorHandlers);

async function getHandlerPagamentos(request, response) {
  const { r } = request.query;

  try {
    const pagamentosResult = await ordem.getPagamentos(r);
    response.status(200).json(pagamentosResult.rows || []);
  } catch (error) {
    console.error("Error in getHandlerPagamentos:", error);
    response.status(500).json({
      error: error.message || "An unexpected error occurred.",
    });
  }
}

async function deleteHandlerPagamentos(request, response) {
  const { r } = request.query;
  const { id } = request.body; // Check for ID in the body
  let deletionResult;
  let notificationType;
  let notificationPayload;

  try {
    if (id) {
      // Priority to deleting by specific ID
      deletionResult = await ordem.deletePagamentoById(id);
      if (deletionResult.rowCount > 0 && deletionResult.rows.length > 0) {
        const deletedItem = deletionResult.rows[0];
        notificationType = "PAGAMENTOS_DELETED_ITEM";
        notificationPayload = { id: deletedItem.id, r: deletedItem.r };
        response.status(200).json({
          message: `Pagamento com ID ${id} deletado com sucesso.`,
          deletedId: deletedItem.id,
        });
      } else {
        return response
          .status(404)
          .json({ error: `Pagamento com ID ${id} não encontrado.` });
      }
    } else if (typeof r !== "undefined" && r !== null && r !== "") {
      // Deletar pagamentos para um 'r' específico
      deletionResult = await ordem.deletePagamentosByR(r); // Assumes deletePagamentosByR is in models/tables.js
      notificationType = "PAGAMENTOS_R_CLEARED";
      notificationPayload = { r: r, count: deletionResult.rowCount };
      response.status(200).json({
        message: `Pagamentos para R${r} deletados com sucesso.`,
        count: deletionResult.rowCount,
      });
    } else {
      // Deletar TODOS os pagamentos da tabela
      deletionResult = await ordem.deleteAllPagamentos();
      notificationType = "PAGAMENTOS_TABLE_CLEARED";
      notificationPayload = { count: deletionResult.rowCount };
      response.status(200).json({
        message: `Todos os pagamentos foram deletados com sucesso.`,
        count: deletionResult.rowCount,
      });
    }

    // Notificar clientes WebSocket only if a notificationType was set
    if (notificationType) {
      await notifyWebSocketServer({
        type: notificationType,
        payload: notificationPayload,
      });
    }
  } catch (error) {
    let errorMessageContext = "Erro ao deletar pagamentos:";
    if (id) {
      errorMessageContext = `Erro ao deletar pagamento com ID ${id}:`;
    } else if (typeof r !== "undefined" && r !== null && r !== "") {
      errorMessageContext = `Erro ao deletar pagamentos para R${r}:`;
    }
    console.error(errorMessageContext, error);
    response.status(500).json({
      error:
        error.message || `Ocorreu um erro inesperado ao deletar os pagamentos.`,
    });
  }
}

async function postHandlerPagamentos(request, response) {
  try {
    // It's good practice to validate request.body here
    // For example, ensure required fields like 'nome', 'r', 'data', 'pix', 'real' are present.
    if (
      !request.body ||
      typeof request.body.r === "undefined" ||
      !request.body.data
    ) {
      return response
        .status(400)
        .json({ error: "Dados inválidos para criar pagamento." });
    }

    const createdPagamento = await ordem.createPagamento(request.body);

    // Assuming createPagamento returns the newly created row or an object with it
    if (
      createdPagamento &&
      createdPagamento.rows &&
      createdPagamento.rows.length > 0
    ) {
      const newPagamentoItem = createdPagamento.rows[0];
      // Notify WebSocket clients
      await notifyWebSocketServer({
        type: "PAGAMENTOS_NEW_ITEM",
        payload: newPagamentoItem,
      });
      response.status(201).json(newPagamentoItem);
    } else {
      // Should ideally check rowCount or similar from the result object
      response
        .status(500)
        .json({ error: "Falha ao criar pagamento, nenhum dado retornado." });
    }
  } catch (error) {
    console.error("Error in postHandlerPagamentos:", error);
    response.status(500).json({
      error:
        error.message || "Ocorreu um erro inesperado ao criar o pagamento.",
    });
  }
}
