import pool from '../config/db.js';
import BaseModel from './base.model.js';

export default class ImagesModel extends BaseModel {

    static tableName = 'images';

    constructor({ description, url, trip_id, user_id, main_img }) {

        super('images');

        this.description = description;
        this.url = url;
        this.trip_id = trip_id;
        this.user_id = user_id;
        this.main_img = main_img ?? 0;
    }

    static async insert(image) {

        const sql = `INSERT INTO images ( description, url, trip_id, user_id, main_img )
               VALUES (?, ?, ?, ?, ?)`;

        const params = [
            image.description,
            image.url,
            image.trip_id,
            image.user_id,
            image.main_img ?? 0
        ];

        const [result] = await pool.execute(sql, params);

        return { id: result.insertId, ...image };
    };

    static async getById(id) {
        const sql = `SELECT * FROM images WHERE id = ?`;
        const [rows] = await pool.execute(sql, [id]);
        return rows[0];
    };

    static async getByIdTrip(id) {
        const sql = `SELECT * FROM images WHERE trip_id = ?`;
        const [rows] = await pool.execute(sql, [id]);
        return rows[0];
    };

    static async getByIdTrip({
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


    static async getByIdUser(id) {
        const sql = `SELECT * FROM images WHERE user_id = ?`;
        const [rows] = await pool.execute(sql, [id]);
        return rows[0];
    };

    static async deleteById(id) {
        
        const row = await this.getById(id);
        if (!row) return null;

        const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        await pool.execute(sql, [id]);

        return row;
    }
}
