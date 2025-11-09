import pool from '../config/db.js';
import BaseModel from './base.model.js';

export class TripModel extends BaseModel {
    
    static tableName = 'trips' ;

    constructor({
        id, origin, destination, title, description,
        creator_id, start_date, end_date, estimated_cost,
        min_participants, transport, accommodation, itinerary,
        status, latitude, longitude, created_at, updated_at,
    }) {
        
        super();

        this.id = id;
        this.origin = origin;
        this.destination = destination;
        this.title = title;
        this.description = description;
        this.creator_id = creator_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.estimated_cost = estimated_cost;
        this.min_participants = min_participants;
        this.transport = transport;
        this.accommodation = accommodation;
        this.itinerary = itinerary;
        this.status = status || 'planned';
        this.latitude = latitude;
        this.longitude = longitude;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
    //-----------------------
    // Crear nuevo viaje
    //-----------------------
    async createTrip() {
        const query = `
        INSERT INTO ${TripModel.tableName}
        (origin, destination, title, description, creator_id, start_date, end_date, estimated_cost,
        min_participants, transport, accommodation, itinerary, status, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const values = [
        this.origin, this.destination, this.title, this.description,
        this.creator_id, this.start_date, this.end_date, this.estimated_cost,
        this.min_participants, this.transport, this.accommodation, this.itinerary,
        this.status, this.latitude, this.longitude
    ];
    
    const [result] = await pool.execute(query, values);
    //--------Recuperar el viaje creado---------
    const [rows] = await pool.execute(`SELECT * FROM ${TripModel.tableName} WHERE id = ?`, [result.insertId]);
    return rows[0];
    }

    //-----------------------
    // Obtener viaje por ID
    //-----------------------
    static async getTripById(id) {
        const [rows] = await pool.query(`SELECT * FROM ${TripModel.tableName} WHERE id = ?`, [id]);
        return rows[0] || null;
    }

    //-----------------------
    // Buscar, filtrar y paginar viajes
    //-----------------------
    static async searchTrips(filters = {}) {
        const page = parseInt(filters.page) || 1;
        const per_page = parseInt(filters.per_page) || 10;
        const offset = (page - 1) * per_page;

        let where = 'WHERE 1=1';
        const params = [];

        if (filters.creatorID) {
            where += ' AND creator_id = ?';
            params.push(filters.creatorID);
        }
        if (filters.status) {
            where += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters.destination){
            where += ' AND destination LIKE ?';
            params.push(`%${filters.destination}%`);
        }
        //-------Contar el total de registros que cumplen con los filtros------
        const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM ${TripModel.tableName} ${where}`, params);
        const total = countRows[0].total;

        //-------Recuperar los registros con paginación------
        let query = `
        SELECT * FROM ${this.tableName}
        ${where}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `;
        params.push(per_page, offset);

        const [rows] = await pool.query(query, params);

        return {
            total,
            trips: rows,
            page,
            per_page
        };
    }
    
    //-----------------------
    // Actualizar viaje
    //-----------------------
    static async updateTrip(id, updatedData) {
        const setClauses = [];
        const values = [];
        
        for (const key in updatedData) {
            if (updatedData.hasOwnProperty(key)) {
            setClauses.push(`${key} = ?`);
            values.push(updatedData[key]);
            }
        }

        if (setClauses.length === 0) return null;
        values.push(id);

        const query = `
        UPDATE ${this.tableName}
        SET ${setClauses.join(', ')}, updated_at = NOW()
        WHERE id = ?
        `;

        const [result] = await pool.query(query, values);
        if (result.affectedRows === 0) return null;
        //--------Recuperar el viaje actualizado---------
        const [rows] = await pool.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
        return rows[0];
    }

    //-----------------------
    // Eliminar viaje
    //-----------------------
    static async deleteTrip(id) {
        const [result] = await pool.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
}
    