import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// const { User } = require('../models');

const register = async (req, res) => {

  try {
    const { username, email, password, image, phone, bio, interests } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email y password son obligatorios.' });
    }

    const existingUser = await UserModel.findByEmailOrUsername(email, username);
    if (existingUser) {
      return res.status(409).json({ message: 'El email o el nombre de usuario ya están registrados.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      username,
      email,
      password: hashedPassword,
      image,
      phone,
      bio,
      interests
    });

    const newUser = await user.createUser();

    res.status(201).json({
      message: 'Usuario registrado correctamente.',
      user: newUser
    });

  } catch (error) {
    console.error('Error en registerUser:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

const login = async (req, res) => {

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son obligatorios.' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }
    
    // Cargamos los valores desde nuestras variables de entorno
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '2h'; 
    
    if (!secret) {
      console.error('JWT_SECRET no está configurada en .env');
      return res.status(500).json({ message: 'Configuración del servidor incompleta.' });
    }    

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      secret, 
      { expiresIn }
    );

    // No enviamos el hash de password
    delete user.password;

    res.status(200).json({
      message: 'Login correcto.',
      token,
      user
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }

};

export { register, login };