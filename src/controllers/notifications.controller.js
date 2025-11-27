import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NotificationModel } from '../models/notification.model.js';
import logger from '../config/logger.js';
import { getUserFromToken } from '../utils/myUtils.js';

const getAllNotifications = async (req, res) => {
    try {

        // Leemos parametros de paginación de query
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
        const search = req.query.search || '';

        // Tambien podriamos serializarlo, pero para pruebas lo dejo así 
        // const { page = 1, per_page = 10, search = '' } = req.query;

        const offset = (page - 1) * per_page;

        // Obtener total de registros y datos paginados
        const total = await NotificationModel.count('username', search);
        // const results = await UserModel.getPaginated(offset, per_page);

        const results = await NotificationModel.getPaginated({
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

const getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;

        const rating = await NotificationModel.getNotificationById(id);

        if (!rating) {
            return res.status(404).json({ message: 'Notification no encontrado.' });
        }

        res.status(200).json(rating);
    } catch (error) {
        logger.error('Error en getNotificationById:', error);
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

const getNotificationWithWhere = async (req, res, next) => {

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

        const total = await NotificationModel.count('WHERE receiver_id = ?', [id]);

        const results = await NotificationModel.getWithWhereClause({
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
        logger.error('Error en getNotificationByReceiverId:', error);
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

const createNotification = async (req, res) => {

    try {
        const creatorId = await getUserFromToken(req.headers.authorization);
        const notificationData = { ...req.body, creatorId };
        const notification = new NotificationModel(notificationData);
        const newNotification = await notification.createNotification();

        res.status(201).json({
            message: 'Notificaction creado exitosamente',
            notification: newNotification
        });
    } catch (error) {
        logger.error('Error al crear el Notification:', error);
        res.status(500).json({
            message: 'Error interno del servidor al crear notification.',
            error: error.message
        });
    }
};

const updateNotificationById = async (req, res) => {

    try {
        const { id } = req.params;
        const updatedNotification = await NotificationModel.updateNotificationById(id, req.body);

        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification no encontrado.' });
        }

        res.status(200).json({
            message: 'Notification actualizado correctamente.',
            notification: updatedNotification
        });

    } catch (error) {
        logger.error('Error en updateNotification:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const deleteNotificationById = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await NotificationModel.getNotificationById(id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification no encontrado.' });
        }

        const deleted = await NotificationModel.deleteNotification(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Notification no encontrado.' });
        }

        res.status(200).json({ message: 'Notification eliminado correctamente.', notification: notification });

    } catch (error) {
        logger.error('Error en deleteNotificationById:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export default {
    getAllNotifications,
    getNotificationById,
    getNotificationBySenderId,
    getNotificationByReceiverId,
    getNotificationWithWhere,
    updateNotificationById,
    deleteNotificationById,
    createNotification
};