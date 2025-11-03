import { Router } from 'express';

// import apiTravelsRoutes from './api/travels.routes.js';
import apiUserRoutes from './api/users.routes.js';

const router = Router();

// router.use('/travels', apiTravelsRoutes);
router.use('/users', apiUserRoutes);

export default router;
