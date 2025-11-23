import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

export const getUserFromToken = (authHeader) => {

  return new Promise((resolve, reject) => {

    if (!authHeader) {
      return reject(new Error('Authorization header missing'));
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return reject(new Error('Authorization header malformed'));
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error('JWT_SECRET no está configurada en .env');
      return reject(new Error('Server configuration incomplete'));
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(new Error('Token inválido o expirado'));

      // Devuelve solo los campos que necesitas
      const userData = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      };

      resolve(userData);
    });
  });
};