import { Router } from 'express';
import pool from '../config/db.js';

// import apiTravelsRoutes from './api/travels.routes.js';
import apiUserRoutes from './api/users.routes.js';

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

// router.use('/travels', apiTravelsRoutes);
router.use('/users', apiUserRoutes);

export default router;
