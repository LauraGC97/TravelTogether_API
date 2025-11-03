import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// const { User } = require('../models');

const register = (req, res) => {

    req.body.password = bcrypt.hashSync(req.body.password, 8);
    try {

        // const user = await User.create(req.body);
        res.json('funciona');

    } catch (error) {
        res.status(400).json(error);
    }
};

const login = (req, res) => {

    const { email, password } = req.body;

    // const user = await User.findOne({ where: { email: email } });
    /*
    if (!user) {
        return res.status(400).json({ message: 'Error usuario y/o contraseña' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ message: 'Error usuario y/o contraseña' });
    }

    const token = jwt.sign({id: user.id}, 'apikskcode') ;
    */
    // res.json({token:token}) ;
    res.json({'TravelTogetherToken':'funciona'}) ;

};

export { register, login };