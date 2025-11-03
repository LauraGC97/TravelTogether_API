import { Router } from 'express';

const router = Router();

import { register, login } from '../../controllers/users.controllers.js';

router.post('/register', register);
router.post('/login', login);

export default router;