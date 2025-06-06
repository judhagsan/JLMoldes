import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.get(getHandlerDeveJustValor);

export default router.handler(controller.errorHandlers);

async function getHandlerDeveJustValor(request, response) {
  const { codigo, r } = request.query;
  try {
    const valores = await ordem.getDeveJustValor(codigo, r);
    response.status(200).json(valores);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
