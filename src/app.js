import express from 'express';
import cors from 'cors';
import logger from './config/logger.js';

import createError from 'http-errors';
import path from 'path';

// importamos rutas propias
import apiRoutes from './routes/api.routes.js';

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.options('/', handleOptions);
app.options('/api', handleOptions);
app.options('/api/trips', handleOptions);
app.options('/api/users', handleOptions);
app.options('/api/images', handleOptions);

function handleOptions(req, res) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
}

app.use('/api', apiRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        message: "Not found"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

export default app;



