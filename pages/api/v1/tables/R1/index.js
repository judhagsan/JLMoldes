import { createRouter } from "next-connect";
import controller from "infra/controller";
import ordem from "models/tables.js";

const router = createRouter();

router.post(postHandlerR1BSA);
router.get(getHandlerR1BSA);
router.delete(deleteHandler);
router.put(updateHandler);

export default router.handler(controller.errorHandlers);

async function postHandlerR1BSA(request, response) {
  const ordemInputValues = request.body;
  const newMOrdem = await ordem.createR1BSA(ordemInputValues);
  return response.status(201).json(newMOrdem);
}

async function getHandlerR1BSA(request, response) {
  const ordemGetValues = await ordem.getR1BSA();
  return response.status(200).json(ordemGetValues);
}

async function deleteHandler(request, response) {
  const { id } = request.body;
  const idsToDelete = Array.isArray(id) ? id : [id];
  const result = await ordem.deleteR1(idsToDelete);
  return response.status(200).json(result);
}

async function updateHandler(request, response) {
  const updatedData = request.body;
  const result = await ordem.updateAltSisR1(updatedData);
  return response.status(200).json(result);
}
