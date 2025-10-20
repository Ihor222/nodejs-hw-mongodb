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
import { upload } from "../middlewares/upload.js"; // multer middleware
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const router = Router();

// Підключаємо middleware автентифікації до всіх роутів
router.use(authenticate);

router.get("/", ctrlWrapper(getAllContactsController));

router.get("/:contactId", isValidId, ctrlWrapper(getContactByIdController));

// Створення контакту з можливістю завантажити фото
router.post(
  "/",
  upload.single("photo"), // multer обробляє multipart/form-data
  validateBody(createContactSchema),
  ctrlWrapper(async (req, res) => {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      req.body.photo = result.secure_url;
    }
    return createContactController(req, res);
  })
);

// Оновлення контакту з можливістю завантажити фото
router.patch(
  "/:contactId",
  isValidId,
  upload.single("photo"),
  validateBody(updateContactSchema),
  ctrlWrapper(async (req, res) => {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      req.body.photo = result.secure_url;
    }
    return patchContactController(req, res);
  })
);

router.delete("/:contactId", isValidId, ctrlWrapper(deleteContactController));

export default router;
