import { ParticipationModel } from "../models/participation.model.js";
import { TripModel } from "../models/trip.model.js";
import jwt from "jsonwebtoken";


//estados de participación
const PARTICIPATION_STATUSES = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
};

//------------------------------------------
// Función auxiliar para extraer el userId del token JWT en el header
//------------------------------------------
export function getUserIdFromAuthHeader(authHeader) {
  if (!authHeader) {
    throw new Error("No authorization header provided");
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new Error("Invalid authorization header format");
  }

  const token = parts[1];

  try {
    // Usar la clave secreta del entorno
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    return decoded.id; // <-- Devuelve el userId del token
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

//------------------------------------------
// GET: Obtener participaciones por ID de viaje
//------------------------------------------
const getParticipationsByTripId = async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const participations = await ParticipationModel.getParticipationsByTripId(tripId);

    if (!participations || participations.length === 0) {
      return res.status(200).json({
        message: "No se encontraron participantes para este viaje.",
        data: [],
      });
    }

    res.status(200).json({
      message: "Participantes obtenidos con éxito.",
      data: participations,
    });
  } catch (error) {
    console.error("Error al obtener participantes del viaje", error);
    res.status(500).json({
      message: "Error al obtener participantes del viaje.",
      error: error.message,
    });
  }
};

//------------------------------------------
// GET: Obtener los viajes creados por el usuario con participaciones (creador viajes)
//------------------------------------------
const getMyCreatedTripsWithParticipants = async (req, res) => {
  try {
    const creatorId = getUserIdFromAuthHeader(req.headers.authorization);
    const tripsWithParticipations =
      await TripModel.getMyCreatedTripsWithParticipants(creatorId);
      
    if (!tripsWithParticipations || tripsWithParticipations.length === 0) { 
      return res.status(200).json({
        message: "No has creado ningún viaje aún.",
        data: [],
      });
    }

    res.status(200).json({
      message: "Tus viajes creados con participaciones obtenidos con éxito.",
      data: tripsWithParticipations,
    });
  } catch (error) {
    console.error("Error al obtener viajes creados por el usuario:", error);
    if (error.message.includes("token")) {
        return res.status(401).json({ 
            message: "Error de autenticación: Token no válido o no proporcionado.", 
            error: error.message 
        });
    }
    res.status(500).json({
      message: "Error interno del servidor al obtener viajes creados por el usuario.",
      error: error.message,
    });   
  }
};  

//------------------------------------------
// GET: Obtener todas las participaciones del usuario autenticado (incluye los detalles del viaje)
//------------------------------------------
const getParticipationsForUser = async (req, res) => {
  try {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);

    const participations =
      await ParticipationModel.getParticipationsWithTripDetailsByUserId(userId);

    if (!participations || participations.length === 0) {
      return res.status(200).json({
        message: "No tienes participaciones en ningún viaje.",
        data: [],
      });
    }

    res.status(200).json({
      message: "Tus participaciones en viajes obtenidas con éxito.",
      data: participations,
    });
  } catch (error) {
    console.error("Error al obtener participaciones del usuario:", error);
    if (error.message.includes("token")) {
        return res.status(401).json({ 
            message: "Error de autenticación: Token no válido o no proporcionado.", 
            error: error.message 
        });
    }
    res.status(500).json({
      message: "Error interno del servidor al obtener participaciones del usuario.",
      error: error.message,
    });
  }
};  

//------------------------------------------
// GET: Obtener solicitudes pendientes para viajes creados por el usuario autenticado (incluye los detalles el usuario y del viaje)
//------------------------------------------
const pendingRequestsForMyTrips = async (req, res) => {
  try {
    const creatorId = getUserIdFromAuthHeader(req.headers.authorization);

    const pendingRequests =
      await ParticipationModel.getPendingRequestsForCreator(creatorId);

    if (!pendingRequests || pendingRequests.length === 0) {
      return res.status(200).json({
        message: "No hay solicitudes pendientes para tus viajes.",
        data: [],
      });
    }

    res.status(200).json({
      message: `Se encontraron ${pendingRequests.length} solicitudes pendientes.`,
      data: pendingRequests,
    });
  } catch (error) {
    console.error("Error al obtener solicitudes pendientes:", error);
    if (error.message.includes("token")) {
        return res.status(401).json({ 
            message: "Error de autenticación: Token no válido o no proporcionado.", 
            error: error.message 
        });
    }
    res.status(500).json({
      message: "Error interno del servidor al obtener solicitudes pendientes.",
      error: error.message,
    });
  }
};

