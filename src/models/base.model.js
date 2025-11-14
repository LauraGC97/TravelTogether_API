import pool from '../config/db.js';

export default class BaseModel {

    static tableName = '';

    static async count(whereClause = '', params = []) {

        let query = `SELECT COUNT(*) AS total FROM ${this.tableName} ${whereClause}`;

        const [rows] = await pool.query(query, params);
        return rows[0].total;
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
            SELECT * FROM ${this.tableName}
            ${whereClause}
            ORDER BY ${sort} ${order}
            LIMIT ? OFFSET ?`;

        const finalParams = [...queryParams, per_page, offset];

        const [rows] = await pool.query(query, finalParams);

        return { total, results: rows, page, per_page, total_pages: Math.ceil(total / per_page) };
    }

    static async getAll() {
        const [rows] = await pool.query(`SELECT * FROM ${this.tableName}`);
        return rows;
    }
}