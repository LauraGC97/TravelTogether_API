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
    static async #findByPk(id) {
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
 // READ: Obtener participación por ID
 //-----------------------
 static async getParticipationById(id) {
 // Usamos la función interna para obtener el objeto plano
 return await this.#findByPk(id); 
 }
 // Buscar participaciones por tripId y userId
 static async getParticipationsByTripAndUser(tripId, userId) {
 const [rows] = await pool.query(
 `SELECT * FROM ${this.tableName} WHERE trip_id = ? AND user_id = ?`,
 [tripId, userId]
 );
 return rows[0] || null;
 }
 // Obtener todas las participaciones de un viaje
 static async getParticipationsByTripId(tripId) {

  const sqlQuery = `SELECT * FROM ${this.tableName} WHERE trip_id = ?` ;

 const [rows] = await pool.query(
 `SELECT * FROM ${this.tableName} WHERE trip_id = ?`,
 [tripId]
 );

 console.log(sqlQuery);

 return rows;
 }

 //-----------------------
 // UPDATE: Actualizar el estado de una participación por ID (Nuevo - Usado en el controlador)
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
 // UPDATE: Actualizar el estado de una participación (por tripId y userId) (Original)
 // Se mantiene por compatibilidad.
 //-----------------------
 static async updateParticipationStatus(tripId, userId, newStatus) {
 const [result] = await pool.query(
 `UPDATE ${this.tableName} 
 SET status = ?, response_date = CURRENT_TIMESTAMP() 
 WHERE trip_id = ? AND user_id = ?`,
 [newStatus, tripId, userId]
 );
 // Si se actualizó alguna fila, devolver la participación actualizada
 if (result.affectedRows === 0) return null;

 return await this.getParticipationsByTripAndUser(tripId, userId);
 }

 //-----------------------
 // DELETE: Eliminar una participación específica por ID (Nuevo - Usado en el controlador)
 //-----------------------
 static async removeParticipationById(id) {
 const [result] = await pool.query(
 `DELETE FROM ${this.tableName} WHERE id = ?`,
 [id]
);
 return result.affectedRows > 0;
 }
 
 //-----------------------
 // DELETE: Eliminar una participación específica (Original)
 //-----------------------
static async removeParticipation(tripId, userId) {
 const [result] = await pool.query(
 `DELETE FROM ${this.tableName} WHERE trip_id = ? AND user_id = ?`,
 [tripId, userId]
 );
 return result.affectedRows > 0;
 }
}