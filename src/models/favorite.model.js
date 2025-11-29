import pool from '../config/db.js';
import BaseModel from './base.model.js';

export class FavoritesModel extends BaseModel {

    static tableName = 'favorites';

    constructor({ id, user_id, trip_id, created_at }) {

        super('favorites');

        this.id = id;
        this.user_id = user_id;
        this.trip_id = trip_id;
        this.created_at = created_at;

    }

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

            favorites.*,

            users.id AS users_id,
            users.username AS users_username,
            users.email AS users_email,

            trips.id AS trip_id,
            trips.title AS trip_title,
            trips.description AS trip_description,
            trips.origin AS trip_origin,
            trips.start_date AS trip_start_date,
            trips.end_date AS trip_end_date

            FROM ${this.tableName} favorites

            JOIN users users on ( favorites.user_id = users.id )
            LEFT JOIN trips trips on ( favorites.trip_id = trips.id )

            ${whereClause}

            ORDER BY favorites.id DESC
            LIMIT ? OFFSET ?`;

        const finalParams = [...queryParams, per_page, offset];
        const [rows] = await pool.query(query, finalParams);

        const results = rows.map(row => ({

            id: row.id,
            user_id: row.user_id,
            trips_id: row.trip_id,
            created_at: row.created_at,

            user: row.users_id ? {
                id: row.users_id,
                username: row.users_username,
                email: row.users_email
            } : null,

            trip: row.trip_id ? {
                id: row.trip_id,
                title: row.trip_title,
                description: row.trip_description,
                origin: row.trip_origin,
                start_date: row.trip_start_date,
                end_date: row.trip_end_date
            } : null,

        }));

        return { total, results, page, per_page, total_pages: Math.ceil(total / per_page) };
    }


    static async getFavoritesById(id, field) {

        const [rows] = await pool.query(
            `SELECT 

            favorites.*,

            users.id AS users_id,
            users.username AS users_username,
            users.email AS users_email,

            trips.id AS trip_id,
            trips.title AS trip_title,
            trips.description AS trip_description,
            trips.origin AS trip_origin,
            trips.start_date AS trip_start_date,
            trips.end_date AS trip_end_date

            FROM ${this.tableName} favorites

            JOIN users users on ( favorites.user_id = users.id )
            LEFT JOIN trips trips on ( favorites.trip_id = trips.id )

             WHERE favorites.${field} = ?`, [id]
        );

        const results = rows.map(row => ({

            id: row.id,
            user_id: row.user_id,
            trips_id: row.trip_id,
            created_at: row.created_at,

            user: row.users_id ? {
                id: row.users_id,
                username: row.users_username,
                email: row.users_email
            } : null,

            trip: row.trip_id ? {
                id: row.trip_id,
                title: row.trip_title,
                description: row.trip_description,
                origin: row.trip_origin,
                start_date: row.trip_start_date,
                end_date: row.trip_end_date
            } : null,

        }));

        return results || null;
    }

    static async createfavorite(user_id, trip_id) {

        const [result] = await pool.query(
            `INSERT INTO favorites ( user_id, trip_id)
       VALUES (?, ?)`,
            [user_id, trip_id]
        );

        // Recuperamos el usuario recién creado para enviarlo al Front
        const [rows] = await pool.query(
            ` SELECT id, user_id, trip_id, created_at
              FROM favorites 
              WHERE id = ?`,
            [result.insertId]
        );

        return rows[0];
    }

}