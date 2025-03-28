import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.get(getHandlerDevoJustValor);

export default router.handler(controller.errorHandlers);

async function getHandlerDevoJustValor(request, response) {
  const { codigo } = request.query;
  try {
    const valores = await ordem.getDevoJustValor(codigo);
    response.status(200).json(valores);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
