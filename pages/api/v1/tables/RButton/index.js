import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.put(updateHandler);

export default router.handler(controller.errorHandlers);

async function updateHandler(request, response) {
  const updatedData = request.body;
  const result = await ordem.updateRButton(updatedData);
  return response.status(200).json(result);
}