//------------------------------------------
// POST: Permitir al usuario autenticado unirse a un viaje
//------------------------------------------
const createParticipation = async (req, res) => {
  try {
    const userId = getUserIdFromAuthHeader(req.headers.authorization); // ID del usuario autenticado
    const { tripId } = req.body; // ID del viaje al que se une

    if (!tripId) {
      return res.status(400).json({
        message: "El ID del viaje es obligatorio.",
      });
    }
    // 1. Verificar si el viaje existe y su capacidad
    const tripData = await TripModel.getCapacityAndParticipantsCount(tripId);
    if (!tripData) {
      return res.status(404).json({
        message: "El viaje no existe.",
      });
    }
    // 1.1 El creador no puede solicitar unirse a su propio viaje
    if (tripData.creator_id === userId) {
      return res.status(400).json({
        message: "No puedes solicitar unirte a tu propio viaje.",
      });
    }
    // 2. Verificar si el viaje ya está lleno
    if (tripData.current_participants >= tripData.capacity) {
      return res.status(400).json({
        message: "El viaje ya está lleno.",
      });
    }
    // 3. Verificar si el usuario ya está inscrito en el viaje o pendiente
    const existingParticipation =
      await ParticipationModel.getParticipationsByTripAndUser(tripId, userId);
    if (existingParticipation) {
      const statusMessage =
        existingParticipation.status === PARTICIPATION_STATUSES.ACCEPTED
          ? "Ya estás inscrito en este viaje."
          : "Tu solicitud para unirte a este viaje ya está pendiente de aprobación.";
      return res.status(400).json({ message: statusMessage });
    }

    // 4. Crear la participación con estado 'pending'
    const newParticipationInstance = new ParticipationModel({
      user_id: userId,
      trip_id: tripId,
      status: PARTICIPATION_STATUSES.PENDING,
    });
    const newParticipation =
      await newParticipationInstance.createParticipation();

    res.status(201).json({
      message:
        "Solicitud para unirse al viaje creada con éxito. Esperando aprobación.",
      data: newParticipation,
    });
  } catch (error) {
    console.error("Error al crear la solicitud de participación:", error);
    res.status(500).json({
      message:
        "Error interno del servidor al procesar la solicitud de participación.",
      error: error.message,
    });
  }
};
//------------------------------------------
// PUT: Actualizar el estado de una participación (CREADOR O PARTICIPANTE)
// Esta es la vía para la RETIRADA LÓGICA (status: 'cancelled').
// Permite guardar el registro y el historial de que un usuario se retiró, sin borrarlo.
//------------------------------------------
const updateParticipationStatus = async (req, res) => {
  try {
    const requesterId = getUserIdFromAuthHeader(req.headers.authorization);
    const { participationId } = req.params;
    const { newStatus } = req.body;

    if (!participationId || !newStatus) {
      return res.status(400).json({
        message: "Faltan campos obligatorios: participationId y newStatus.",
      });
    }
    
    // 1. Obtener la participación para verificar IDs y estados
    const participation =
      await ParticipationModel.getParticipationById(participationId);

    if (!participation) {
      return res.status(404).json({
        message: "No se encontró la participación para actualizar.",
      });
    }

    const { user_id: targetUserId, trip_id: tripId, status: currentStatus } = participation;

    // 2. Definir estados permitidos
    const allowedStatuses = [
      PARTICIPATION_STATUSES.ACCEPTED, 
      PARTICIPATION_STATUSES.REJECTED, 
      PARTICIPATION_STATUSES.CANCELLED
    ];
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        message: `Estado no válido. Los estados permitidos son: ${allowedStatuses.join(
          ", "
        )}.`,
      });
    }

    const isCreator = await TripModel.isTripCreator(tripId, requesterId);
    const isTargetUser = requesterId === targetUserId;

    // 3. Lógica de permisos
    if (!isCreator && !isTargetUser) {
      return res.status(403).json({
        message: "No tienes permiso para modificar el estado de esta participación.",
      });
    }
    
    // El propio usuario (targetUserId) solo puede usar 'cancelled' para salirse (retirada lógica).
    // El creador puede usar 'accepted', 'rejected', o 'cancelled' para gestionar el cupo y el viaje.
    if (isTargetUser && !isCreator && newStatus !== PARTICIPATION_STATUSES.CANCELLED) {
        return res.status(403).json({
            message: "Solo puedes cambiar el estado a 'cancelled' para darte de baja del viaje.",
        });
    }

    // Si el estado actual ya es el nuevo estado, no hacemos nada
    if (currentStatus === newStatus) {
        return res.status(200).json({
            message: `La participación ya se encuentra en el estado '${newStatus}'.`,
            data: participation,
        });
    }
    
    // 4. Si el creador está aceptando una participación pendiente, verificar capacidad
    if (newStatus === PARTICIPATION_STATUSES.ACCEPTED && currentStatus === PARTICIPATION_STATUSES.PENDING) {
      const tripData = await TripModel.getCapacityAndParticipantsCount(tripId);

      // Verificamos si aún hay capacidad ANTES de aceptar
      if (tripData.current_participants >= tripData.capacity) {
        return res.status(400).json({
          message:
            "No se puede aceptar la participación. El viaje ya está lleno.",
        });
      }
    }
    
    // 5. Actualizar el estado de la participación
    const updatedParticipation =
      await ParticipationModel.updateParticipationStatusById(
        participationId,
        newStatus
      );

    if (!updatedParticipation) {
      return res.status(500).json({
        message: "No se pudo actualizar el estado de la participación.",
      });
    }

    res.status(200).json({
      message: `Estado de la participación actualizado a '${newStatus}' con éxito.`,
      data: updatedParticipation,
    });
  } catch (error) {
    console.error("Error al actualizar el estado de la participación:", error);
    // Verificar si el error viene de la validación del token
    if (error.message.includes("token")) {
        return res.status(401).json({ 
            message: "Error de autenticación: Token no válido o no proporcionado.", 
            error: error.message 
        });
    }
    res.status(500).json({
      message:
        "Error interno del servidor al actualizar el estado de la participación.",
      error: error.message,
    });
  }
};

