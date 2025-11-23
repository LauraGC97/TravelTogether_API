import { FavoritesModel } from '../models/favorites.model.js';

/*
  GET /api/users
  Opcional: ?page=1&per_page=10 para paginado.
  Respuesta: { page, per_page, total, total_pages, results: [...] }
*/
const getAllFavorites = async (req, res) => {
    try {

        // Leemos parametros de paginación de query
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
        const search = req.query.search || '';

        // Tambien podriamos serializarlo, pero para pruebas lo dejo así 
        // const { page = 1, per_page = 10, search = '' } = req.query;

        const offset = (page - 1) * per_page;

        // Obtener total de registros y datos paginados
        const total = await FavoritesModel.count('id',search);  
        // const results = await UserModel.getPaginated(offset, per_page);

        const results = await FavoritesModel.getPaginated({
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
        console.error('Error en getAllFavorites:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getFavoritesById = async (req, res) => {
    try {
        const { idFavorites } = req.params;

        const favorites = await FavoritesModel.getFavoritesById(idFavorites);

        if (!favorites) {
            return res.status(404).json({ message: 'Favoritos no encontrados.' });
        }

        res.status(200).json(favorites);
        
    } catch (error) {
        console.error('Error en getFavoritesById:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const createFavorites = async (req, res) => {
    try {
        const { idFavorites } = req.params;
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

const updateFavoritesById = async (req, res) => {
    try {
        const { idFavorites } = req.params;
        const { userId, role } = req.user;

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

const deleteFavoritesById = async (req, res) => {
    try {
        const { idFavorites } = req.params;
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

export { getAllFavorites,getFavoritesById,createFavorites,deleteFavoritesById,updateFavoritesById };