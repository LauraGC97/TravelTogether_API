import express from 'express';
import imagesController from '../../controllers/images.controller.js';
import imagesMiddleware from '../../middlewares/images.middleware.js';
import { validateInteger } from '../../middlewares/validateInteger.middleware.js';

const router = express.Router();

router.post('/upload', imagesMiddleware.uploadSingle, imagesController.uploadImage);

router.get('/:id', validateInteger('id'), imagesController.getById);
router.get('/trips/:id', validateInteger('id'), imagesController.getByIdTrip);
router.get('/users/:id', validateInteger('id'), imagesController.getByIdUser);
router.delete('/:id', validateInteger('id'), imagesController.deleteImage);

export default router;