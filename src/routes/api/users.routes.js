import { Router } from 'express';
import { register, login, getAllUsers, getUserById, updateUser, deleteUser } from '../../controllers/users.controllers.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/', verifyToken, getAllUsers);
router.get('/:idUser', verifyToken, getUserById);
router.put('/:idUser', verifyToken, updateUser);
router.delete('/:idUser', verifyToken, deleteUser);

export default router;