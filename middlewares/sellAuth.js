const Joi = require('joi');


const sellItemValidation = (req, res, next) => {
    console.log('got the validaton ');
    const schema = Joi.object({
        
        itemname: Joi.string().min(1).max(100).required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().min(1).max(1000).required(),
        category: Joi.array().items(Joi.string()).required(),
        sellerid: Joi.string().required(), 
        sellquantity: Joi.number().min(1).max(100).required(),
    });

    console.log('verified');
    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            message: "Bad Request",
            error: error.details[0].message
        });
    }

    next();
};

module.exports = sellItemValidation;
