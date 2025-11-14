import pool from '../config/db.js';

export class UserModel extends BaseModel {

    static tableName = 'images';

    constructor({ description, url, trip_id, user_id, main_img }) {

        super('users');

        this.description = description;
        this.url = url;
        this.trip_id = trip_id;
        this.user_id = user_id;
        this.main_img = main_img ?? 0;
    }

    static async insert(image) {

        const sql = `INSERT INTO images ( description, url, trip_id, user_id, main_img )
               VALUES (?, ?, ?, ?, ?)`;
        const params = [ description, url, trip_id, user_id, main_img ];
        const [result] = await pool.execute(sql, params);

        return { id: result.insertId, ...image };
    };

    static async getById(id) {
        const sql = `SELECT * FROM images WHERE id = ?`;
        const [rows] = await pool.execute(sql, [id]);
        return rows[0];
    };
}
