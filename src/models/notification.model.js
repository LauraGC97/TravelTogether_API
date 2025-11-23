import pool from '../config/db.js';
import BaseModel from './base.model.js';

export class NotificationModel extends BaseModel {

    static tableName = 'notifications';

    constructor({ id, title, message, type, is_read, created_at, sender_id, receiver_id }) {

        super('notifications');

        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.is_read = is_read;
        this.created_at = created_at;
        this.sender_id = sender_id;
        this.receiver_id = receiver_id;

    }

    async createNotification() {

        const [result] = await pool.query(
            `INSERT INTO notifications ( title, message, type, is_read, sender_id, receiver_id)
       VALUES (?, ?, ?, ?, ?, ? )`,
            [this.title, this.message, this.type, this.is_read, this.sender_id, this.receiver_id]
        );

        // Recuperamos el usuario recién creado para enviarlo al Front
        const [rows] = await pool.query(
            ` SELECT id, title, message, type, is_read, created_at, sender_id, receiver_id  
              FROM notifications 
              WHERE id = ?`,
            [result.insertId]
        );

        return rows[0];
    }

    static async getNotificationById(id) {
        const [rows] = await pool.query(
            `SELECT id, title, message, type, is_read, created_at, sender_id, receiver_id
             FROM notifications 
             WHERE id = ?`, [id]
        );
        return rows[0] || null;
    }

    static async getWithWhereClause({
        page = 1,
        per_page = 10,
        whereClause = '',
        queryParams = [],
        sort = 'id',
        order = 'DESC'
    } = {}) {
        const offset = (page - 1) * per_page;

        const total = await this.count(whereClause, queryParams);

        const query = `
            SELECT * FROM ${this.tableName}
            ${whereClause}
            ORDER BY ${sort} ${order}
            LIMIT ? OFFSET ?`;

        const finalParams = [...queryParams, per_page, offset];

        const [rows] = await pool.query(query, finalParams);

        return { total, results: rows, page, per_page, total_pages: Math.ceil(total / per_page) };
    }

    static async getSumScoreById(id) {
        const [rows] = await pool.query(
            `SELECT SUM(score) as total
             FROM ratings 
             WHERE rated_user_id = ?`, [id]
        );
        return rows[0] || null;
    }

    static async updateNotificationById(id, data) {

        const { title, message } = data;

        const [result] = await pool.query(
            `UPDATE notifications 
             SET  title = ?, message = ?
             WHERE id = ?`,
            [title, message, id]
        );

        if (result.affectedRows === 0) return null;

        const [rows] = await pool.query(
            ` SELECT  id, title, message, type, is_read, created_at, sender_id, receiver_id 
              FROM notifications
              WHERE id = ?`,
            [id]
        );

        return rows[0];
    }

    static async deleteNotification(id) {
        const [result] = await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

}