import { Router } from 'express';
import { getFavoritesById, getAllFavorites,createFavorites,updateFavoritesById,deleteFavoritesById } from '../../controllers/favorites.controllers.js';

const router = Router();

router.get('/', getAllFavorites);
router.get('/:idFavorites', getFavoritesById);
router.post('/',createFavorites);
router.put('/:idFavorites', updateFavoritesById);
router.delete('/:idFavorites', deleteFavoritesById);

export default router;