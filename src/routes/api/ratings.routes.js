import express from 'express';
import ratingsController from '../../controllers/ratings.controller.js';
import { validateInteger } from '../../middlewares/validateInteger.middleware.js';

const router = express.Router();

router.get('/', ratingsController.getAllRatings);
router.get('/:id', validateInteger('id'), ratingsController.getRatingById);
router.get('/trip/:id', validateInteger('id'), ratingsController.getRatingsByTrip);
router.get('/author/:id', validateInteger('id'), ratingsController.getRatingsByAuthor);
router.get('/rated_user/:id', validateInteger('id'), ratingsController.getRatingsByRatedUser);
router.get('/score/:id', validateInteger('id'), ratingsController.getRatingScoreByRatedUser);

router.post('/', ratingsController.createRating);
router.put('/:id', validateInteger('id'), ratingsController.updateRatingById);
router.delete('/:id', validateInteger('id'), ratingsController.deleteRatingById);

export default router;