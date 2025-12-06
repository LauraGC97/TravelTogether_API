export function validateInteger(paramName) {
    return (req, res, next) => {
        const value = req['params'][paramName];

        if (value === undefined) {
            return res.status(400).json({
                message: `El parámetro '${paramName}' es obligatorio.`
            });
        }

        // parseamos a entero
        const parsed = parseInt(value, 10);

        if (isNaN(parsed)) {
            return res.status(400).json({
                message: `El parámetro '${paramName}' debe ser un número entero.`
            });
        }

        // reemplazamos el valor original por el entero
        req['params'][paramName] = parsed;

        next();
    };
}