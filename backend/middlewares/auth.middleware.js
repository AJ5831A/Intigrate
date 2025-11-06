import { verifyToken } from "../utils/jwt.js";

export const auth = (req , res , next) =>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    try{
        req.user = verifyToken(token);
        next();
    }catch(err){
        return res.status(401).json({message:"Unauthorized"});
    }
}