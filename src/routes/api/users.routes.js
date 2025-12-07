import express, { Router } from 'express';
import { register, login, getAllUsers, getUserById, updateUser, deleteUser } from '../../controllers/users.controllers.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { validateEmail } from '../../middlewares/validateEmail.middleware.js';
import { validateInteger } from '../../middlewares/validateInteger.middleware.js';

const router = Router();

router.post('/register', validateEmail, register);
router.post('/login', validateEmail, login);

router.get('/', getAllUsers);
router.get('/:idUser', validateInteger('idUser'), getUserById);
router.put('/:idUser', validateInteger('idUser'), verifyToken, updateUser);
router.delete('/:idUser', validateInteger('idUser'), verifyToken, deleteUser);

export default router;