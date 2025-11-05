import pool from '../config/db.js';

export default class BaseModel {
    static tableName = '';

    // contar registros (con búsqueda opcional)
    static async count(searchField = '', searchValue = '') {
        let query = `SELECT COUNT(*) AS total FROM ${this.tableName}`;
        const params = [];

        if (searchField && searchValue) {
            query += ` WHERE ${searchField} LIKE ?`;
            params.push(`%${searchValue}%`);
        }

        const [rows] = await pool.query(query, params);
        return rows[0].total;
    }

    // obtener registros con paginación, búsqueda y orden
    static async getPaginated({
        page = 1,
        per_page = 10,
        searchField = '',
        searchValue = '',
        sort = 'id',
        order = 'ASC'
    } = {}) {
        const offset = (page - 1) * per_page;
        const params = [];
        let where = '';

        if (searchField && searchValue) {
            where = `WHERE ${searchField} LIKE ?`;
            params.push(`%${searchValue}%`);
        }

        const query = `
            SELECT * FROM ${this.tableName}
            ${where}
            ORDER BY ${sort} ${order}
            LIMIT ? OFFSET ?
        `;
        params.push(per_page, offset);

        // 👇 Diagnóstico
        console.log('📘 [BaseModel.getPaginated]');
        console.log('🔹 table:', this.tableName);
        console.log('🔹 query:', query.trim());
        console.log('🔹 params:', params);
        console.log('🔹 page:', page, 'per_page:', per_page, 'offset:', offset);

        const [rows] = await pool.query(query, params);

        return rows;
    }

    static async getAll() {
        const [rows] = await pool.query(`SELECT * FROM ${this.tableName}`);
        return rows;
    }
}