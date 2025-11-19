import pool from '../config/db.js';
import BaseModel from './base.model.js';

export class RatingModel extends BaseModel {

    static tableName = 'ratings';

    constructor({ id, trip_id, author_id, rated_user_id, score, comment, created_at }) {

        super('ratings');

        this.id = id;
        this.trip_id = trip_id;
        this.author_id = author_id;
        this.rated_user_id = rated_user_id;
        this.score = score;
        this.comment = comment;
        this.created_at = created_at;

    }

    // Insertar nuevo usuario
    async createRating() {

        const [result] = await pool.query(
            `INSERT INTO ratings (trip_id, author_id, rated_user_id, score, comment)
       VALUES (?, ?, ?, ?, ? )`,
            [this.trip_id, this.author_id, this.rated_user_id, this.score, this.comment]
        );

        // Recuperamos el usuario recién creado para enviarlo al Front
        const [rows] = await pool.query(
            'SELECT id, trip_id, author_id, rated_user_id, score, comment, created_at FROM ratings WHERE id = ?',
            [result.insertId]
        );

        return rows[0];
    }

    static async getRatingById(id) {
        const [rows] = await pool.query(
            `SELECT id, trip_id, author_id, rated_user_id, score, comment, created_at 
     FROM ratings WHERE id = ?`, [id]
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
    
    static async updateRatingById(id, data) {

        const { score, comment } = data;

        const [result] = await pool.query(
            `UPDATE ratings 
             SET  score = ?, comment = ?
             WHERE id = ?`,
            [score, comment, id]
        );

        if (result.affectedRows === 0) return null;

        const [rows] = await pool.query(
            'SELECT id, trip_id, author_id, rated_user_id, score, comment, created_at FROM ratings WHERE id = ?',
            [id]
        );

        return rows[0];
    }

    static async deleteRating(id) {
        const [result] = await pool.query('DELETE FROM ratings WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

}