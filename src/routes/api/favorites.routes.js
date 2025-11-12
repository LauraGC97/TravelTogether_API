import { Router } from 'express';
import { getFavoritesById } from '../../controllers/favorites.controllers.js';


const router = Router();

router.get('/', getFavoritesById);
router.get('/:idFavorites', getFavoritesById);
router.put('/:idFavorites', getFavoritesById);
router.delete('/:idFavorites', getFavoritesById);

export default router;