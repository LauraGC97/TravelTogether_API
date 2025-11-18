import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RatingModel } from '../models/rating.model.js';
import logger from '../config/logger.js';
import { getUserFromToken } from '../utils/myUtils.js';

const getAllRatings = async (req, res) => {
    try {

        // Leemos parametros de paginación de query
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
        const search = req.query.search || '';

        // Tambien podriamos serializarlo, pero para pruebas lo dejo así 
        // const { page = 1, per_page = 10, search = '' } = req.query;

        const offset = (page - 1) * per_page;

        // Obtener total de registros y datos paginados
        const total = await RatingModel.count('username', search);
        // const results = await UserModel.getPaginated(offset, per_page);

        const results = await RatingModel.getPaginated({
            page: parseInt(page),
            per_page: parseInt(per_page),
            searchField: 'username',
            searchValue: search
        });

        // Calcular páginas totales
        const total_pages = Math.ceil(total / per_page);

        // Devolvemos respuesta
        res.status(200).json({
            page,
            per_page,
            total,
            total_pages,
            results
        });

    } catch (error) {
        logger.error('Error en getAllRatings:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getRatingById = async (req, res) => {
    try {
        const { id } = req.params;

        const rating = await RatingModel.getRatingById(id);

        if (!rating) {
            return res.status(404).json({ message: 'Rating no encontrado.' });
        }

        res.status(200).json(rating);
    } catch (error) {
        logger.error('Error en getUserById:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const createRating = async (req, res) => {

    try {
        const creatorId = await getUserFromToken(req.headers.authorization);

        console.log('creatorId : ' , creatorId) ;

        const ratingData = { ...req.body, creatorId };

        console.log('ratingData : ' , ratingData) ;

        const rating = new RatingModel(ratingData);

        console.log('rating : ' , rating) ;

        const newTrip = await rating.createRating();

        res.status(201).json({
            message: 'Rating creado exitosamente',
            trip: newTrip
        });
    } catch (error) {
        logger.error('Error al crear el rating:', error);
        res.status(500).json({
            message: 'Error interno del servidor al crear el viaje.',
            error: error.message
        });
    }
};

const updateRatingById = async (req, res) => {
    
    console.log('Entro updateRatingById') ;

    try {
        const { id } = req.params;
        const { score, comment } = req.body;

        const updatedRating = await RatingModel.updateRatingById(idUser, req.body);

        if (!updatedRating) {
            return res.status(404).json({ message: 'Rating no encontrado.' });
        }

        res.status(200).json({
            message: 'Rating actualizado correctamente.',
            rating: updatedRating
        });

    } catch (error) {
        logger.error('Error en updateUser:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const deleteRatingById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        /*
        // Permitir solo al propio usuario o admin
        if (parseInt(userId) !== parseInt(id) && role !== 'admin') {
          return res.status(403).json({ message: 'No tienes permiso para eliminar este usuario.' });
        }
        */

        const rating = await RatingModel.getRatingById(id);

        if (!rating) {
            return res.status(404).json({ message: 'Rating no encontrado.' });
        }

        const deleted = await RatingModel.deleteRating(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Rating no encontrado.' });
        }

        res.status(200).json({ message: 'Rating eliminado correctamente.', rating: rating });

    } catch (error) {
        logger.error('Error en deleteRating:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export default { getAllRatings, getRatingById, updateRatingById, deleteRatingById, createRating };