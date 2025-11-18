import express from 'express';
import ratingsController from '../../controllers/ratings.controller.js';

const router = express.Router();

router.get('/', ratingsController.getAllRatings);
router.get('/:id', ratingsController.getRatingById);
router.post('/', ratingsController.createRating);
router.put('/:id', ratingsController.updateRatingById);
router.delete('/:id', ratingsController.deleteRatingById);

export default router;