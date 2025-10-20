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
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js"; // <--- додано для роботи з photo

const router = Router();

// Підключаємо middleware автентифікації до всіх роутів
router.use(authenticate);

router.get("/", ctrlWrapper(getAllContactsController));

router.get("/:contactId", isValidId, ctrlWrapper(getContactByIdController));

// Створення контакту з можливістю завантажити фото
router.post(
  "/",
  uploadToCloudinary.single("photo"), // <--- підтримка multipart/form-data
  validateBody(createContactSchema),
  ctrlWrapper(createContactController)
);

// Оновлення контакту з можливістю завантажити фото
router.patch(
  "/:contactId",
  isValidId,
  uploadToCloudinary.single("photo"), // <--- підтримка multipart/form-data
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController)
);

router.delete("/:contactId", isValidId, ctrlWrapper(deleteContactController));

export default router;
