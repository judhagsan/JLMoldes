import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.get(getHandler);
router.put(updateHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const { oficina } = request.query;
  try {
    const valores = await await ordem.getMTableBase(oficina);
    response.status(200).json(valores);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const result = await ordem.updateBase(updatedData);
  return response.status(200).json(result);
}
