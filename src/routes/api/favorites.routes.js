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
import { validateInteger } from '../../middlewares/validateInteger.middleware.js';

const router = Router();

router.get('/', getAllFavorites);
router.get('/:idFavorites', validateInteger('idFavorites'), getFavoritesById);
router.get('/user/:idFavorites', validateInteger('idFavorites'), getFavoritesByUserId);
router.get('/trip/:idFavorites', validateInteger('idFavorites'), getFavoritesByTripId);
router.post('/', verifyToken, createFavorites);
router.put('/:idFavorites', validateInteger('idFavorites'), updateFavoritesById);
router.delete('/:idFavorites', validateInteger('idFavorites'), deleteFavoritesById);

export default router;