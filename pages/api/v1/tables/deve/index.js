import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.post(postHandlerDeve);
router.get(getHandlerDeve);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandlerDeve(request, response) {
  const ordemInputValues = request.body;
  const newMOrdem = await ordem.createDeve(ordemInputValues);
  return response.status(201).json(newMOrdem);
}

async function getHandlerDeve(request, response) {
  const ordemGetValues = await ordem.getDeve();
  return response.status(200).json(ordemGetValues);
}

async function deleteHandler(request, response) {
  const { codigo } = request.body;
  const result = await ordem.deleteDeve(codigo);
  return response.status(200).json(result);
}
