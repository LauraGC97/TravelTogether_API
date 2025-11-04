import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });

    // header esperado: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Token malformed.' });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET no está configurada en .env');
      return res.status(500).json({ message: 'Configuración del servidor incompleta.' });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Token inválido o expirado.' });
      // guardamos datos del usuario en req.user para accesos posteriores
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error('Error en verifyToken:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};