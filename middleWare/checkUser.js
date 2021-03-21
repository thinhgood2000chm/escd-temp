const jwt = require("jsonwebtoken");
const User = require('../models/User')

const  checkUser = ( req,res, next)=>{
    const token= req.cookies.jwt;
    if( token ){
        jwt.verify(token,'secrectValue', async (err, decode)=>{
            if(err){
                console.log(err.message);
                res.locals.user= null
                next()
            }
            else {
                console.log(decode);
                let user = await User.findById(decode.id)
                res.locals.user = user
                next()
            }
        })
    }
    else {
        res.locals.user= null
        next()
    }
}
module.exports= checkUser