import { Router } from 'express';
import pool from '../config/db.js';

import apiTripsRoutes from './api/trips.routes.js';
import apiUserRoutes from './api/users.routes.js';
import apiImagesRoutes from './api/images.routes.js';
import apiRatingsRoutes from './api/ratings.routes.js';
import apiNotificationsRoutes from './api/notifications.routes.js';

const router = Router();

// Endpoint de estado
router.get('/status', async (req, res) => {

    let dbStatus = 'UNKNOWN';

    try {
        const connection = await pool.getConnection();
        await connection.ping();
        dbStatus = 'OK';
        connection.release();
    } catch (error) {
        dbStatus = 'ERROR';
    }

    res.json({
        service: 'TravelTogether_API',
        status: 'OK',
        database: dbStatus,
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime().toFixed(0) + 's',
    });
});

router.use('/trips', apiTripsRoutes);
router.use('/users', apiUserRoutes);
router.use('/images', apiImagesRoutes);
router.use('/ratings', apiRatingsRoutes);
router.use('/notifications', apiNotificationsRoutes);

export default router;
