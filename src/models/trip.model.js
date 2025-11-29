import pool from '../config/db.js';
import BaseModel from './base.model.js';

export class TripModel extends BaseModel {

    static tableName = 'trips';
    static participationTableName = 'participations';

    constructor({
        id, origin, destination, title, description,
        creator_id, start_date, end_date, estimated_cost,
        min_participants, transport, accommodation, itinerary,
        status, latitude, longitude, created_at, updated_at,
        requirements, flights, tickets, visits, full_board,
        travel_insurance, tour_guide, informative_material, breakfast,
        visas, assistance24,
    }) {

        super('trips');

        this.id = id;
        this.origin = origin;
        this.destination = destination;
        this.title = title;
        this.description = description;
        this.creator_id = creator_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.estimated_cost = estimated_cost;
        this.min_participants = min_participants; // Capacity
        this.transport = transport;
        this.accommodation = accommodation;
        this.itinerary = itinerary;
        this.status = status || TRIP_STATUSES.PLANNED;
        this.latitude = latitude;
        this.longitude = longitude;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.requirements = requirements;
        this.flights = flights;
        this.tickets = tickets;
        this.visits = visits;
        this.full_board = full_board;
        this.travel_insurance = travel_insurance;
        this.tour_guide = tour_guide;
        this.informative_material = informative_material;
        this.breakfast = breakfast;
        this.visas = visas;
        this.assistance24 = assistance24;
    }
    //-----------------------
    // Crear nuevo viaje
    //-----------------------
    async createTrip() {
        const { tableName } = TripModel;
        const query = `
        INSERT INTO ${tableName}
        (origin, destination, title, description, creator_id, start_date, end_date, estimated_cost, min_participants, transport, accommodation, 
        itinerary, status, latitude, longitude, requirements, flights, tickets, visits, full_board, travel_insurance,
        tour_guide, informative_material, breakfast, visas, assistance24)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            this.origin, this.destination, this.title, this.description,
            this.creator_id, this.start_date, this.end_date, this.estimated_cost,
            this.min_participants, this.transport, this.accommodation, this.itinerary,
            this.status, this.latitude, this.longitude, this.requirements, this.flights, this.tickets, this.visits, this.full_board,
            this.travel_insurance, this.tour_guide, this.informative_material, this.breakfast,
            this.visas, this.assistance24
        ];

        const [result] = await pool.execute(query, values);
        //--------Recuperar el viaje creado---------
        const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
        return rows[0];
    }

    //-----------------------
    // Obtener viaje por ID
    //-----------------------
    static async getTripById(id) {
        const { tableName } = TripModel;
        const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
        return rows[0] || null;
    }

    //-----------------------
    // Obtener viajes creados por un usuario con sus participantes aceptados
    //-----------------------
static async getMyCreatedTripsWithParticipants(creatorId) {
    const tableName = "trips";
    const participationTableName = "participations";
    const imageTableName = "images"; 
    const ratingsTableName = "ratings";
    const userTableName = "users";

    try {
        const query = `
            SELECT 
                t.id AS trip_id, 
                t.origin, t.destination, t.title, t.description,
                t.creator_id, t.start_date, t.end_date, t.estimated_cost,
                t.min_participants, t.transport, t.accommodation, t.itinerary,
                t.status, t.latitude, t.longitude, t.created_at,
                ti.url AS trip_image_url,
                
                -- Agrupamos los participantes aceptados
                GROUP_CONCAT(
                    CASE 
                        WHEN p.status = 'accepted' THEN 
                            JSON_OBJECT(
                                'id', u.id, 
                                'username', u.username, 
                                'email', u.email,
                                'status', p.status,
                                'is_creator', IF(u.id = t.creator_id, TRUE, FALSE),
                                'participant_image_url', ui.url,
                                'participant_avg_score', (
                                    SELECT AVG(score) 
                                    FROM ${ratingsTableName} r 
                                    WHERE r.rated_user_id = u.id
                                )
                            ) 
                        ELSE NULL 
                    END
                ) AS accepted_participants_json

            FROM 
                ${tableName} t
            LEFT JOIN 
                ${participationTableName} p ON p.trip_id = t.id
            LEFT JOIN 
                ${userTableName} u ON u.id = p.user_id
            LEFT JOIN 
                ${imageTableName} ti ON ti.trip_id = t.id AND ti.main_img = 1
            LEFT JOIN
                ${imageTableName} ui ON ui.user_id = u.id AND ui.main_img = 1
            WHERE 
                t.creator_id = ?
            GROUP BY 
                t.id, t.origin, t.destination, t.title, t.description, 
                t.creator_id, t.start_date, t.end_date, t.estimated_cost,
                t.min_participants, t.transport, t.accommodation, t.itinerary,
                t.status, t.latitude, t.longitude, t.created_at, ti.url
            ORDER BY 
                t.created_at DESC
        `;
        
        const [rows] = await pool.query(query, [creatorId]);

        // ... El procesamiento JS (map, JSON.parse, delete)
        const tripsWithParticipants = rows.map(trip => {
            let allParticipants = [];
            let acceptedParticipants = [];
            
            const rawJsonString = trip.accepted_participants_json;
            if (rawJsonString && rawJsonString.length > 0) {
                try {
                    if (rawJsonString.includes('},{')) {
                    allParticipants = JSON.parse(`[${rawJsonString}]`);
                    } else {
                    acceptedParticipants = [JSON.parse(rawJsonString)];
                    }    
                } catch (e) { 
                    console.warn("Fallo al parsear JSON de participantes para el viaje:", trip.trip_id, e);   
                }
            }    
            delete trip.all_participants_json; 
                
            const currentParticipantsCount = acceptedParticipants.length;

            return {
                ...trip,
                all_related_participants: acceptedParticipants,
                current_participants: currentParticipantsCount,
                capacity: trip.min_participants
            };
        });

        return tripsWithParticipants;

    } catch (error) {
        console.error('Error en TripModel.getMyCreatedTripsWithParticipants:', error);
        throw error;
    } 
}       
    //------------------------
    // Funcionalidad para verificar si el usuario es el creador del viaje
    //------------------------
    static async isTripCreator(tripId, userId) {
        const [rows] = await pool.query(
            `SELECT id FROM ${this.tableName} WHERE id = ? AND creator_id = ?`,
            [tripId, userId]
        );
        return rows.length > 0;
    }
    //-----------------------
    // Funcionalidad para obtener la capacidad del viaje y conteo de participantes de un viaje
    //-----------------------
    static async getCapacityAndParticipantsCount(tripId) {
        const [rows] = await pool.query(
            `SELECT
                t.min_participants AS capacity,
                t.creator_id,
                (
                    SELECT COUNT(p.id)
                    FROM ${this.participationTableName} p
                    WHERE p.trip_id = t.id AND p.status = 'accepted' AND p.user_id != t.creator_id
                ) AS accepted_participants_excluding_creator
            FROM ${this.tableName} t
            WHERE t.id = ?`,
            [tripId]
        );

        if (rows.length === 0) return null;
        const result = rows[0];
        result.current_participants = result.accepted_participants_excluding_creator + 1; // +1 por el creador
        delete result.accepted_participants_excluding_creator;
        return result;
    }
    //--------------------------------------------------------------------------
    //Verificar si hay superposición de fechas para un usuario creado o apuntado
    //--------------------------------------------------------------------------
    static async hasDateOverlap(userId, startDate, endDate, excludeTripId = null) {
        const { tableName, participationTableName } = TripModel;
        //Logica de la función es A <= Y AND X <= B
        const overlapCondiction = `
        (t.start_date <= ? AND t.end_date >= ?)
        `;

        let excludeClause = '';
        if (excludeTripId) {
            excludeClause = 'AND t.id != ?';
        }
        
        const query = `
        SELECT t.id FROM ${tableName} t
        WHERE
        (
            (t.creator_id = ? AND ${overlapCondiction})
            OR
            (t.id IN (
                SELECT p.trip_id 
                FROM ${participationTableName} p 
                WHERE p.user_id = ? AND p.status = 'accepted'
            ) AND ${overlapCondiction})
        )
            ${excludeClause}
        LIMIT 1
        `;
// Se duplican los parámetros de fechas para ambas condiciones (creador y participante)
        const finalQueryParameters = [
            userId,
            endDate,
            startDate,
            userId,
            endDate,
            startDate,
            ...(excludeTripId ? [excludeTripId] : []),
        ];

        const [rows] = await pool.query(query, finalQueryParameters);

        return rows[0] ? rows[0].id : null;
    }
    //-----------------------
    // Buscar, filtrar y paginar viajes
    //-----------------------
    static async searchTrips(filters = {}) {
        const { tableName } = TripModel;
        const page = parseInt(filters.page) || 1;
        const per_page = parseInt(filters.per_page) || 10;
        const offset = (page - 1) * per_page;

        let where = 'WHERE 1=1';
        const params = [];

        if (filters.creator_id) {
            where += ' AND creator_id = ?';
            params.push(filters.creator_id);
        }
        if (filters.status) {
            where += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters.destination) {
            where += ' AND destination LIKE ?';
            params.push(`%${filters.destination}%`);
        }
        //-------Contar el total de registros que cumplen con los filtros------
        const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM ${tableName} ${where}`, params);
        const total = countRows[0].total;

        //-------Recuperar los registros con paginación------
        let query = `
        SELECT * FROM ${tableName}
        ${where}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `;
        const queryParams = [...params, per_page, offset];

        const [rows] = await pool.query(query, queryParams);

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
        const { tableName } = TripModel;
        const setClauses = [];
        const values = [];
        // Protecciones de seguridad
        delete updatedData.id;
        delete updatedData.creator_id;
        delete updatedData.created_at;

        for (const key in updatedData) {
            if (updatedData.hasOwnProperty(key)) {
                setClauses.push(`${key} = ?`);
                values.push(updatedData[key]);
            }
        }

        if (setClauses.length === 0) return null;
        values.push(id);

        const query = `
        UPDATE ${tableName}
        SET ${setClauses.join(', ')}, updated_at = NOW()
        WHERE id = ?
        `;

        const [result] = await pool.query(query, values);
        if (result.affectedRows === 0) return null;
        //--------Recuperar el viaje actualizado---------
        const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
        return rows[0];
    }

    //-----------------------
    // Eliminar viaje
    //-----------------------
    static async deleteTrip(id) {
        const { tableName } = TripModel;
        const [result] = await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
}
