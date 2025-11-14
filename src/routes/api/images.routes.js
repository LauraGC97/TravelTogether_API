import express from 'express';
import imagesController from '../../controllers/images.controller.js';
import { uploadSingle } from '../../middlewares/images.middleware.js';

const router = express.Router();

router.post('/upload', uploadSingle, imagesController.uploadImage);
router.get('/:id', imagesController.getById);

export default router;