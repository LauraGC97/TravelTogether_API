import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Token malformed.' });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET no está configurada en .env');
      return res.status(500).json({ message: 'Configuración del servidor incompleta.' });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Token inválido o expirado.' });

      req.user = decoded;
      next();
    });

  } catch (error) {

    logger.error('Error en verifyToken:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};