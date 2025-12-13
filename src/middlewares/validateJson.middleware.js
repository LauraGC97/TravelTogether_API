import express from 'express';

export const validateJson = (req, res, next) => {

    express.json()(req, res, (err) => {


        if (err) {
            return res.status(400).json({
                message: "❌ JSON mal formado. Revisa tu petición.",
                details: err.message
            });
        }

        next();
    });
};