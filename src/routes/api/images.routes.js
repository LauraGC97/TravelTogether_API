import express from 'express';
import imagesController from '../../controllers/images.controller.js';
import imagesMiddleware from '../../middlewares/images.middleware.js';

const router = express.Router();

router.post('/upload', imagesMiddleware.uploadSingle, imagesController.uploadImage);

/*
router.post('/upload', (req, res, next) => {
    console.log(">>>> Llegó petición /upload");
    next();
}, imagesMiddleware.uploadSingle, (req, res, next) => {
    console.log(">>>> Después de multer");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("FILES:", req.files);
    next();
}, imagesController.uploadImage);
*/

router.get('/:id', imagesController.getById);
router.get('/trips/:id', imagesController.getByIdTrip);
router.get('/users/:id', imagesController.getByIdUser);
router.delete('/:id', imagesController.deleteImage);

export default router;

/*
import express from 'express';
import multer from 'multer';

const router = express.Router();
// const storage = multer.memoryStorage();
const upload = multer();

// Endpoint minimalista de prueba
router.post('/test-upload', upload.none(), (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    res.json({ ok: true });
});

export default router;
*/