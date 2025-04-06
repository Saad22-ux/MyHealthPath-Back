const bcrypt = require('bcrypt');
const User = require('../models/User');

//Login
exports.login = async (req,res)=>{
    const { email, password } = req.body;
    const user = await User.findOne({ where: {email} }); 

    if(!user) 
        return res.status(401).json({error: 'Invalid email'});
    
    const match = await bcrypt.compare(password, user.password);
    if(!match)
        res.status(401).json({error: 'Invalid password'});

    req.session.userId = user.id;
    res.json({message: 'Logged in'});
};