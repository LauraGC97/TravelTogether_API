import pool from '../config/db.js';
import BaseModel from './base.model.js';

export class MessageModel extends BaseModel {

    static tableName = 'messages';

    constructor({ id, message, receiver_id, created_at, sender_id, trip_id, group_id}) {

        super('messages');

        this.id = id;
        this.message = message;
        this.receiver_id = receiver_id;
        this.created_at = created_at;
        this.sender_id = sender_id;
        this.trip_id = trip_id;
        this.group_id = group_id;

    }

    async createMessage() {

        const [result] = await pool.query(
            `INSERT INTO messages ( message, receiver_id, sender_id, trip_id, group_id)
       VALUES (?, ?, ?, ?, ? )`,
            [this.message, this.receiver_id, this.sender_id, this.trip_id, this.group_id]
        );

        // Recuperamos el usuario recién creado para enviarlo al Front
        const [rows] = await pool.query(
            ` SELECT  id, message, receiver_id, created_at, sender_id, trip_id, group_id  
              FROM messages 
              WHERE id = ?`,
            [result.insertId]
        );

        return rows[0];
    }

    static async getMessageById(id) {
        const [rows] = await pool.query(
            `SELECT  id, message, receiver_id, created_at, sender_id, trip_id, group_id
             FROM messages 
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

    static async updateMessageById(id, data) {

        const {  message } = data;

        const [result] = await pool.query(
            `UPDATE messages 
             SET  message = ? 
             WHERE id = ?`,
            [message, id]
        );

        if (result.affectedRows === 0) return null;

        const [rows] = await pool.query(
            ` SELECT  id, message, receiver_id, created_at, sender_id, trip_id, group_id 
              FROM messages
              WHERE id = ?`,
            [id]
        );

        return rows[0];
    }

    static async deleteMessageById(id) {
        const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

}