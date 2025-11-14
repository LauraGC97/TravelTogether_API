import 'dotenv/config'; 
import { BlobServiceClient } from '@azure/storage-blob';
import ImagesModel from '../models/images.model.js';

import path from 'path';

const AZ_CONN = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER || 'imagenes';

if (!AZ_CONN) {
  console.warn('Falta AZURE_STORAGE_CONNECTION_STRING en .env');
}

const blobServiceClient = AZ_CONN ? BlobServiceClient.fromConnectionString(AZ_CONN) : null;

const uploadImage = async (req, res, next) => {
  try {
    // multer pone el fichero en req.file (porque usamos .single)
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // nombre único para el blob
    const timestamp = Date.now();
    const originalName = req.file.originalname;
    const ext = path.extname(originalName);
    const safeName = path.basename(originalName, ext).replace(/\s+/g, '-').toLowerCase();
    const blobName = `${timestamp}-${safeName}${ext}`;

    if (!blobServiceClient) return res.status(500).json({ error: 'Azure not configured' });

    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    // crear contenedor si no existe (opcional)
    const createResponse = await containerClient.createIfNotExists({ access: 'container' }); // 'container' => público
    // nota: access: 'container' establecerá acceso público al contenedor (ver más abajo recomendaciones)

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Subir buffer
    const options = {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    };

    await blockBlobClient.uploadData(req.file.buffer, options);

    // URL pública del blob
    const blobUrl = blockBlobClient.url;

    // Guardar en BD (ejemplo): guardar filename, url, mimetype, tamaño, created_at...
    const imageRecord = {
      description: req.body.description || null,
      url: blobUrl,
      trip_id: req.body.trip_id || null,
      user_id: req.body.user_id || null,
      main_img: req.body.main_img ?? 0
    };

    // usar el modelo para insertar (adaptar según tu BD)
    const inserted = await ImagesModel.insert(imageRecord);

    return res.status(201).json({ message: 'Uploaded', data: inserted || imageRecord });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const row = await ImagesModel.findById(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (error) {
    next(error);
  }
};

export default {
  uploadImage,
  getById
};