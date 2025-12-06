export function validateEmail(req, res, next) {
    
    const email = req.body.email;

    if (!email) {
        return res.status(400).json({
            message: "El campo 'email' es obligatorio."
        });
    }

    // regex válida internacional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: "Formato de email inválido."
        });
    }

    next();
}