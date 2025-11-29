import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import {
    getParticipationsByTripId,
    createParticipation,
    updateParticipationStatus,
    deleteParticipation,
    getParticipationsForUser,
    pendingRequestsForMyTrips,
    getMyCreatedTripsWithParticipants,
} from '../../controllers/participations.controller.js';

const router = Router();

// Aplicar el middleware de autenticación a todas las rutas
router.use('/',verifyToken);

// GET 1: Obtener solicitudes pendientes para los viajes creados por el usuario autenticado
// Uso: para que el creador del viaje vea las solicitudes pendientes
router.get('/pending', pendingRequestsForMyTrips);

// GET 2: Obtener viajes creados por el usuario autenticado junto con sus participantes
// Uso: para que el creador del viaje vea sus viajes y los participantes
router.get('/my-created', getMyCreatedTripsWithParticipants);

// GET 3: Obtener participaciones del usuario autenticado(viajes a los que se ha unido)
// Uso: para que el usuario vea los viajes a los que se ha unido
router.get('/my-participations', getParticipationsForUser);

// GET 4: Obtener participaciones por ID de viaje
// Uso: para ver los participantes de un viaje específico
router.get('/trip/:tripId', getParticipationsByTripId);

// POST 5: Permitir al usuario autenticado unirse a un viaje (PENDING)
router.post('/', createParticipation);

// PUT 6: Actualizar el estado de una participación (ACEPTAR/RECHAZAR/CANCELAR)
router.put('/status/:participationId', updateParticipationStatus);

// DELETE 7: Eliminar la participación del usuario autenticado en un viaje
router.delete('/:participationId', deleteParticipation);


export default router;