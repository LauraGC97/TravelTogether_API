import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

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

        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '2h';

        if (!secret) {
            logger.error('JWT_SECRET no está configurada en .env');
            return res.status(500).json({ message: 'Configuración del servidor incompleta.' });
        }

        const token = jwt.sign(
            {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            },
            secret,
            { expiresIn }
        );

        delete newUser.password;

        console.log(token);

        res.status(201).json({
            message: 'Usuario registrado correctamente.',
            token,
            user: newUser
        });

    } catch (error) {
        logger.error('Error en registerUser:', error);
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
            logger.error('JWT_SECRET no está configurada en .env');
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
        logger.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
    }

};

/*
  GET /api/users
  Opcional: ?page=1&per_page=10 para paginado.
  Respuesta: { page, per_page, total, total_pages, results: [...] }
*/
const getAllUsers = async (req, res) => {
    try {

        // Leemos parametros de paginación de query
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
        const search = req.query.search || '';

        // Tambien podriamos serializarlo, pero para pruebas lo dejo así 
        // const { page = 1, per_page = 10, search = '' } = req.query;

        const offset = (page - 1) * per_page;

        // Obtener total de registros y datos paginados
        const total = await UserModel.count('username', search);
        // const results = await UserModel.getPaginated(offset, per_page);

        const results = await UserModel.getPaginated({
            page: parseInt(page),
            per_page: parseInt(per_page),
            searchField: 'username',
            searchValue: search
        });

        // Calcular páginas totales
        const total_pages = Math.ceil(total / per_page);

        // Devolvemos respuesta
        res.status(200).json({
            page,
            per_page,
            total,
            total_pages,
            results
        });

    } catch (error) {
        logger.error('Error en getAllUsers:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { idUser } = req.params;

        const user = await UserModel.getUserById(idUser);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json(user);
    } catch (error) {
        logger.error('Error en getUserById:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { idUser } = req.params;
        const { userId, role } = req.user;

        /*
        // Permitir solo al propio usuario o admin
        if (parseInt(userId) !== parseInt(id) && role !== 'admin') {
          return res.status(403).json({ message: 'No tienes permiso para actualizar este usuario.' });
        }
        */

        const updatedUser = await UserModel.updateUser(idUser, req.body);
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({
            message: 'Usuario actualizado correctamente.',
            user: updatedUser
        });

    } catch (error) {
        logger.error('Error en updateUser:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { idUser } = req.params;
        const { userId, role } = req.user;

        /*
        // Permitir solo al propio usuario o admin
        if (parseInt(userId) !== parseInt(id) && role !== 'admin') {
          return res.status(403).json({ message: 'No tienes permiso para eliminar este usuario.' });
        }
        */

        const deleted = await UserModel.deleteUser(idUser);
        if (!deleted) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        logger.error('Error en deleteUser:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export { register, login, getAllUsers, getUserById, updateUser, deleteUser };