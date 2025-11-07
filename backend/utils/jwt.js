import jwt from "jsonwebtoken";

export const createToken = (payload) =>{
    return jwt.sign(payload, "Hello" , {expiresIn : "15d"});
}

export const verifyToken = (token) => {
    return jwt.verify(token, "Hello")
};