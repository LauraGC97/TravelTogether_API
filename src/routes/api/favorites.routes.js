import { Router } from 'express';
import { getFavoritesById, getAllFavorites,createFavorites,updateFavoritesById,deleteFavoritesById } from '../../controllers/favorites.controllers.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getAllFavorites);
router.get('/:idFavorites', getFavoritesById);
router.post('/', verifyToken, createFavorites);
router.put('/', updateFavoritesById);
router.delete('/', deleteFavoritesById);

export default router;