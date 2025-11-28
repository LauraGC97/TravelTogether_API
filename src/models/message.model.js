import pool from '../config/db.js';
import BaseModel from './base.model.js';

export class MessageModel extends BaseModel {

    static tableName = 'messages';

    constructor({ id, message, receiver_id, created_at, sender_id, trip_id, group_id }) {

        super('messages');

        this.id = id;
        this.message = message;
        this.receiver_id = receiver_id;
        this.created_at = created_at;
        this.sender_id = sender_id;
        this.trip_id = trip_id;
        this.group_id = group_id;

    }

    // Esta funcion duplicada me duele en alma, pero no voy hacer un getUserById por cada registro para conseguir el usuario
    static async getPaginated({
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
            SELECT 

            messages.*,

            receiver.id AS receiver_id,
            receiver.username AS receiver_username,
            receiver.email AS receiver_email,

            sender.id AS sender_id,
            sender.username AS sender_username,
            sender.email AS sender_email,

            trips.id AS trip_id,
            trips.title AS trip_title,
            trips.description AS trip_description,
            trips.origin AS trip_origin,
            trips.start_date AS trip_start_date,
            trips.end_date AS trip_end_date,

            groups1.id AS group_id,
            groups1.title AS group_title

            FROM ${this.tableName} messages

            JOIN users receiver on ( messages.receiver_id = receiver.id )
            JOIN users sender on ( messages.sender_id = sender.id )
            LEFT JOIN trips trips on ( messages.trip_id = trips.id )
            LEFT JOIN users_groups groups1 on ( messages.group_id = groups1.id )

            ${whereClause}

            ORDER BY messages.id DESC
            LIMIT ? OFFSET ?`;

        console.log ( `query : ${query}` ) ;

        const finalParams = [...queryParams, per_page, offset];
        const [rows] = await pool.query(query, finalParams);

        const results = rows.map(row => ({
            id: row.id,
            message: row.message,
            created_at: row.created_at,
            updated_at: row.updated_at,

            receiver: row.receiver_id ? {
                id: row.receiver_id,
                username: row.receiver_username,
                email: row.receiver_email
            } : null,

            sender: row.sender_id ? {
                id: row.sender_id,
                username: row.sender_username,
                email: row.sender_email
            } : null,

            trip: row.trip_id ? {
                id: row.trip_id,
                title: row.trip_title,
                description: row.trip_description,
                origin: row.trip_origin,
                start_date: row.trip_start_date,
                end_date: row.trip_end_date
            } : null,

            group: row.group_id ? {
                id: row.group_id,
                title: row.group_title
            } : null
        }));

        return { total, results, page, per_page, total_pages: Math.ceil(total / per_page) };
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
           `SELECT 

            messages.*,

            receiver.id AS receiver_id,
            receiver.username AS receiver_username,
            receiver.email AS receiver_email,

            sender.id AS sender_id,
            sender.username AS sender_username,
            sender.email AS sender_email,

            trips.id AS trip_id,
            trips.title AS trip_title,
            trips.description AS trip_description,
            trips.origin AS trip_origin,
            trips.start_date AS trip_start_date,
            trips.end_date AS trip_end_date,

            groups1.id AS group_id,
            groups1.title AS group_title

            FROM ${this.tableName} messages

            JOIN users receiver on ( messages.receiver_id = receiver.id )
            JOIN users sender on ( messages.sender_id = sender.id )
            LEFT JOIN trips trips on ( messages.trip_id = trips.id )
            LEFT JOIN users_groups groups1 on ( messages.group_id = groups1.id ) 
             WHERE messages.id = ?`, [id]
        );

        const results = rows.map(row => ({

            id: row.id,
            message: row.message,
            created_at: row.created_at,
            updated_at: row.updated_at,

            receiver: row.receiver_id ? {
                id: row.receiver_id,
                username: row.receiver_username,
                email: row.receiver_email
            } : null,

            sender: row.sender_id ? {
                id: row.sender_id,
                username: row.sender_username,
                email: row.sender_email
            } : null,

            trip: row.trip_id ? {
                id: row.trip_id,
                title: row.trip_title,
                description: row.trip_description,
                origin: row.trip_origin,
                start_date: row.trip_start_date,
                end_date: row.trip_end_date
            } : null,

            group: row.group_id ? {
                id: row.group_id,
                title: row.group_title
            } : null
        }));

        return results || null;
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

        const { message } = data;

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