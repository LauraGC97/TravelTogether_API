import express from 'express';
import imagesController from '../../controllers/images.controller.js';
import imagesMiddleware from '../../middlewares/images.middleware.js';

const router = express.Router();

router.post('/upload', imagesMiddleware.uploadSingle, imagesController.uploadImage);
router.get('/:id', imagesController.getById);
router.get('/trips/:id', imagesController.getByIdTrip);
router.get('/users/:id', imagesController.getByIdUser);
router.delete('/:id', imagesController.deleteImage);

export default router;