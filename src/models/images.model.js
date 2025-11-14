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
}
