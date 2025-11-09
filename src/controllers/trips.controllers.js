import { TripModel } from '../models/trip.model.js';

//----------------------------------------------------------
// CREATE: Crear viaje
//----------------------------------------------------------
const createTrip = async (req, res) => {
  try {
    const tripData = req.body;

    if (!tripData.title || !tripData.origin || !tripData.destination || !tripData.creator_id) {
        return res.status(400).json({ message: 'Faltan datos obligatorios para crear el viaje.' });
    }
    
    const trip = new TripModel(tripData);
    const newTrip = await trip.createTrip();

    res.status(201).json({
       message: 'Viaje creado exitosamente',
       trip: newTrip
    });
    
  } catch (error) {
    console.error('Error al crear el viaje:', error);
    res.status(500).json({ 
        message: 'Error interno del servidor al crear el viaje.',
        error: error.message
    });
  }
}; 

//----------------------------------------------------------
// READ: Obtener viaje por ID
//----------------------------------------------------------
const getTripById = async (req, res) => {
    try {
        const trip = await TripModel.getTripById(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: 'Viaje no encontrado.' });
        }
        res.status(200).json(trip);
    } catch (error) {
        console.error('Error al obtener el viaje:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener el viaje.',
            error: error.message
        });
    }
};

//----------------------------------------------------------
// SEARCH/GET: Listar y filtrar viajes con paginación
//----------------------------------------------------------
const searchTrips = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page)) || 1;
        const per_page = Math.max(1, parseInt(req.query.per_page)) || 10;

        const filters = {
            page: page,
            per_page: per_page,
            creator_id: req.query.creator_id, //Filtrar por creador
            status: req.query.status,//Filtrar por estado
            destination: req.query.destination,//Filtrar por destino
        };
        
        const { total, trips, page: currentPage, per_page: currentPerPage} = await TripModel.searchTrips(filters);
        const total_pages = Math.ceil(total / currentPerPage);

        res.status(200).json({
            page: currentPage,
            per_page: currentPerPage,
            total,
            total_pages,
            results: trips
        });
    } catch (error) {
        console.error('Error al buscar viajes:', error);
        res.status(500).json({
            message: 'Error interno del servidor al buscar viajes.',
            error: error.message
        });
    }
};

//----------------------------------------------------------
// UPDATE: Actualizar viaje
//----------------------------------------------------------
const updateTrip = async (req, res) => {
    try {
        const updatedTrip = await TripModel.updateTrip(req.params.id, req.body);

        if (!updatedTrip) {
            return res.status(404).json({ message: 'Viaje no encontrado para actualizar.' });
        }
        res.status(200).json({
            message: 'Viaje actualizado exitosamente',
            trip: updatedTrip
        });
    } catch (error) {
        console.error('Error al actualizar el viaje:', error);
        res.status(500).json({
            message: 'Error interno del servidor al actualizar el viaje.',
            error: error.message
        });
    }
};

//----------------------------------------------------------
// DELETE: Eliminar viaje
//----------------------------------------------------------
const deleteTrip = async (req, res) => {
    try {
        const deleted = await TripModel.deleteTrip(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({ message: 'Viaje no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Viaje eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el viaje:', error);
        res.status(500).json({
            message: 'Error interno del servidor al eliminar el viaje.',
            error: error.message
        });
    }
};

export {
    createTrip,
    getTripById,
    searchTrips,
    updateTrip,
    deleteTrip
};