import { Router } from "express";
import {
  getAllContactsController,
  getContactByIdController,
  createContactController,
  deleteContactController,
  patchContactController,
} from "../controllers/contacts.js";
import ctrlWrapper from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../validation/contacts.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

// Підключаємо middleware автентифікації до всіх роутів
router.use(authenticate);

router.get("/", ctrlWrapper(getAllContactsController));

router.get("/:contactId", isValidId, ctrlWrapper(getContactByIdController));

router.post("/", validateBody(createContactSchema), ctrlWrapper(createContactController));

router.patch(
  "/:contactId",
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController)
);

router.delete("/:contactId", isValidId, ctrlWrapper(deleteContactController));

export default router;
