import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.get(getVerificadorHandler);

export default router.handler(controller.errorHandlers);

async function getVerificadorHandler(request, response) {
  const { r } = request.query;
  const ordemGetValues = await ordem.getVerificador(r);
  return response.status(200).json(ordemGetValues);
}