//------------------------------------------
// DELETE: Eliminar una participación (Retirada física del registro)
// Este endpoint es para la ELIMINACIÓN PERMANENTE del registro, borrando el historial.
// Se usa principalmente para 'limpieza' (ej: borrar una solicitud pendiente/rechazada).
// Lo puede hacer el CREADOR (para cualquier registro) o el PROPIO USUARIO (para auto-eliminarse).
//------------------------------------------
const deleteParticipation = async (req, res) => {
  try {
    const requesterId = getUserIdFromAuthHeader(req.headers.authorization); // ID del usuario autenticado
    const { participationId } = req.params; 
    
    if (!participationId) {
      return res.status(400).json({
        message: "El ID de la participación es obligatorio.",
      });
    }
    
    // 1. Obtener la participación
    const participation = 
        await ParticipationModel.getParticipationById(participationId);
    
    if (!participation) {
        return res.status(404).json({
            message: "No se encontró la participación para eliminar.",
        });
    }

    const { user_id: targetUserId, trip_id: tripId } = participation;
    
    // 2. Comprobar permisos
    const isCreator = await TripModel.isTripCreator(tripId, requesterId);
    const isTargetUser = requesterId === targetUserId;
    
    // Solo el creador del viaje o el propio usuario pueden eliminar el registro (físicamente)
    if (!isCreator && !isTargetUser) {
      return res.status(403).json({
        message: "No tienes permiso para eliminar esta participación.",
      });
    }

    // 3. Eliminar físicamente el registro
    const isDeleted = await ParticipationModel.removeParticipationById(
      participationId
    );

    if (!isDeleted) {
      return res.status(500).json({
        message: "Hubo un error al intentar eliminar la participación.",
      });
    }

    res.status(200).json({
      message: `Participación eliminada con éxito. Usuario ${
        isTargetUser ? "se ha dado de baja" : "ha sido eliminado"
      } del viaje.`,
      data: { userId: targetUserId, tripId, participationId },
    });
  } catch (error) {
    console.error("Error al eliminar la participación:", error);
    // Verificar si el error viene de la validación del token
    if (error.message.includes("token")) {
        return res.status(401).json({ 
            message: "Error de autenticación: Token no válido o no proporcionado.", 
            error: error.message 
        });
    }
    res.status(500).json({
      message: "Error interno del servidor al eliminar la participación.",
      error: error.message,
    });
  }
};


export {
  getParticipationsByTripId,
  createParticipation,
  updateParticipationStatus,
  deleteParticipation,
  getParticipationsForUser,
  pendingRequestsForMyTrips,
  getMyCreatedTripsWithParticipants,
};
