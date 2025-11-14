// Creation and configuration of the Express APP
import express from 'express';
import cors from 'cors';

import createError from 'http-errors';
import path from 'path';
// const cookieParser = require('cookie-parser') ;
// var logger = require('morgan');

// importamos rutas propias
import apiRoutes from './routes/api.routes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', apiRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        message: "Not found"
    });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: err.message });
});

export default app;
