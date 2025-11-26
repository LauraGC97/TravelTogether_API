import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MessageModel } from '../models/message.model.js';
import logger from '../config/logger.js';
import { getUserFromToken } from '../utils/myUtils.js';

const getAllMessages = async (req, res) => {
    try {

        // Leemos parametros de paginación de query
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
        const search = req.query.search || '';

        // Tambien podriamos serializarlo, pero para pruebas lo dejo así 
        // const { page = 1, per_page = 10, search = '' } = req.query;

        const offset = (page - 1) * per_page;

        // Obtener total de registros y datos paginados
        const total = await MessageModel.count('username', search);
        // const results = await UserModel.getPaginated(offset, per_page);

        const results = await MessageModel.getPaginated({
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
        logger.error('Error en getAllMessages:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getMessageById = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await MessageModel.getMessagesById(id);

        if (!message) {
            return res.status(404).json({ message: 'Message no encontrado.' });
        }

        res.status(200).json(rating);
    } catch (error) {
        logger.error('Error en getMessageById:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getNotificationByReceiverId = async (req, res, next) => {

    const id = req.params.id;

    try {

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
        let search = req.query.search || '';

        const offset = (page - 1) * per_page;

        const total = await NotificationModel.count('WHERE receiver_id = ?', [id]);

        const results = await NotificationModel.getWithWhereClause({
            page: parseInt(page),
            per_page: parseInt(per_page),
            whereClause: 'WHERE receiver_id = ?',
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
        logger.error('Error en getNotificationByReceiverId:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }

};

function parseWhereString(whereString) {

    console.log('Entro en parseWhereString');

    if (!whereString) return { whereSQL: '', params: [] };

    const parts = whereString.split(' and ').map(p => p.trim());

    const conditions = [];
    const values = [];

    for (const p of parts) {
        const [field, value] = p.split(':');

        conditions.push(`${field} = ?`);

        // Intentamos detectar si es número
        const numericValue = Number(value);
        values.push(isNaN(numericValue) ? value : numericValue);
    }

    return {
        whereSQL: conditions.join(' AND '),
        params: values
    };
}

const getMessageWithWhere = async (req, res, next) => {

    const id = req.params.id;
    const baseWhere = 'WHERE 1=1 ';
    const baseParams = [] ;

    const where = req.query.where;

    try {
        const { whereSQL, params } = parseWhereString(where);

        const finalWhere = whereSQL ? `${baseWhere} AND ${whereSQL}` : baseWhere;
        const finalParams = [...baseParams, ...params];

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
        let search = req.query.search || '';

        const offset = (page - 1) * per_page;

        const total = await MessageModel.count('WHERE receiver_id = ?', [id]);

        const results = await MessageModel.getWithWhereClause({
            page: parseInt(page),
            per_page: parseInt(per_page),
            whereClause:finalWhere,
            queryParams: finalParams

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
        logger.error('Error en getMessageWithWhere:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }

};

const getNotificationBySenderId = async (req, res, next) => {

    const id = req.params.id;

    try {

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
        let search = req.query.search || '';

        const offset = (page - 1) * per_page;

        const total = await NotificationModel.count('WHERE sender_id = ?', [id]);

        const results = await NotificationModel.getWithWhereClause({
            page: parseInt(page),
            per_page: parseInt(per_page),
            whereClause: 'WHERE sender_id = ?',
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
        logger.error('Error en getNotificationBySenderId:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }

};

const createMessage = async (req, res) => {

    try {
        const creatorId = await getUserFromToken(req.headers.authorization);
        const messageData = { ...req.body, creatorId };
        const message = new MessageModel(messageData);
        const newMessage = await message.createMessage();

        res.status(201).json({
            message: 'Message creado exitosamente',
            newMessage: newMessage
        });
    } catch (error) {
        logger.error('Error al crear el Message:', error);
        res.status(500).json({
            message: 'Error interno del servidor al crear Message.',
            error: error.message
        });
    }
};

const updateMessageById = async (req, res) => {

    try {
        const { id } = req.params;
        const updatedMessage = await MessageModel.updateMessageById(id, req.body);

        if (!updatedMessage) {
            return res.status(404).json({ message: 'Message no encontrado.' });
        }

        res.status(200).json({
            message: 'Message actualizado correctamente.',
            updateMessage: updatedMessage
        });

    } catch (error) {
        logger.error('Error en updateMessage:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const deleteMessageById = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await MessageModel.getMessageById(id);

        if (!message) {
            return res.status(404).json({ message: 'Message no encontrado.' });
        }

        const deleted = await MessageModel.deleteMessageById(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Message no encontrado.' });
        }

        res.status(200).json({ message: 'Message eliminado correctamente.', message: message });

    } catch (error) {
        logger.error('Error en deleteMessageById:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export default {
    getAllMessages,
    getMessageById,
    getNotificationBySenderId,
    getNotificationByReceiverId,
    getMessageWithWhere,
    updateMessageById,
    deleteMessageById,
    createMessage
};