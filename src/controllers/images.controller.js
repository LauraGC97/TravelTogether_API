import 'dotenv/config';
import { BlobServiceClient } from '@azure/storage-blob';
import ImagesModel from '../models/images.model.js';
import logger from '../config/logger.js';

import path from 'path';

const AZ_CONN = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER || 'imagenes';

if (!AZ_CONN) {
    console.warn('Falta AZURE_STORAGE_CONNECTION_STRING en .env');
}

const blobServiceClient = AZ_CONN ? BlobServiceClient.fromConnectionString(AZ_CONN) : null;

const uploadImage = async (req, res, next) => {
    try {

        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const timestamp = Date.now();
        const originalName = req.file.originalname;
        const ext = path.extname(originalName);
        const safeName = path.basename(originalName, ext).replace(/\s+/g, '-').toLowerCase();
        const blobName = `${timestamp}-${safeName}${ext}`;

        if (!blobServiceClient) return res.status(500).json({ error: 'Azure not configured' });

        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

        const createResponse = await containerClient.createIfNotExists({ access: 'container' });

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const options = {
            blobHTTPHeaders: { blobContentType: req.file.mimetype }
        };

        await blockBlobClient.uploadData(req.file.buffer, options);

        const blobUrl = blockBlobClient.url;

        const imageRecord = {
            description: req.body.description || null,
            url: blobUrl,
            trip_id: req.body.trip_id || null,
            user_id: req.body.user_id || null,
            main_img: req.body.main_img ?? 0
        };

        console.log ('imageRecord : ', imageRecord) ;

        const inserted = await ImagesModel.insert(imageRecord);

        return res.status(201).json({ message: 'Uploaded', data: inserted || imageRecord });
    } catch (error) {
        logger.error(error) ;
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const row = await ImagesModel.getById(id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (error) {
        logger.error(error) ;
        next(error);
    }
};

const getByIdTrip = async (req, res, next) => {

    const id = req.params.id;

    try {

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
        let search = req.query.search || '';

        const offset = (page - 1) * per_page;

        const total = await ImagesModel.count('WHERE trip_id = ?', [id]);

        const results = await ImagesModel.getByIdTrip({
            page: parseInt(page),
            per_page: parseInt(per_page),
            whereClause: 'WHERE trip_id = ?',
            queryParams: [id]
        });

        const total_pages = Math.ceil(total / per_page);

        res.status(200).json({
            page,
            per_page,
            total,
            total_pages,
            results
        });

    } catch (error) {
        logger.error('Error en getByIdTrip:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }

};

const getByIdUser = async (req, res, next) => {

    const id = req.params.id;

    try {

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
        let search = req.query.search || '';

        const offset = (page - 1) * per_page;

        const total = await ImagesModel.count('WHERE user_id = ?', [id]);

        const results = await ImagesModel.getByIdTrip({
            page: parseInt(page),
            per_page: parseInt(per_page),
            whereClause: 'WHERE user_id = ?',
            queryParams: [id]
        });

        const total_pages = Math.ceil(total / per_page);

        res.status(200).json({
            page,
            per_page,
            total,
            total_pages,
            results
        });

    } catch (error) {
        logger.error('Error en getByIdUser:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }

};

const deleteImage = async (req, res, next) => {
    try {
        const id = req.params.id;

        const image = await ImagesModel.deleteById(id);
        if (!image) return res.status(404).json({ message: 'Image not found' });

        if (blobServiceClient && image.url) {
            const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
            
            const blobName = path.basename(image.url);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.deleteIfExists();
        }

        res.json({ message: 'Image deleted', data: image });

    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export default {
    uploadImage,
    getById,
    getByIdTrip,
    getByIdUser,
    deleteImage
};