import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const { oficina } = request.query;
  try {
    const result = await ordem.getPapelCalculadora(oficina);
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
