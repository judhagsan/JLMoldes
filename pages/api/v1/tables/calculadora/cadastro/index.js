import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.get(getHandler);
export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const { codigo } = request.query;
  try {
    const valores = await ordem.getComentario(codigo);
    response.status(200).json({ rows: valores });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
