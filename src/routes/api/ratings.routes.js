import express from 'express';
import imagesController from '../../controllers/images.controller.js';
import imagesMiddleware from '../../middlewares/images.middleware.js';

const router = express.Router();

router.get('/', imagesController.getById);
router.get('/:id', imagesController.getById);
router.post('/', imagesController.getByIdTrip);
router.put('/:id', imagesController.getById);
router.delete('/:id', imagesController.deleteImage);

export default router;