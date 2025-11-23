import pool from '../config/db.js';
import BaseModel from './base.model.js';

export class UserModel extends BaseModel {
    
    static tableName = 'users' ;

    constructor({ id, username, email, password, image, phone, bio, interests, role, created_at, updated_at, is_active }) {
        
        super('users');

        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.image = image;
        this.phone = phone;
        this.bio = bio;
        this.interests = interests;
        this.role = role || 'user';
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_active = is_active ?? 1;
    }

    // Buscar por email o username
    static async findByEmailOrUsername(email, username) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await pool.query(
            `SELECT id, username, email, password, image, phone, bio, interests, role, is_active, created_at, updated_at
     FROM users WHERE email = ?`,
            [email]
        );
        return rows[0];
    }

    // Insertar nuevo usuario
    async createUser() {
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password, image, phone, bio, interests, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [this.username, this.email, this.password, this.image, this.phone, this.bio, this.interests, this.role]
        );

        // Recuperamos el usuario recién creado para enviarlo al Front
        const [rows] = await pool.query(
            'SELECT id, username, email, image, phone, bio, interests, role, created_at, updated_at, is_active FROM users WHERE id = ?',
            [result.insertId]
        );

        return rows[0];
    }

    static async getUserById(id) {
        const [rows] = await pool.query(
            `SELECT id, username, email, image, phone, bio, interests, role, is_active, created_at, updated_at
     FROM users WHERE id = ?`, [id]
        );
        return rows[0] || null;
    }

    static async updateUser(id, data) {
        const { username, email, image, phone, bio, interests, role, is_active } = data;

        const [result] = await pool.query(
            `UPDATE users 
       SET username = ?, email = ?, image = ?, phone = ?, bio = ?, interests = ?, role = ?, is_active = ?
       WHERE id = ?`,
            [username, email, image, phone, bio, interests, role, is_active, id]
        );

        if (result.affectedRows === 0) return null;

        const [rows] = await pool.query(
            'SELECT id, username, email, image, phone, bio, interests, role, is_active FROM users WHERE id = ?',
            [id]
        );

        return rows[0];
    }

    static async deleteUser(id) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

}