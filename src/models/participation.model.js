import pool from "../config/db.js";
import BaseModel from "./base.model.js";

export class ParticipationModel extends BaseModel {
 static tableName = "participations";
 
 constructor({ id, trip_id, user_id, status, request_date, response_date }) {
 super("participations");
 this.id = id;
 this.trip_id = trip_id;
  this.user_id = user_id;
 this.status = status || "pending";
 this.request_date = request_date;
 this.response_date = response_date;
 }

    // Función interna para buscar por ID, usada por las funciones estáticas
    static async _findByPk(id) {
        const [rows] = await pool.query(
          `SELECT * FROM ${ParticipationModel.tableName} WHERE id = ? LIMIT 1`,
          [id]
        );

        if (rows.length === 0) return null;
        return rows[0]; // Devolvemos el objeto plano
    }

 //-----------------------
 // CREATE: Añadir un usuario como participante a un viaje
//-----------------------
 async createParticipation() {
 const [result] = await pool.query(
 `INSERT INTO ${ParticipationModel.tableName} (trip_id, user_id, status) VALUES (?, ?, ?)`,
[this.trip_id, this.user_id, this.status]
 );

 return await ParticipationModel.getParticipationById(result.insertId);
 }

 //-----------------------
 // GET: Obtener una participación por ID
 //-----------------------
 static async getParticipationById(id) {
 // Usamos la función interna para obtener el objeto plano
 return await this._findByPk(id); 
 }
 // Buscar participaciones por tripId y userId
 static async getParticipationsByTripAndUser(tripId, userId) {
 const [rows] = await pool.query(
 `SELECT * FROM ${this.tableName} WHERE trip_id = ? AND user_id = ?`,
 [tripId, userId]
 );
 return rows[0] || null;
 }
 //-----------------------
 // Obtener todas las participaciones de un viaje con detalles del participante
 //-----------------------
static async getParticipationsByTripId(tripId) {
const userTableName = "users";
const imageTableName = "images";

 const [rows] = await pool.query(
    `SELECT
    p.id AS participation_id,
        p.status,
        p.request_date,
        p.response_date,
        u.id AS user_id,
        u.username,
        u.email,
        ui.url AS user_image_url,
        (
            SELECT AVG(score) 
            FROM ratings 
            WHERE rated_user_id = u.id
        ) AS user_avg_score
    FROM 
        ${this.tableName} p
    JOIN
        ${userTableName} u ON p.user_id = u.id
    LEFT JOIN
        ${imageTableName} ui ON ui.user_id = u.id AND ui.main_img = 1 -- Imagen principal del Participante
    WHERE 
        p.trip_id = ?
    ORDER BY p.status DESC, p.request_date ASC`,
    [tripId]
    );

    return rows;
}

 //-----------------------
 //Obtener todas las participaciones del usuario con detalles del viaje
 //-----------------------
 static async getParticipationsWithTripDetailsByUserId(userId) {
 const [rows] = await pool.query(
 `SELECT 
  p.id AS participation_id,
  p.status,
  p.request_date,
  p.response_date,
  t.id AS trip_id,
  t.title AS trip_name,
  t.origin,
  t.destination,
  t.start_date,
  t.end_date,
  t.creator_id,
  ti.url AS trip_image_url,
  ui.url AS creator_image_url,
  (
 SELECT AVG(score) 
 FROM ratings
 WHERE rated_user_id = t.creator_id
 ) AS creator_avg_score
FROM 
  participations p
JOIN 
 trips t ON p.trip_id = t.id
LEFT JOIN 
 images ti ON ti.trip_id = t.id AND ti.main_img = 1 -- Imagen principal del Viaje
LEFT JOIN
 images ui ON ui.user_id = t.creator_id AND ui.main_img = 1 -- Imagen principal del Creador del Viaje
WHERE 
 p.user_id = ?
`,
[userId]
);
return rows;
}

//-----------------------
// GET: Obtener las solicitudes pendientes en los viajes creados por un usuario
//-----------------------
static async getPendingRequestsForCreator(creatorId) {
const [rows] = await pool.query(
`SELECT
 p.id AS participation_id,
 p.status,
 p.request_date,
 p.response_date,
 t.id AS trip_id,
 t.title AS trip_name,
 u.id AS participant_user_id,
 u.username AS participant_username,
 u.email AS participant_email,
 ti.url AS trip_image_url,
 ui.url AS participant_image_url,
 (
 SELECT AVG(score) 
 FROM ratings 
 WHERE rated_user_id = p.user_id
 ) AS participant_avg_score
FROM 
 participations p
JOIN 
 trips t ON p.trip_id = t.id
JOIN
 users u ON p.user_id = u.id
LEFT JOIN 
 images ti ON ti.trip_id = t.id AND ti.main_img = 1 -- Imagen principal del Viaje
LEFT JOIN
 images ui ON ui.user_id = p.user_id AND ui.main_img = 1 -- Imagen principal del Participante
WHERE 
 t.creator_id = ? AND p.status = 'pending'
`,
[creatorId]
);
return rows;
}


 //-----------------------
 // UPDATE: Actualizar el estado de una participación por ID
 //-----------------------
 static async updateParticipationStatusById(id, newStatus) {
 const [result] = await pool.query(
 `UPDATE ${this.tableName} 
 SET status = ?, response_date = CURRENT_TIMESTAMP() 
 WHERE id = ?`,
 [newStatus, id]
 );
// Si se actualizó alguna fila, devolver la participación actualizada
if (result.affectedRows === 0) return null;

 return await this.getParticipationById(id);
 }
 
 //-----------------------
 // DELETE: Eliminar una participación específica por ID
 //-----------------------
 static async removeParticipationById(id) {
 const [result] = await pool.query(
 `DELETE FROM ${this.tableName} WHERE id = ?`,
 [id]
);
 return result.affectedRows > 0;
 }
 
 //-----------------------
 // DELETE: Eliminar una participación específica
 //-----------------------
static async removeParticipation(tripId, userId) {
 const [result] = await pool.query(
 `DELETE FROM ${this.tableName} WHERE trip_id = ? AND user_id = ?`,
 [tripId, userId]
 );
 return result.affectedRows > 0;
 }
}