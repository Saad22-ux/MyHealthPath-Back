const express = require("express");
const router = express.Router();
const validateRegister = require('../formValidator/medecinFormValidator');
const { createMedecin } = require('../Service/medecinService');

router.post('/register',async (req,res)=>{
    const medecinDTO = req.body;
    const validationErrors = validateRegister(medecinDTO);
    if(Object.keys(validationErrors).length >0){
        return res.status(400).json({ errors: validationErrors });
    }

    const result = await createMedecin(medecinDTO);

    if(result.success) {
        return res.status(201).json({ success: true, message: result.message });
    }
    else{
        return res.status(500).json({success: false,message: result.message});
    }
});

module.exports = router;