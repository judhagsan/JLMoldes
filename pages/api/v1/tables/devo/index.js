import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.post(postHandlerDevo);
router.get(getHandlerDevo);

export default router.handler(controller.errorHandlers);

async function postHandlerDevo(request, response) {
  const ordemInputValues = request.body;
  const newMOrdem = await ordem.createDevo(ordemInputValues);
  return response.status(201).json(newMOrdem);
}

async function getHandlerDevo(request, response) {
  const ordemGetValues = await ordem.getDevo();
  return response.status(200).json(ordemGetValues);
}
