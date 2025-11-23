import pool from '../config/db.js';
import BaseModel from './base.model.js';

export class FavoritesModel extends BaseModel {
    
    static tableName = 'favorites' ;

    constructor({ id, user_id, trip_id, created_at }) {
        
        super('favorites');

        this.id = id;
        this.user_id = user_id;
        this.trip_id = trip_id;
        this.created_at = created_at;

    }
//añadir delete;update y añadir users y trips para ver descripcion del viaje y nombre del usuario
    static async getFavoritesById(idFavorites) {
        const [rows] = await pool.query(
            `SELECT * FROM favorites f inner join users u on ( f.user_id = u.id ) WHERE f.id = ?`,
            [idFavorites]
        );
        return rows[0];
    }

    static async createfavorite(user_id, trip_id) {

        const [result] = await pool.query(
            `INSERT INTO favorites ( user_id, trip_id)
       VALUES (?, ?)`,
            [user_id,trip_id]
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