import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.get(getBaseHandler);
router.put(updateHandler);

export default router.handler(controller.errorHandlers);

async function getBaseHandler(request, response) {
  const ordemGetValues = await ordem.getM1TableBase();
  return response.status(200).json(ordemGetValues);
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const result = await ordem.updateBase(updatedData);
  return response.status(200).json(result);
}
