import { Router } from 'express';

import {
    getFavoritesById,
    getFavoritesByUserId,
    getFavoritesByTripId,
    getAllFavorites,
    createFavorites,
    updateFavoritesById,
    deleteFavoritesById
} from '../../controllers/favorites.controller.js';

import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getAllFavorites);
router.get('/:idFavorites', getFavoritesById);
router.get('/user/:id', getFavoritesByUserId);
router.get('/trip/:id', getFavoritesByTripId);
router.post('/', verifyToken, createFavorites);
router.put('/:idFavorites', updateFavoritesById);
router.delete('/:idFavorites', deleteFavoritesById);

export default router;