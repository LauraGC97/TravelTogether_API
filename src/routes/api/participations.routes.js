import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import {
    getParticipationsByTripId,
    createParticipation,
    updateParticipationStatus,
    deleteParticipation
} from '../../controllers/participations.controller.js';

const router = Router();

// Aplicar el middleware de autenticación a todas las rutas
router.use('/',verifyToken);

// GET: Obtener participaciones por ID de viaje
router.get('/trip/:tripId', getParticipationsByTripId);

// POST: Permitir al usuario autenticado unirse a un viaje (PENDING)
router.post('/', createParticipation);

// PUT: Actualizar el estado de una participación (ACEPTAR/RECHAZAR)
router.put('/status/:participationId', updateParticipationStatus);

// DELETE: Eliminar la participación del usuario autenticado en un viaje
router.delete('/:participationId', deleteParticipation);

export default router;