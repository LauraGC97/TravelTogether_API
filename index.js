// Server creation and configuration
import http from 'node:http';
import app from './src/app.js';
import pool from './src/config/db.js';
import dotenv from 'dotenv';
import logger from './src/config/logger.js';

// Config .env
dotenv.config();

// Server creation
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT);

// Listeners
server.on("listening", async () => {
    logger.info(`Server listening on port ${PORT}`);

    try {
        const connection = await pool.getConnection();
        logger.info('Conexión a la base de datos MySQL exitosa!');
        connection.release();
    } catch (error) {
        logger.error('Error conectando a la base de datos:', error.message);
    }    
});

server.on("error", (error) => {
    logger.error(error);
});
