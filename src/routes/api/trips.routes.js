import express from 'express';
import { 
    createTrip,
    getTripById,
    searchTrips,
    updateTrip,
    deleteTrip
} from '../../controllers/trips.controllers.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

//-------- GET Listar/Filtrar viajes ----------------
router.get('/', searchTrips);
//-------- POST Crear nuevo viaje (protegido) ----------------
router.post('/', verifyToken, createTrip);
//-------- GET Obtener viaje por ID ----------------
router.get('/:id', getTripById);
//-------- PUT Actualizar viaje por ID (protegido) ----------------
router.put('/:id', verifyToken, updateTrip);
//-------- DELETE Eliminar viaje por ID (protegido) ----------------
router.delete('/:id', verifyToken, deleteTrip);

export default router;
